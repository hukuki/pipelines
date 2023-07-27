import { Pipeable } from "../../index";
import CVLegislationTree from "../../model/uyap/legislation-tree";

/** 
 *  @description This class is used to walk through the tree and return the leaves.
*/
class TreeWalker extends Pipeable {

    public async run(prev: CVLegislationTree) {
        for (const child of prev.children) {
            await this.run(child);
        }
        
        if (prev.children.length === 0){
            await this.next?.run(prev);
        }
    }
}

export default TreeWalker;