import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";

import pipeline from './pipeline';
import TextExtractor from './pipeline/uyap/legislation/text-extractor';

import FSLoader from './pipeline/base/fs-loader';
import S3Saver from "./pipeline/base/s3-saver";

connection.once('open', async () => {
    const pipe = pipeline(
        new FSLoader({
            folder: '__s3__/article/raw'
        }),
        new TextExtractor(),
        new S3Saver({
            bucket: "casevisor-legislation",
            folder: "article/clean",
            nameKey: "filename",
            contentKey: "content",
        }),
    );

    await pipe.run();
});