import { Pipeable } from '..';
import { FilterQuery, Model } from 'mongoose';
import { RateLimiter } from 'limiter';

class MongoIterator<InputType extends FilterQuery<any>> extends Pipeable<InputType, InputType> {

    private from : Model<any>;
    private limiter: RateLimiter;


    constructor({from}: { from : Model<any>}) {
        super();
        this.from = from;
    }

    public async run(prev?: InputType): Promise<any> {
        this.from.find(prev || {}).cursor().on('data', async (data) => {
            await this.next?.run(data);
        }).on('error', (err) => {
            console.error(err);
        });
    }
}

export default MongoIterator;