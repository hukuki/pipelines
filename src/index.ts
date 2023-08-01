import dotenv from "dotenv";
dotenv.config();

import connection from "./storage/db";

import pipeline from './pipeline/index';
import S3Saver from "./pipeline/component/s3-saver";
import S3Loader from "./pipeline/component/s3-loader";
import TextExtractor from './pipeline/component/uyap/text-extractor';
import FSLoader from './pipeline/component/fs-loader';

connection.once('open', async () => {
    const pipe = pipeline(
        new FSLoader({
            folder: '__s3__/article/raw'
        }),
        new TextExtractor(),
        /*
        new S3Saver({
            bucket: "casevisor-legislation",
            folder: "article/clean",
            nameKey: "filename",
            contentKey: "content",
        }),*/
    );

    await pipe.run();
});