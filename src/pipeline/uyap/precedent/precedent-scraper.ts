import { Pipeable } from "../..";
import CVLegislationTree from "./model/legislation-tree";

import  Requester from "../../request";
import { PrecedentResponse } from "./interface";
import { UYAPBase64File } from "../legislation/interface";

import { CVBufferFile } from "../../interface";
import _ from "lodash";
import CVPrecedentMetadata from './model/legislation-metadata';

class PrecedentScraper extends Pipeable<CVLegislationTree, CVBufferFile> {
    private instance: Requester;

    private boilerplate = { "data": { "documentId": "" }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }
   
    public async run(prev: CVPrecedentMetadata): Promise<any> {
        if(!prev.providerId) 
            throw new Error("Precedent id is not defined.");

        const id = prev.providerId;
        const requestData = _.cloneDeep(this.boilerplate);
        requestData.data.documentId = `${id}`;
        
        const response: PrecedentResponse = await this.instance.post<PrecedentResponse>("emsal-karar/getDocumentContent", requestData);
        const file: UYAPBase64File = response.data;
        
        const buffer = Buffer.from(file.content, "base64");

        const bufferFile : CVBufferFile = {
            filename: `${prev.providerId}`, 
            content: buffer,
            mimeType: file.mimeType,
            version: file.version,
            metadata: prev
        };
        
        await this.next?.run(bufferFile);
    }
}

export default PrecedentScraper;