import { Pipeable } from "..";

class Fallback<InputType, OutputType> extends Pipeable<InputType, OutputType> {

    private verbose : boolean;
    private nodes : Pipeable<InputType, OutputType>[];

    constructor(nodes : Pipeable<InputType, OutputType>[], {verbose = false}: {verbose: boolean} = {verbose: false}) {
        super();

        this.verbose = verbose;
        this.nodes = nodes;
    }

    set next(next: Pipeable<OutputType, any> | undefined) {
        for(const node of this.nodes){
            node.next = next;
        }
    }

    public async run(prev?: InputType) {
        for(const node of this.nodes){
            try{
                await node.run(prev);
                return;
            }catch(e){
                if(this.verbose)
                    console.log(`[Fallback] node ${node.name} failed with following error: \n ${e}`);
            }
        }

        throw new Error('[Fallback] all nodes failed!');
    }
}

export default Fallback;