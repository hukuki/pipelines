import { Pipeable } from "..";

class Map<InputType, OutputType> extends Pipeable<InputType, OutputType> {
    private map: (prev: InputType)=>OutputType;

    constructor(map: (prev: InputType)=>OutputType) {
        super();

        this.map = map;
    }

    public async run(prev: InputType): Promise<any> {
        const out : OutputType = await this.map(prev);

        await this.next?.run(out);
    }
}

export default Map;