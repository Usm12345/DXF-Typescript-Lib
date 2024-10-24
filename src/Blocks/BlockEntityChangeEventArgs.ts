namespace DXF.Blocks {
    
    export class BlockEntityChangeEventArgs {
        // Private fields
        private readonly item: EntityObject;

        // Constructor
        /**
         * Initializes a new instance of BlockEntityChangeEventArgs.
         * @param item The entity that is being added or removed from the block.
         */
        constructor(item: EntityObject) {
            this.item = item;
        }

        // Public properties
        /**
         * Gets the entity that is being added or removed.
         */
        public get Item(): EntityObject {
            return this.item;
        }
    }
}
