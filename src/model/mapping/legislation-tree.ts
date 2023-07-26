import { UYAPLegislationTreeNode } from "../interface";
import CVLegislationTree from "../legislation-tree";

const map = (obj: UYAPLegislationTreeNode) : CVLegislationTree => {
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
        children: obj.children.map(c=>map(c))
    };
}

export default map;