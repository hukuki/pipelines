import { UYAPBase64File } from "../legislation/interface";

interface UYAPPrecedentMetadata {
    documentId: string,
    itemType: {
        name:   string,
        description: string,
    },
    birimId: any,
    birimAdi: string,
    esasNoYil: number,
    esasNoSira: number,
    kararNoYil: number,
    kararNoSira: number,
    kararTuru: any,
    kararTarihi: string,
    kararTarihiStr: string,
    kesinlesmeDurumu: string,
    kararNo: string,
    esasNo: string    
};

interface PrecedentPaginationResponse {
    data: {
        emsalKararList: UYAPPrecedentMetadata[],
        total: number,
        start: number
    },
    // We disgard this part
    metadata: any
};

interface PrecedentResponse {
    data: UYAPBase64File,
    metadata: any
}

/*interface ArticleResponse {
    data: UYAPBase64File,
    metadata: any
}

interface UYAPBase64File {
    content: string,
    mimeType: string,
    version: string
}

interface CVClause {
    text: string, 
    numTokens:number
}

*/

export {UYAPPrecedentMetadata, PrecedentPaginationResponse, PrecedentResponse};