import { Pipeable } from '..';
import { FilterQuery, Model } from 'mongoose';
import { RateLimiter } from 'limiter';
import Checkpointable from './checkpointable';

class MongoIterator<InputType extends FilterQuery<any>> extends Checkpointable<InputType, InputType> {

    private from : Model<any>;
    private limiter: RateLimiter;

    constructor({from}: { from : Model<any>}) {
        super();
        this.from = from;
    }

    public async run(prev?: InputType): Promise<any> {
        for await(const data of this.from.find(prev || {}).skip(this.checkpoint() - 1)) {
            await this.next?.run(data);
            this.checkpoint();
        }
    }
}

export default MongoIterator;