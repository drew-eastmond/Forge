type NodeData = {
    id: string,
    title: string,
    children: NodeData[],
};

/**
 * @constructor { NodeData[] } - dependencies
 */
export class DependencyHelper {

    private _dependencies: NodeData[];
    private _count: number = 0;

    constructor(dependencies: NodeData[]) {

        this._dependencies = dependencies;
        for (const nodeData of this) {

            nodeData.id = String(this._count++);

        }

    }

    public *[Symbol.iterator](): Iterator<NodeData> {

        for (const nodeData of this._dependencies) {

            yield nodeData;

            for (const childData of nodeData.children) {

                yield childData;

            }

        }

    }

    private _has(file: string): boolean {

        for (const nodeData of this._dependencies) {

            if (nodeData.title == file) return true;

            for (const childData of nodeData.children) {

                if (childData.title == file) return true;

            }

        }

        return false;

    }

    private _indexOf(file: string): number {

        for (let i: number = 0; i < this._dependencies.length; i++) {

            const nodeData: NodeData = this._dependencies[i];
            if (nodeData.title == file) return i;

            // now check the children for a dependency match
            for (const childData of nodeData.children) {

                if (childData.title == file) return i;

            }

        }

        return -1;

    }

    private _spliceDependency(file: string, inputs: string[]): void {

        const inputIndex: number = inputs.indexOf(file);
        const startIndex: number = Math.max(inputIndex - 1, 0);


        for (let i: number = startIndex; i > -1; i--) {

            const queryFile: string = inputs[i];
            const queryIndex: number = this._indexOf(queryFile);

            if (queryIndex > -1) {

                this._dependencies.splice(queryIndex + 1, 0, { id: String(this._count++), title: file, children: [] });
                return;

            }

        }

        const insertIndex: number = this._dependencies.length - 1;
        this._dependencies.splice(insertIndex, 0, { id: String(this._count++), title: file, children: [] });

    }

    /**
     * intersect :
     * 
     * 
     * @param { string[] } inputs - This is supplied from the esbuild/typescript during each build step
     */

    public intersect(inputs: string[]): NodeData[] {

        // 1. first prune any files from the dependencies that no longer exist
        let hasRemoval: boolean = true;
        whileRemoval: while (hasRemoval) {

            hasRemoval = false;

            for (const nodeData of this._dependencies) {

                const children: NodeData[] = nodeData.children;
                for (let i: number = 0; i < children.length; i++) {

                    const childData: NodeData = children[i];
                    const childTitle: string = childData.title;

                    if (inputs.indexOf(childTitle) == -1) {

                        // a. this entry no loner is in the import chain, so remove it
                        children.splice(i, 1);

                        // b. reset the `hasRemoval` flag
                        hasRemoval = true;

                        // c. contine the `whileRemoval`. ( Well no shit!!! )
                        continue whileRemoval;

                    }

                }

            }

        }

        // 2. now add imports that we're not part . This is a new file recent;y added since it was sorted
        for (const file of inputs) {

            if (this._has(file) === false) this._spliceDependency(file, inputs);

        }

        return this._dependencies;

    }

    public remove(file: string): void {

        for (let i: number = 0; i < this._dependencies.length; i++) {

            const nodeData: NodeData = this._dependencies[i];

            if (nodeData.title == file) {

                this._dependencies.splice(i, 1, ...nodeData.children);
                return;

            }

            for (const childData of nodeData.children) {

                if (childData.title == file) {

                    nodeData.children.splice(i, 1, ...nodeData.children);
                    return;

                }

            }

        }

    }

}