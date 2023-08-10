import _ from 'lodash';
import { Pipeable } from '..';
import Collector from './collector';

class Merge<InputType> extends Pipeable<InputType, object>{

    private nodes: Pipeable<InputType, any>[];
    private keys: string[];

    constructor({nodes, keys}: {nodes: Pipeable<InputType, any>[], keys: string[]}){
        super();

        this.nodes = nodes;
        this.keys  = keys;
        
        if(this.keys.length !== this.nodes.length)
            throw Error(`Keys ${this.keys} and nodes ${this.nodes} must have the same length.`);
    }

    public async run(prev: InputType): Promise<any> {
        const obj : object = {};

        for(let i =0; i<this.nodes.length; i++) {
            const node = this.nodes[i];
            const key = this.keys[i];

            const collector = new Collector();
            node.next = collector;
            
            await node.run(prev);

            const result = collector.result;

            const value = (result.length > 1) ? result: result[0];

            _.set(obj, key, value);
        }

        await this.next?.run(obj);
    }
}

export default Merge;