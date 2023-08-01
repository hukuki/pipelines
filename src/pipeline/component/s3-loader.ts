import { getFile, listFolder } from '../../storage/s3';
import { Pipeable } from '..';
import { CVBufferFile } from '../interface';
import { RateLimiter } from 'limiter';

class S3Loader extends Pipeable<never, CVBufferFile>{
    
    private bucket: string;
    private folder: string;
    private limiter : RateLimiter;

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
        const files = await listFolder({bucket: this.bucket, folder: this.folder});
        const keys = files.map(file => file.Key);
        
        for (const key of keys) {
            if(!key) continue;

            await this.limiter.removeTokens(1);
            
            getFile({bucket: this.bucket, filename: key}).then(file => {
                    if(!file) return;
                    
                    this.next?.run({
                        filename: key,
                        content: file
                    });
                }
            );
        }
    }
}

export default S3Loader;