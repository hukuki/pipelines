import { Pipeable } from "..";

class Collector<InputType> extends Pipeable<InputType, InputType> {

    private collector: Array<any> = [];

    constructor() {
        super();
    }

    public async run(prev?: InputType): Promise<any> {
        this.collector.push(prev);
    }

    public get result() {
        return this.collector;
    }
}

export default Collector;