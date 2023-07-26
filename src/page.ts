import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { writeFileSync } from "fs";

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

axios.defaults.baseURL = 'https://bedesten.adalet.gov.tr/mevzuat/';

interface LegislationTree {
    mongooseMapping: "lol",

    maddeId: string,
    maddeNo: null,
    title: string,
    description: string,
    maddeBaslik: string,
    mevzuatGerekceId: null,
    guncellemeTarihi: string,
    parentMaddeId: string,
    mevzuatId: string,
    content: null,
    children: LegislationTree
}

interface LegislationMetadata {
    mongooseMapping: "lol",

    mevzuatId: string,
    mevzuatNo: number,
    mevzuatAdi: string,
    mevzuatTur: {
        id: number,
        name: string,
        description: string,
        maddeSonuRegex: string
    },
    mevzuatTertip: number,
    kayitTarihi: string,
    guncellemeTarihi: any,
    resmiGazeteTarihi: string,
    resmiGazeteSayisi: string,
    url: string,
    mukerrer: string,
    ekler: any
};

interface PaginationResponse {
    data: {
        mevzuatList: LegislationMetadata[],
        total: number,
        start: number
    },
    // We disgard this part
    metadata: any
};

interface TreeResponse {
    data: LegislationTree
    metadata: any
}

abstract class Pipeable {

    protected next?: Pipeable;

    public abstract run(prev?: any): Promise<any>;

    constructor(next?: Pipeable) {
        this.next = next;
    }
}

class Fork extends Pipeable {

    private others: Pipeable[];

    constructor(next: Pipeable, ...args: Pipeable[]) {
        super(next);

        this.others = args;
    }

    public async run(prev?: any): Promise<any> {
        if(this.next)
            await this.next.run(prev);
        
        for (const next of this.others) {

            await next.run(prev);
        }
    }
}

class Collector extends Pipeable {

    private collector: Array<any> = [];

    constructor() {
        super();
    }

    public async run(prev?: any, next?: Pipeable): Promise<any> {
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

    constructor(next?: Pipeable) {
        super(next);
        this.instance = Requester.instance;
    }

    async run(prev?: any): Promise<any> {
        if(!this.next) return;

        const numTotalItems = await this.getTotalItems();
        const numPages = Math.ceil(numTotalItems / this.pageSize);

        for (let i = 1; i < 2; i++) {
            const page: LegislationMetadata[] = await this.scrapePage(i);

            for await (const legislation of page) {
                await this.next.run(legislation);
            }
        }
    }

    private async scrapePage(pageNumber: number): Promise<LegislationMetadata[]> {
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

    constructor(next?: Pipeable) {
        super(next);

        this.instance = Requester.instance;
    }

    public async run(prev: LegislationMetadata, next?: Pipeable): Promise<any> {
        if(!this.next) return;
        
        const id = prev.mevzuatId;
        const requestData = { ...this.boilerplate };
        requestData.data.mevzuatId = id;

        const response = await this.instance.post<TreeResponse>("mevzuatMaddeTree", requestData);

        if(response.data)
            this.next.run(response.data);
    }
}

class MongoSaver extends Pipeable {

    constructor() { super(); }
    
    public async run(prev: any) : Promise<any>{
        return;
    }
}

class Requester {

    private static __singleton__: Requester = new Requester();

    private axios: AxiosInstance;
    private blocked: boolean = false;

    private constructor() {
        this.axios = axios.create(
            { headers: { "Content-Type": "application/json" } }
        );
    }

    static get instance() {
        return Requester.__singleton__;
    }

    async post<T>(url: string, data?: any, config?: AxiosRequestConfig<any>): Promise<T> {
        if (this.blocked) {
            await sleep(1000);
        }

        while (true) {
            try {
                const response = await this.axios.post<T>(url, data, config);
                this.blocked = false;

                return response.data;
            }
            catch (error) {
                if (error.response.status != 429) throw Error(error.message);
                console.log("Too many requests. Waiting.")

                this.blocked = true;

                await sleep(1000);
            }
        }
    }

    block(): void {
        this.blocked = true;
    }
}

export {};