import { Pipeable } from "../../..";
import CVLegislationTree from "../model/legislation-tree";
import { getFile } from "../../../../storage/s3";
import { format } from "path";
const { convert } = require('html-to-text');

type CVLegislationOutput = {
    providerArticleId: number | null,
    articleNumber: number | null,
    
    title: string | null,
    description: string | null,
    
    articleTitle: string | null,
    providerReasonId: string | null,
    
    providerUpdateDate: Date | null,
    providerParentId: number | null,

    providerLegislationId: number,
    children: CVLegislationOutput[],
    content: string | null
};

/** 
 *  @description This class is used to walk through the tree and return the leaves.
 *  Gets the root node, passes leaf nodes to the pipeline. CVLegislationTree -> CVLegislationTree
*/
class ContentPopulator extends Pipeable<CVLegislationTree, CVLegislationOutput> {

    private bucket: string;
    private folder: string;

    constructor({ bucket, folder }: { bucket: string, folder: string }) {
        super();
        this.bucket = bucket;
        this.folder = folder;
    }

    public async run(prev: CVLegislationTree) {
        const out = this.convertToOutput(prev);

        await this.traverse(out);

        await this.next?.run(out);
    }

    private async traverse(prev: CVLegislationOutput) {
        for (let child of prev.children) {
            await this.traverse(child);
        }

        if (prev.children.length === 0 && prev.providerArticleId !== null){
            const file = await getFile({ 
                    bucket: this.bucket, 
                    filename: this.folder + "/" + prev.providerArticleId.toString() 
                });
            if (!file) return;
            const fileStr = file.toString('utf-8');
            const text = this.processHtml(fileStr, [prev.articleTitle || ""]); 
            prev.content = text;
        }
    }


    private processHtml(html: string, removeList: string[]) {
        let text : string = convert(html, {
            preserveNewlines: false,
            trimEmptyLines: true,
            wordwrap: false,
            selectors: [
                { 
                    selector: 'table', 
                    format: 'skip' 
                },
                {
                    selector: 'b',
                    format: 'skip',
                },
                {
                    selector: 'a',
                    format: 'skip'
                },
                {
                    selector: 'i',
                    format: 'skip'
                },
                {
                    selector: 'img',
                    format: 'skip'
                },
                {
                    selector: 'b',
                    format: 'skip'
                },
                {
                    selector: 'strong',
                    format: 'skip'
                }
            ]
        });

        let pieces = text.split(/\n+/);
        pieces = pieces.filter(piece => piece.length > 0);

        text = pieces.join("\n");

        // for (const remove of removeList) {
        //     text = text.replace(remove, "");
        // }

        return text;
    }

    private convertToOutput(prev: CVLegislationTree): CVLegislationOutput {
        return {
            providerArticleId: prev.providerArticleId,
            articleNumber: prev.articleNumber,
            title: prev.title,
            description: prev.description,
            articleTitle: prev.articleTitle,
            providerReasonId: prev.providerReasonId,
            providerUpdateDate: prev.providerUpdateDate,
            providerParentId: prev.providerParentId,
            providerLegislationId: prev.providerLegislationId,
            children: prev.children.map(child => this.convertToOutput(child)),
            content: ""
        };
    }
}

export default ContentPopulator;