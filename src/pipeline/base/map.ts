import { Pipeable } from "..";

class Map<InputType, OutputType> extends Pipeable<InputType, OutputType> {
    private map: Function;

    constructor(map: Function) {
        super();

        this.map = map;
    }

    public async run(prev: InputType): Promise<any> {
        const out : OutputType = await this.map(prev);

        
        await this.next?.run(out);
    }
}

export default Map;