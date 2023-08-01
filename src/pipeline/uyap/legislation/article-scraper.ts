import { Pipeable } from "../..";
import CVLegislationTree from "./model/legislation-tree";

import  Requester from "../../request";
import { ArticleResponse, UYAPBase64File } from "./interface";

import { CVBufferFile } from "../../interface";
import _ from "lodash";

class ArticleScraper extends Pipeable<CVLegislationTree, CVBufferFile> {
    private instance: Requester;

    private boilerplate = { "data": { "maddeId": "" }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }
   
    public async run(prev: CVLegislationTree): Promise<any> {
        if(!prev.providerArticleId) 
            throw new Error("Article id is not defined.");

        const id = prev.providerArticleId;
        const requestData = _.cloneDeep(this.boilerplate);
        requestData.data.maddeId = `${id}`;
        
        const response: ArticleResponse = await this.instance.post<ArticleResponse>("getDocument", requestData);
        const file: UYAPBase64File = response.data;
        
        const buffer = Buffer.from(file.content, "base64");

        const bufferFile : CVBufferFile = {
            filename: `${prev.providerArticleId}`, 
            content: buffer,
            mimeType: file.mimeType,
            version: file.version,
        };
        
        await this.next?.run(bufferFile);
    }
}

export default ArticleScraper;