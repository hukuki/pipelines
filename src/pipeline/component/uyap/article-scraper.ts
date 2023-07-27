import { Pipeable } from "../../index";
import CVLegislationTree from "../../model/uyap/legislation-tree";

import  Requester from "../../request";
import { ArticleResponse, UYAPBase64File } from "../../request/interface";

import { CVBufferFile } from "../../interface";
import _ from "lodash";

class ArticleScraper extends Pipeable {
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
        
        console.log(prev.providerArticleId +" "+ prev.articleTitle + "\n" + bufferFile.content.toString() + "\n");

        this.next?.run(bufferFile);
    }
}

export default ArticleScraper;