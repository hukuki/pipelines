import { Pipeable } from "..";

class Map<InputType, OutputType> extends Pipeable<InputType, OutputType> {
    private map: (prev: InputType, index? : number)=>OutputType;
    private index: number = 0;

    constructor(map: (prev: InputType, index? : number)=>OutputType) {
        super();

        this.map = map;
    }

    public async run(prev: InputType): Promise<any> {
        const out : OutputType = await this.map(prev, this.index++);

        await this.next?.run(out);
    }
}

export default Map;