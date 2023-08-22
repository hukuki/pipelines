/*
import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import CVLegislationTree from "./pipeline/uyap/legislation/model/legislation-tree";
import pipeline from './pipeline';
import MongoIterator from "./pipeline/base/mongo-iterate";
import ContentPopulator from "./pipeline/uyap/legislation/combine/content-populator";
import FsJsonSaver from "./pipeline/uyap/legislation/combine/fs-json-saver";
import HtmlToText from "./pipeline/uyap/legislation/html-to-text";

connection.once('open', async () => {
    const pipe = pipeline(
        new MongoIterator({from: CVLegislationTree}),

        new ContentPopulator({
            bucket: "casevisor-legislation", 
            folder: "article/raw"
        }),
        
        new FsJsonSaver({folder: "__s3__/article/json"})
    );
        
    await pipe.run();//{providerLegislationId: 103107});
});

*/