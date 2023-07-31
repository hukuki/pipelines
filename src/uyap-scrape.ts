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

        
    }
}

export default UYAPScrapePipeline;