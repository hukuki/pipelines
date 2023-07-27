import { Model } from "mongoose";
import { Pipeable } from "../index";

class MongoSaver extends Pipeable {
    private model: Model<any>;

    constructor(config: { as: Model<any> }) {
        super();

        this.model = config.as;
    }

    public async run(prev: any): Promise<any> {
        try{
            await this.model.create(prev);

            await this.next?.run(prev);
        }catch(e){
            console.log("error by:", prev);
            throw e;
        }
    }
}

export default MongoSaver;