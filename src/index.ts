import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import CVLegislationTree from "./pipeline/uyap/legislation/model/legislation-tree";
import pipeline from './pipeline';
import MongoIterator from "./pipeline/base/mongo-iterate";
import ContentPopulator from "./pipeline/uyap/legislation/combine/content-populator";
import FsJsonSaver from "./pipeline/uyap/legislation/combine/fs-json-saver";
import HtmlToText from "./pipeline/uyap/legislation/html-to-text";
import CVPrecedentMetadata from './pipeline/uyap/precedent/model/legislation-metadata';
import PrecedentScraper from "./pipeline/uyap/precedent/precedent-scraper";
import FSSaver, { FSSaverMode } from './pipeline/base/fs-saver';

connection.once('open', async () => {
    const pipe = pipeline(
        new MongoIterator({from : CVPrecedentMetadata}),
        new PrecedentScraper(),
        new FSSaver({
            folder: "__s3__/precedent",
            nameKey: `metadata.providerId`,
            contentKey: "content",
            as: FSSaverMode.TEXT
        })
    );

    await pipe.run();
});
