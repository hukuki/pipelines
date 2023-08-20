import { Pipeable } from "../..";
import Requester from "../../request";
import _ from "lodash";
import CVPrecedentMetadata from "./model/legislation-metadata";
import { UYAPPrecedentMetadata, PrecedentPaginationResponse } from "./interface";
import { isValidDate } from '../../../util';

class PrecedentPaginationScraper extends Pipeable<never, CVPrecedentMetadata> {
    private instance: Requester;

    private from: number;
    private to: number;

    private pageSize = 20;
    private boilerplate = { "data": { "pageSize": this.pageSize, "pageNumber": 1, "itemTypeList": ["YARGITAYKARARI", "DANISTAYKARARI", "YERELHUKUK", "ISTINAFHUKUK"] }, "applicationName": "UyapMevzuat" };

    private monitoring = { donePages: 0 };

    constructor({ from = 1, to = -1 }: { from: number, to: number } = { from: 1, to: -1 }) {
        super();

        this.from = from;
        this.to = to;
        this.instance = Requester.instance;

        console.log("KYB eksik unutma");
    }

    public async run(prev?: any): Promise<any> {

        if (this.to === -1) {
            const numTotalItems = await this.getTotalItems();
            this.to = Math.ceil(numTotalItems / this.pageSize) + 1;
        }

        const chunkSize = 10;
        let chunks = [];

        for (let i = this.from; i < this.to; i++) {
            if (chunks.length === chunkSize) {
                await Promise.all(chunks);
                chunks = [];
            }

            chunks.push(this.scrapePage(i).then(async page => {
                for (const precedent of page) {
                    const out = this.convertToOutputFormat(precedent);
                    await this.next?.run(out);
                }
            })
            );
        }
    }

    private async scrapePage(pageNumber: number): Promise<UYAPPrecedentMetadata[]> {
        const requestBody = _.cloneDeep(this.boilerplate);
        requestBody.data.pageNumber = pageNumber;

        const pagination = await this.instance.post<PrecedentPaginationResponse>("emsal-karar/searchDocuments", requestBody) as PrecedentPaginationResponse;

        return pagination.data.emsalKararList;
    }

    private async getTotalItems(): Promise<number> {
        const response = await this.instance.post<PrecedentPaginationResponse>("emsal-karar/searchDocuments", this.boilerplate);
        const data = response.data;

        return data.total;
    }

    private convertToOutputFormat(obj: UYAPPrecedentMetadata): CVPrecedentMetadata {
        return {
            providerId: parseInt(obj.documentId),
            precedentType: obj.itemType,

            organizationName: obj.birimAdi,
            basisNumberYear: obj.esasNoYil,
            basisNumberSerial: obj.esasNoSira,

            decisionNumberYear: obj.kararNoYil,
            decisionNumberSerial: obj.kararNoSira,

            decisionDate: isValidDate(new Date(obj.kararTarihi)) ? new Date(obj.kararTarihi) : new Date(+0),
            status: obj.kesinlesmeDurumu,
            decisionNumber: obj.kararNo,
            basisNumber: obj.esasNo
        };
    };
}

export default PrecedentPaginationScraper;