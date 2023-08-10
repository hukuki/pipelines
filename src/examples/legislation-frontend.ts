/*
import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import CVLegislationTree from "./pipeline/uyap/legislation/model/legislation-tree";
import pipeline from './pipeline';
import ConsoleLog from "./pipeline/base/console-log";
import MongoIterator from "./pipeline/base/mongo-iterate";
import ContentPopulator from "./pipeline/uyap/legislation/combine/content-populator";
import FsJsonSaver from "./pipeline/uyap/legislation/combine/fs-json-saver";
import Map from "./pipeline/base/map";
import TreeMapper from "./pipeline/uyap/legislation/tree-mapper";


connection.once('open', async () => {
    const pipe = pipeline(
        new MongoIterator({from: CVLegislationTree}),
      
        new ContentPopulator({
            bucket: "casevisor-legislation", 
            folder: "article/raw"
        }),
     
        new FsJsonSaver({folder: "article/json"})
    );

    await pipe.run();//{providerLegislationId: 103107});
});

*/