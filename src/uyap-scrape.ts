import Pipeline from "./pipeline/index";
import S3Saver from "./pipeline/component/s3-saver";
import MongoSaver from "./pipeline/component/mongo-saver";

import Map from "./pipeline/component/map";
import PaginationScraper from './pipeline/component/uyap/pagination-scraper';
import TreeScraper from './pipeline/component/uyap/tree-scraper';
import TreeWalker from "./pipeline/component/uyap/tree-walker";
import ArticleScraper from './pipeline/component/uyap/article-scraper';
import CVLegislationMetadata from "./pipeline/model/uyap/legislation-metadata";
import CVLegislationTree from "./pipeline/model/uyap/legislation-tree";


/**
 * This class is used to scrape the UYAP website.
 */

class UYAPScrapePipeline extends Pipeline {

    constructor() {
        super();

        this.add(new Map((prev: any) => {
            return prev;
        }));

        this.add(new PaginationScraper());

        this.add(new MongoSaver({
            as: CVLegislationMetadata
        }));
        
        this.add(new TreeScraper());

        this.add(new MongoSaver({
            as: CVLegislationTree
        }));
        this.add(new TreeWalker());

        this.add(new ArticleScraper());
        
        this.add(new S3Saver({
            bucket: "casevisor-legislation",
            nameKey: "filename",
            contentKey: "content",
            folder: "article/raw",
        }));
    }
}

export default UYAPScrapePipeline;