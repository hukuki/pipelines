import { UYAPLegislationMetadata } from "../interface";
import CVLegislationMetadata from '../legislation-metadata';

const map = (obj: UYAPLegislationMetadata) : CVLegislationMetadata => {
    return {
        title: obj.mevzuatAdi,

        attachments: obj.ekler || [],
        
        providerId: parseInt(obj.mevzuatId),

        // This mapping may be confusing. But in UYAP, they made this mistake of
        // writing update date to kayit tarihi field.
        providerUpdateDate: new Date(obj.kayitTarihi),
        
        legislationNumber: obj.mevzuatNo,
        
        legislationComposition: obj.mevzuatTertip,
        legislationType: obj.mevzuatTur,

        gazzetteNumber: obj.resmiGazeteSayisi ? parseInt(obj.resmiGazeteSayisi) : null,
        gazzetteDate: new Date(obj.resmiGazeteTarihi),
        
        repetitive: obj.mukerrer !== "HAYIR",
        url: obj.url
    };
}

export default map;