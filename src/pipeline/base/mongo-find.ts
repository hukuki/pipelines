import { Pipeable } from '..';
import { FilterQuery, Model } from 'mongoose';
import _ from 'lodash';

class MongoFinder<InputType> extends Pipeable<InputType, InputType> {

    private MAX_CACHE_SIZE = 50000;

    private from : Model<any>;
    private key  : string;
    private documentKey? : string;
    private cacheEnabled : boolean;
    private cache = new Map<string, InputType>();

    constructor({from, key, documentKey, cache = false}: { from : Model<any>, key: string, documentKey?: string, cache? : boolean}) {
        super();
        this.from = from;
        this.key = key;
        this.documentKey = documentKey;
        this.cacheEnabled = cache;
    }

    public async run(prev: InputType): Promise<any> {
        const documentKey = this.documentKey || this.key;
        const key = this.key;
        const value = _.get(prev, key);
        
        if(this.cacheEnabled && this.cache.has(value))
            return await this.next?.run(this.cache.get(value));
        
        const obj = await this.from.findOne({[documentKey]: value});

        if(this.cacheEnabled)
            this.cache.set(value, obj);

        if(this.cacheEnabled && this.cache.size > this.MAX_CACHE_SIZE){
            const keys = Array.from(this.cache.keys()).slice(0, this.MAX_CACHE_SIZE/2);
            keys.forEach(k => this.cache.delete(k));
        }

        await this.next?.run(obj);
    }
}

export default MongoFinder;