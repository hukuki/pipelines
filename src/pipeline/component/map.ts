import { Pipeable } from "..";

class Map extends Pipeable {
    private map: Function;

    constructor(map: Function) {
        super();

        this.map = map;
    }

    public async run(prev: any): Promise<any> {
        const out = await this.map(prev);

        
        await this.next?.run(out);
    }
}

export default Map;