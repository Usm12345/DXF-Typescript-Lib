namespace DXF.Blocks {
    /**
     * Represents the arguments thrown when an attribute definition is added or removed from a Block.
     */
    export class BlockAttributeDefinitionChangeEventArgs {
        // Private fields
        private readonly item: AttributeDefinition;

        // Constructor
        /**
         * Initializes a new instance of BlockAttributeDefinitionChangeEventArgs.
         * @param item The attribute definition that is being added or removed from the block.
         */
        constructor(item: AttributeDefinition) {
            this.item = item;
        }

        // Public properties
        /**
         * Gets the attribute definition that is being added or removed.
         */
        public get Item(): AttributeDefinition {
            return this.item;
        }
    }
}
