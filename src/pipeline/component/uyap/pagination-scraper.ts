import { Pipeable } from "../../index";
import Requester from "../../request";
import { UYAPLegislationMetadata, PaginationResponse } from "../../request/interface";
import CVLegislationMetadata from '../../model/uyap/legislation-metadata';
import _ from "lodash";

class PaginationScraper extends Pipeable {
    private instance: Requester;

    private pageSize = 20;
    private boilerplate = { "data": { "pageSize": this.pageSize, "pageNumber": 1, "mevzuatTurList": ["KANUN", "CB_KARARNAME", "YONETMELIK", "CB_YONETMELIK", "CB_KARAR", "CB_GENELGE", "KHK", "TUZUK", "KKY", "UY", "TEBLIGLER"] }, "applicationName": "UyapMevzuat" };

    constructor() {
        super();

        this.instance = Requester.instance;
    }

    public async run(prev?: any): Promise<any> {
        const numTotalItems = await this.getTotalItems();
        const numPages = Math.ceil(numTotalItems / this.pageSize);

        for (let i = 1; i < 2; i++) {
            const page: UYAPLegislationMetadata[] = await this.scrapePage(i);
            console.log("damn");
            console.log(page.length);
            
            await Promise.all(
                page.map(async legislation => {
                    const out = this.convertToOutputFormat(legislation);

                    return this.next?.run(out);
                })
            );
        }
    }

    private async scrapePage(pageNumber: number): Promise<UYAPLegislationMetadata[]> {
        const requestBody = _.cloneDeep(this.boilerplate);
        requestBody.data.pageNumber = pageNumber;

        const pagination = await this.instance.post<PaginationResponse>("searchDocuments", requestBody);

        return pagination.data.mevzuatList;
    }

    private async getTotalItems(): Promise<number> {
        const response = await this.instance.post<PaginationResponse>("searchDocuments", this.boilerplate);
        const data = response.data;

        return data.total;
    }

    private convertToOutputFormat(obj: UYAPLegislationMetadata): CVLegislationMetadata {
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
    };
}

export default PaginationScraper;