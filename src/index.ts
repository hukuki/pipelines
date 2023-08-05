import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import pipeline from './pipeline';
import PaginationScraper from './pipeline/uyap/legislation/pagination-scraper';
import TreeScraper from './pipeline/uyap/legislation/tree-scraper';
import TreeWalker from "./pipeline/uyap/legislation/tree-walker";
import FSSaver from "./pipeline/base/fs-saver";
import ArticleScraper from './pipeline/uyap/legislation/article-scraper';
import HtmlToText from './pipeline/uyap/legislation/html-to-text';
import FSLoader from './pipeline/base/fs-loader';
import Fallback from './pipeline/base/fallback';
import AlphaParser from './pipeline/uyap/legislation/alpha-parser';
import NaiveParser from './pipeline/uyap/legislation/naive-parser';


connection.once('open', async () => {
    const pipe = pipeline(
        new FSLoader({
            folder: '__s3__/article/raw'
        }),
        new HtmlToText(),
        new Fallback([
            new AlphaParser(),
            new NaiveParser(),
        ], {verbose: true})
    );

    await pipe.run();
    await connection.close();
});