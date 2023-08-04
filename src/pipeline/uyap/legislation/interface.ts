interface UYAPLegislationTreeNode {
    maddeId: string,
    maddeNo: number | null,
    title: string,
    description: string,
    maddeBaslik: string,
    mevzuatGerekceId: null,
    guncellemeTarihi: string,
    parentMaddeId: string,
    mevzuatId: string,
    content: null,
    children: UYAPLegislationTreeNode[]
};

interface UYAPLegislationMetadata {
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
    ekler: string[]
};

interface PaginationResponse {
    data: {
        mevzuatList: UYAPLegislationMetadata[],
        total: number,
        start: number
    },
    // We disgard this part
    metadata: any
};

interface TreeResponse {
    data: UYAPLegislationTreeNode
    metadata: any
}

interface ArticleResponse {
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


export {UYAPLegislationMetadata, UYAPLegislationTreeNode, PaginationResponse, TreeResponse, ArticleResponse, UYAPBase64File, CVClause};