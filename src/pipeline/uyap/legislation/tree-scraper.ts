import { Pipeable } from "../..";

import Requester from "../../request";
import { TreeResponse, UYAPLegislationTreeNode } from "./interface";
import CVLegislationMetadata from "./model/legislation-metadata";
import CVLegislationTree from "./model/legislation-tree";
import _ from "lodash";

class TreeScraper extends Pipeable<CVLegislationMetadata, CVLegislationTree> {
    private instance: Requester;

    private boilerplate = { "data": { "mevzuatId": "103107" }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }

    public async run(prev: CVLegislationMetadata): Promise<any> {
        const id = prev.providerId;
        const requestData = _.cloneDeep(this.boilerplate);
        requestData.data.mevzuatId = `${id}`;

        const response = await this.instance.post<TreeResponse>("mevzuatMaddeTree", requestData);
        
        if (response.data) {
            const out = this.convertToOutputFormat(response.data);
            
            await  this.next?.run(out);
        } else {
            console.log(response);
        }
    }

    private convertToOutputFormat(obj: UYAPLegislationTreeNode) : CVLegislationTree {
        return {
            providerArticleId: obj.maddeId ? parseInt(obj.maddeId) : null,
            articleNumber: obj.maddeNo,
            title: obj.title,
            description: obj.description,
        
            articleTitle: obj.maddeBaslik,
            providerReasonId: obj.mevzuatGerekceId,
             
            providerUpdateDate: obj.guncellemeTarihi ? new Date(obj.guncellemeTarihi) : null,
            providerParentId: parseInt(obj.parentMaddeId),
    
            providerLegislationId: parseInt(obj.mevzuatId),
            children: obj.children.map(c => this.convertToOutputFormat(c))
        };
    }
}

export default TreeScraper;