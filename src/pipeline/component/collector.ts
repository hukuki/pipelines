import { Pipeable } from "..";

class Collector extends Pipeable {

    private collector: Array<any> = [];

    constructor() {
        super();
    }

    public async run(prev?: any): Promise<any> {
        this.collector.push(prev);
    }

    public get result() {
        return this.collector;
    }
}

export default Collector;