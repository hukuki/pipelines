import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import pipeline from './pipeline';
import PaginationScraper from './pipeline/uyap/legislation/pagination-scraper';
import TreeScraper from './pipeline/uyap/legislation/tree-scraper';
import TreeWalker from "./pipeline/uyap/legislation/tree-walker";
import FSSaver from "./pipeline/base/fs-saver";
import ArticleScraper from './pipeline/uyap/legislation/article-scraper';


connection.once('open', async () => {
    const pipe = pipeline(
        new PaginationScraper(),
        new TreeScraper(),
        new TreeWalker(),
        new ArticleScraper(),
        new FSSaver({
            folder: "dummy"
        })
    );

    await pipe.run();
    await connection.close();
});