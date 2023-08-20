import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";
import pipeline from './pipeline';
import TreeWalker from "./pipeline/uyap/legislation/tree-walker";
import FSSaver from "./pipeline/base/fs-saver";
import HtmlToText from './pipeline/uyap/legislation/html-to-text';
import FSLoader from './pipeline/base/fs-loader';
import Fallback from './pipeline/base/fallback';
import AlphaParser from './pipeline/uyap/legislation/alpha-parser';
import NaiveParser from './pipeline/uyap/legislation/naive-parser';
import CVLegislationTree from './pipeline/uyap/legislation/model/legislation-tree';
import Merge from "./pipeline/base/merge";
import CVLegislationMetadata from './pipeline/uyap/legislation/model/legislation-metadata';
import MongoFinder from "./pipeline/base/mongo-find";
import Map from "./pipeline/base/map";
import { ParserOutput } from "./pipeline/uyap/legislation/parser";

connection.once('open', async () => {
    const pipe = pipeline(
        new TreeWalker(),

        new FSLoader({
            folder: '__s3__/article/raw',
            nameKey: 'providerArticleId'
        }),

        new HtmlToText(),

        new Fallback([
            new AlphaParser(),
            new NaiveParser(),
        ], { verbose: false }),

        new Merge<ParserOutput>({
            nodes: [
                new Map((doc) => (doc?.content) || ""),
                new Map((doc) => (doc?.metadata) || {}),
                new MongoFinder({
                    from: CVLegislationMetadata,
                    key: "metadata.providerLegislationId",
                    documentKey: "providerId",
                    cache: true,
                }),
            ],
            keys: ["content", "metadata.article", "metadata.legislation"]
        }),

        new Map((doc: any) => (
            {
                filename: doc?.metadata?.article?.providerArticleId + "-" + Math.random().toString(36).substring(7) + ".json",
                content: Buffer.from(JSON.stringify(doc))
            }
        )),
        new FSSaver({
            folder: '__s3__/article/parsed-newest',
        }),
    );

    for await (const item of CVLegislationTree.find({}, {timeout: false})) {
        await pipe.run(item);
    }
    /*
    const pipe = pipeline(
        new PrecedentPaginationScraper(),
        new MongoSaver({
            as: CVPrecedentMetadata
        })
    )
    */
    await pipe.run();

    await connection.close();
});
