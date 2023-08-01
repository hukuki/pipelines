import _ from "lodash";
import { uploadFile } from "../../storage/s3";
import { Pipeable } from "../index";
import { RateLimiter } from 'limiter';
import { InputType } from "zlib";

class S3Saver extends Pipeable<InputType, InputType> {

    private bucket: string;
    private folder: string;
    private nameKey: string;
    private contentKey: string;
    private limiter : RateLimiter;
    private count = 0;

    constructor({ bucket, nameKey, contentKey, folder }: { bucket: string, nameKey: string, contentKey: string, folder: string }) {
        super();

        this.bucket = bucket;
        this.folder = folder;
        this.nameKey = nameKey;
        this.contentKey = contentKey;
        this.limiter = new RateLimiter({
            tokensPerInterval: 1000,
            interval: 1000
        });
    }

    public async run(prev: any): Promise<any> {
        if (!prev[this.nameKey] || !prev[this.contentKey])
            throw Error(`Key ${this.nameKey} or ${this.contentKey} not found in object ${JSON.stringify(prev)}`);
        
        await this.limiter.removeTokens(1);

        await uploadFile({
            bucket: this.bucket,
            filename: this.folder + "/" + _.get(prev, this.nameKey),
            content: _.get(prev, this.contentKey),
        });
        
        console.log(this.count++);

        await this.next?.run(prev);
    }
}

export default S3Saver;