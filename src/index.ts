import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import CVLegislationTree from "./pipeline/uyap/legislation/model/legislation-tree";
import pipeline from './pipeline';
import MongoIterator from "./pipeline/base/mongo-iterate";
import ContentPopulator from "./pipeline/uyap/legislation/combine/content-populator";
import FSSaver, { FSSaverMode } from './pipeline/base/fs-saver';


connection.once('open', async () => {
    const pipe = pipeline(
        new MongoIterator({from: CVLegislationTree}),
        new ContentPopulator({
            bucket: "casevisor-legislation", 
            folder: "article/raw"
        }),
        new FSSaver({
            folder: "__s3__/article/json",
            nameKey: "providerLegislationId",
            as: FSSaverMode.JSON
        })
    );

    await pipe.run({providerLegislationId: 103107});
});