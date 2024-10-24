namespace DXF.Blocks {
    /**
     * Represents the termination element of the block definition.
     */
    export class EndBlock extends DxfObject {
        /**
         * Initializes a new instance of the <c>EndBlock</c> class.
         * @param owner The owner of the block.
         */
        constructor(owner: DxfObject) {
            super(DxfObjectCode.BlockEnd);
            this.Owner = owner;
        }
    }
}
