import { Model } from "mongoose";
import { Pipeable } from "../index";
import { RateLimiter } from 'limiter';

class MongoSaver<InputType> extends Pipeable<InputType, InputType> {
    private model: Model<any>;
    private limiter: RateLimiter;

    constructor(config: { as: Model<any> }) {
        super();

        this.model = config.as;
        this.limiter = new RateLimiter({
            tokensPerInterval: 3,
            interval: 1000
        });
    }

    public async run(prev: InputType): Promise<any> {
        await this.limiter.removeTokens(1);

        await this.model.create(prev);

        await this.next?.run(prev);
    }
}

export default MongoSaver;