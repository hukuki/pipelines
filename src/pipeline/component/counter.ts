import { Pipeable } from "..";

class Counter<InputType> extends Pipeable<InputType, InputType>{
    
    private count : number = 0;
    
    public async run(prev?: InputType): Promise<any> {
        this.count++;    
        
        await this.next?.run(prev);
    }

    get result(): number{
        return this.count;
    }
}

export default Counter;