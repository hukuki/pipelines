import { FilterQuery, Model } from "mongoose";
import { Pipeable } from "../index";
import { RateLimiter } from 'limiter';

class MongoSaver<InputType extends FilterQuery<any>> extends Pipeable<InputType, InputType> {
    private model: Model<any>;
    private limiter: RateLimiter;

    constructor(config: { as: Model<any> }) {
        super();

        this.model = config.as;
        this.limiter = new RateLimiter({
            tokensPerInterval: 100,
            interval: 1000
        });

        //this.worker = new Worker("./dist/pipeline/base/mongo-worker.js");
    }

    public async run(prev: InputType): Promise<any> {
        //await this.limiter.removeTokens(1);
        //this.worker.postMessage(prev);
        try{
            await this.model.create(prev);
        }catch(e){
            return;

            if(!(await this.model.find(prev)))
                throw e;
            else
                console.log("Already exists.");
        }
        //await this.next?.run(prev);
    }
}

export default MongoSaver;