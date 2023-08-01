import { Pipeable } from '..';
import { FilterQuery, Model } from 'mongoose';

class MongoFinder<InputType extends FilterQuery<any>> extends Pipeable<InputType, InputType> {

    private from : Model<any>;

    constructor({from}: { from : Model<any>}) {
        super();
        this.from = from;
    }

    public async run(prev: InputType): Promise<any> {
        const obj = await this.from.findOne(prev);

        await this.next?.run(obj);
    }
}

export default MongoFinder;