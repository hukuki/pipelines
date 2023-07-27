abstract class Pipeable {

    private _next?: Pipeable;

    public abstract run(prev?: any): Promise<any>;

    constructor(next?: Pipeable) {
        this._next = next;
    }

    public set next(next: Pipeable | undefined) {
        this._next = next;
    }

    public get next(): Pipeable | undefined {
        return this._next;
    }
}
class Pipeline extends Pipeable {
    private nodes: Pipeable[] = [];

    public add(node: Pipeable) {
        if (this.nodes.length !== 0)
            this.nodes[this.nodes.length - 1].next = node;

        this.nodes.push(node);

        // The last node of the pipeline should point to the next node of the pipeline.
        // This is to allow different pipelines themselves to be connected.
        node.next = this.next;
    }

    public async run(prev?: any) {
        if (this.nodes.length == 0) return;
        
        const firstNode = this.nodes[0];
        
        await firstNode.run(prev);
    }

    public set next(next: Pipeable | undefined){
        super.next = next;

        if (this.nodes.length !== 0)
            this.nodes[this.nodes.length - 1].next = next;
    }
}

export default Pipeline;
export { Pipeable };