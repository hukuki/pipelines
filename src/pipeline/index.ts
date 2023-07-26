import { UYAPLegislationMetadata, PaginationResponse, CVBufferFile, TreeResponse, UYAPLegislationTreeNode, ArticleResponse, UYAPBase64File } from "../model/interface";
import Requester from './request';
import { Model } from 'mongoose';
import CVLegislationMetadata from '../model/legislation-metadata';
import CVLegislationTree from '../model/legislation-tree';
import { uploadFile } from '../storage/s3';
import _ from 'lodash';

class Pipeline {
    private nodes: (Pipeable)[] = [];

    public add(node: Pipeable) {
        if (this.nodes.length !== 0)
            this.nodes[this.nodes.length - 1].next = node;

        this.nodes.push(node);
    }

    public async run() {
        if (this.nodes.length == 0) return;

        const firstNode = this.nodes[0];

        await firstNode.run();
    }
}

abstract class Pipeable {

    private _next?: Pipeable;

    public abstract run(prev?: any): Promise<any>;

    constructor(next?: Pipeable) {
        this._next = next;
    }

    public set next(next: Pipeable | undefined) {
        this._next = next;
    }

    public get next(): Pipeable | undefined {
        return this._next;
    }
}

class Fork extends Pipeable {

    private others: Pipeable[];

    constructor(next: Pipeable, ...args: Pipeable[]) {
        super(next);

        this.others = args;
    }

    public async run(prev?: any): Promise<any> {
        if (this.next)
            await this.next.run(prev);

        for (const next of this.others) {
            await next.run(prev);
        }
    }

    public add(node: Pipeable) {
        this.others.push(node);
    }
}

class Collector extends Pipeable {

    private collector: Array<any> = [];

    constructor() {
        super();
    }

    public async run(prev?: any): Promise<any> {
        this.collector.push(prev);
    }

    public get result() {
        return this.collector;
    }
}

class PaginationScraper extends Pipeable {
    private instance: Requester;

    private pageSize = 20;
    private boilerplate = { "data": { "pageSize": this.pageSize, "pageNumber": 1, "mevzuatTurList": ["KANUN", "CB_KARARNAME", "YONETMELIK", "CB_YONETMELIK", "CB_KARAR", "CB_GENELGE", "KHK", "TUZUK", "KKY", "UY", "TEBLIGLER"] }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }

    async run(prev?: any): Promise<any> {
        if (!this.next) return;

        const numTotalItems = await this.getTotalItems();
        const numPages = Math.ceil(numTotalItems / this.pageSize);

        for (let i = 1; i < 2; i++) {
            const page: UYAPLegislationMetadata[] = await this.scrapePage(i);

            for (const legislation of page) {
                await this.next.run(legislation);
            }
        }
    }

    private async scrapePage(pageNumber: number): Promise<UYAPLegislationMetadata[]> {
        const requestBody = { ...this.boilerplate };
        requestBody.data.pageNumber = pageNumber;

        const pagination = await this.instance.post<PaginationResponse>("searchDocuments", requestBody);

        return pagination.data.mevzuatList;
    }

    private async getTotalItems(): Promise<number> {
        const response = await this.instance.post<PaginationResponse>("searchDocuments", this.boilerplate);
        const data = response.data;

        return data.total;
    }
}

class TreeScraper extends Pipeable {
    private instance: Requester;

    private boilerplate = { "data": { "mevzuatId": "103107" }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }

    public async run(prev: CVLegislationMetadata): Promise<any> {
        if (!this.next) return;

        const id = prev.providerId;
        const requestData = { ...this.boilerplate };
        requestData.data.mevzuatId = `${id}`;

        const response = await this.instance.post<TreeResponse>("mevzuatMaddeTree", requestData);

        if (response.data)
            this.next.run(response.data);
    }
}

/** 
 *  @description This class is used to walk through the tree and return the leaves.
*/
class TreeWalker extends Pipeable {

    public async run(prev: CVLegislationTree) {
        for (const child of prev.children) {
            await this.run(child);
        }
        
        if (prev.children.length == 0){
            this.next?.run(prev);
        }
    }
}

class MongoSaver extends Pipeable {
    private model: Model<any>;

    constructor(config: { as: Model<any> }) {
        super();

        this.model = config.as;
    }

    public async run(prev: any): Promise<any> {
        await this.model.create(prev);

        if (this.next)
            this.next.run(prev);
    }
}

class ArticleScraper extends Pipeable {
    private instance: Requester;

    private boilerplate = { "data": { "maddeId": "103107" }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }

    public async run(prev: CVLegislationTree): Promise<any> {
        if(!this.next) return;
        
        const id = prev.providerArticleId;
        const requestData = { ...this.boilerplate };
        requestData.data.maddeId = `${id}`;

        const response: ArticleResponse = await this.instance.post<ArticleResponse>("getDocument", requestData);
        const file: UYAPBase64File = response.data;
        
        const buffer = Buffer.from(file.content, "base64");

        if(!prev.providerArticleId) 
            throw new Error("Article id is not defined.");

        const bufferFile : CVBufferFile = { 
            filename: `${prev.providerArticleId}`, 
            content: buffer,
            mimeType: file.mimeType,
            version: file.version,
        };

        this.next.run(bufferFile);
    }
}

class Map extends Pipeable {
    private map: Function;

    constructor(map: Function) {
        super();

        this.map = map;
    }

    public async run(prev: any): Promise<any> {
        const out = await this.map(prev);

        if (this.next)
            this.next.run(out);
    }
}

class S3Saver extends Pipeable {

    private bucket: string;
    private folder: string;
    private nameKey: string;
    private contentKey: string;

    constructor({ bucket, nameKey, contentKey, folder }: { bucket: string, nameKey: string, contentKey: string, folder: string }) {
        super();

        this.bucket = bucket;
        this.folder = folder;
        this.nameKey = nameKey;
        this.contentKey = contentKey;
    }

    public async run(prev: any): Promise<any> {
        if (!prev[this.nameKey] || !prev[this.contentKey])
            throw Error(`Key ${this.nameKey} or ${this.contentKey} not found in object ${JSON.stringify(prev)}`);

        
        await uploadFile({
            bucket: this.bucket,
            filename: this.folder + "/" + _.get(prev, this.nameKey),
            content: _.get(prev, this.contentKey),
        });

        this.next?.run(prev);
    }
}

export { Collector, Fork, PaginationScraper, MongoSaver, TreeScraper, Pipeline, TreeWalker, Map, S3Saver, ArticleScraper };