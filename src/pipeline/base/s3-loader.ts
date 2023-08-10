import { getFile, listFolder } from '../../storage/s3';
import { Pipeable } from '..';
import { CVBufferFile } from '../interface';
import { RateLimiter } from 'limiter';
import { _Object } from '@aws-sdk/client-s3';

class S3Loader extends Pipeable<never, CVBufferFile>{

    private bucket: string;
    private folder: string;
    private limiter: RateLimiter;
    private count: number = 0;

    constructor({ bucket, folder }: { bucket: string, folder: string }) {
        super();

        this.bucket = bucket;
        this.folder = folder;
        this.limiter = new RateLimiter({
            tokensPerInterval: 1000,
            interval: 1000
        });
    }

    public async run(prev?: undefined): Promise<any> {
        let done = false;
        let continuationToken = undefined;

        while (!done) {
            const next = await listFolder({ bucket: this.bucket, folder: this.folder, continuationToken });            
            
            if (!next) break;
            continuationToken = next.NextContinuationToken;
            
            if (!next.Contents) break;

            const contents : _Object[] = next.Contents || [];
            const keys = contents.map(content => content.Key).filter(key => key) as string[]; 
            
            for (const key of keys) {
                if (!key) continue;
    
                await this.limiter.removeTokens(1);
                
                getFile({ bucket: this.bucket, filename: key }).then(async file => {
                    if (!file) return;
    
                    await this.next?.run({
                        filename: key,
                        content: file
                    });
                }
                );
            }

            done = !next.IsTruncated;
        }
    }
}

export default S3Loader;