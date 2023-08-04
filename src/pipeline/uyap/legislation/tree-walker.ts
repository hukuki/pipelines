import { Pipeable } from "../..";
import CVLegislationTree from "./model/legislation-tree";

/** 
 *  @description This class is used to walk through the tree and return the leaves.
 *  Gets the root node, passes leaf nodes to the pipeline. CVLegislationTree -> CVLegislationTree
*/
class TreeWalker extends Pipeable<CVLegislationTree, CVLegislationTree> {

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