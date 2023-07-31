import { Pipeable } from "..";

class Counter extends Pipeable{
    
    private count : number = 0;
    
    public async run(prev?: any): Promise<any> {
        this.count++;    
        
        return;
    }

    get result(): number{
        return this.count;
    }
}

export default Counter;