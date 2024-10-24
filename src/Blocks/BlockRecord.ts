namespace DXF.Blocks {
    /**
     * Represents the record of a block in the tables section.
     */
    export class BlockRecord extends DxfObject {
        // Private fields
        private name: string;
        private layout: Layout | null;
        private static defaultUnits: DrawingUnits = DrawingUnits.Unitless;
        private units: DrawingUnits;
        private allowExploding: boolean;
        private scaleUniformly: boolean;

        // Constructor
        /**
         * Initializes a new instance of the BlockRecord class.
         * @param name Block definition name.
         */
        internal constructor(name: string) {
            super(DxfObjectCode.BlockRecord);
            if (!name) {
                throw new Error("name cannot be null or empty");
            }
            this.name = name;
            this.layout = null;
            this.units = BlockRecord.DefaultUnits;
            this.allowExploding = true;
            this.scaleUniformly = false;
        }

        // Public properties
        /**
         * Gets the name of the block record.
         * Block record names are case insensitive.
         * The block which name starts with "*" is for internal purpose only.
         */
        public get Name(): string {
            return this.name;
        }

        internal set Name(value: string) {
            this.name = value;
        }

        /**
         * Gets the associated Layout.
         */
        public get Layout(): Layout | null {
            return this.layout;
        }

        internal set Layout(value: Layout | null) {
            this.layout = value;
        }

        /**
         * Gets or sets the block insertion units.
         */
        public get Units(): DrawingUnits {
            return this.units;
        }

        public set Units(value: DrawingUnits) {
            this.units = value;
        }

        /**
         * Gets or sets the default block units.
         * These are the units that all new blocks will use as default.
         */
        public static get DefaultUnits(): DrawingUnits {
            return BlockRecord.defaultUnits;
        }

        public static set DefaultUnits(value: DrawingUnits) {
            BlockRecord.defaultUnits = value;
        }

        /**
         * Gets or sets if the block can be exploded.
         * This property is only compatible with DXF version AutoCad2007 and upwards.
         */
        public get AllowExploding(): boolean {
            return this.allowExploding;
        }

        public set AllowExploding(value: boolean) {
            this.allowExploding = value;
        }

        /**
         * Gets or sets if the block must be scaled uniformly.
         * This property is only compatible with DXF version AutoCad2007 and upwards.
         */
        public get ScaleUniformly(): boolean {
            return this.scaleUniformly;
        }

        public set ScaleUniformly(value: boolean) {
            this.scaleUniformly = value;
        }

        /**
         * Gets the owner of the actual DXF object.
         */
        public get Owner(): BlockRecords {
            return this.base.Owner as BlockRecords;
        }

        internal set Owner(value: BlockRecords) {
            this.base.Owner = value;
        }

        /**
         * Gets if the block record is for internal use only.
         * All blocks which name starts with "*" are for internal use and should not be modified.
         */
        public get IsForInternalUseOnly(): boolean {
            return this.name.startsWith("*");
        }

        // Overrides
        /**
         * Converts the value of this instance to its equivalent string representation.
         * @returns The string representation.
         */
        public toString(): string {
            return this.Name;
        }
    }
}
