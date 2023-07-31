import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";

import Pipeline from './pipeline/index';
import S3Saver from "./pipeline/component/s3-saver";
import CVLegislationTree from "./pipeline/model/uyap/legislation-tree";
import ArticleScraper from "./pipeline/component/uyap/article-scraper";
import TreeWalker from "./pipeline/component/uyap/tree-walker"; 
import fs from 'fs';

connection.once('open', async () => {
    const pipeline = new Pipeline();
    
    /*
    pipeline.add(new PaginationScraper({
        from: 1,
        to: 857
    }));

    pipeline.add(new MongoSaver({
        as: CVLegislationMetadata
    }));
    */
    
    /*
    pipeline.add(new TreeScraper());

    pipeline.add(new MongoSaver({
        as: CVLegislationTree
    }));
 */
    pipeline.add(new TreeWalker());
    
    pipeline.add(new ArticleScraper());

    pipeline.add(new S3Saver({
        bucket: "casevisor-legislation",
        nameKey: "filename",
        contentKey: "content",
        folder: "article/raw",
    }));

    //pipeline.add(new ExtractText());
    /*
    pipeline.add(new S3Saver({
        bucket: "casevisor-legislation",
        nameKey: "filename",
        contentKey: "content",
        folder: "article/clean",
    }));
    */

    /*
    const cursor = CVLegislationTree.find({
        articleNumber: null,
        providerParentId: -1,
    }).cursor({batchSize: 10});

    cursor.on('data', async (doc)=>{
        await pipeline.run(doc);
    });*/

    const batchSize = 5;
    for(let i = 2; true ; i++)
    {
        const docs = await CVLegislationTree.find({}).skip(i*batchSize).limit(batchSize);

        if(docs.length === 0) break;

        console.log(i*batchSize);

        await Promise.all(docs.map(d => pipeline.run(d)));
        fs.writeFileSync("checkpoint", "checkpoint::pagenumber " + i);
    }
});