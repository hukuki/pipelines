import dotenv from "dotenv";
dotenv.config();
import connection from "./db";

import { Pipeline, Collector, MongoSaver, Fork, TreeScraper, PaginationScraper, Map, TreeWalker, ArticleScraper, S3Saver } from "./pipeline/index";

import mapLegislationMetadata from "./model/mapping/legislation-metadata";
import mapLegislationTree from "./model/mapping/legislation-tree";
import CVLegislationMetadata from "./model/legislation-metadata.js";
import CVLegislationTree from "./model/legislation-tree";

connection.once('open', async () => {
    //await connection.dropCollection('metadata');
    //await connection.dropCollection('tree');

    // Build the pipeline
    const pipeline = new Pipeline();

    pipeline.add(new PaginationScraper());
    
    pipeline.add(new Map(mapLegislationMetadata));
    
    //pipeline.add(new MongoSaver({
    //    as: CVLegislationMetadata
    //}));

    pipeline.add(new TreeScraper());

    pipeline.add(new Map(mapLegislationTree));
    
    //pipeline.add(new MongoSaver({
    //    as: CVLegislationTree
    //}));

    pipeline.add(new TreeWalker());

    pipeline.add(new ArticleScraper());
    
    pipeline.add(new S3Saver({
        bucket: "casevisor-legislation",
        nameKey: "filename",
        contentKey: "content",
        folder: "article",
    }));

    // Run the pipeline
    await pipeline.run();
    
    connection.close();
});
