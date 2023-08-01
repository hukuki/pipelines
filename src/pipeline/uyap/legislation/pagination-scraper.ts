import { Pipeable } from "../..";
import Requester from "../../request";
import { UYAPLegislationMetadata, PaginationResponse } from "./interface";
import CVLegislationMetadata from './model/legislation-metadata';
import _ from "lodash";

class PaginationScraper extends Pipeable<never, CVLegislationMetadata> {
    private instance: Requester;

    private from: number;
    private to: number;

    private pageSize = 20;
    private boilerplate = { "data": { "pageSize": this.pageSize, "pageNumber": 1, "mevzuatTurList": ["KANUN", "CB_KARARNAME", "YONETMELIK", "CB_YONETMELIK", "CB_KARAR", "CB_GENELGE", "KHK", "TUZUK", "KKY", "UY", "TEBLIGLER"] }, "applicationName": "UyapMevzuat" };

    private monitoring = { donePages: 0 };

    constructor({from = 1, to = -1}: {from: number, to: number} = {from: 1, to: -1}) {
        super();

        this.from = from;
        this.to = to;
        this.instance = Requester.instance;
    }

    public async run(prev?: any): Promise<any> {
                
        if(this.to === -1){
            const numTotalItems = await this.getTotalItems();
            this.to = Math.ceil(numTotalItems / this.pageSize) + 1;
        }

        const promises = [];
        for (let i = this.from; i < this.to; i++) {
                            promises.push(this.scrapePage(i)
                                        .then(page =>
                                                    Promise.all(
                                                        page.map(async legislation => {
                                                            const out = this.convertToOutputFormat(legislation);
                                                            await this.next?.run(out);
                                                            return 
                                                        })
                                                    )
                            ));
        }
        await Promise.all(promises);
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