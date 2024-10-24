import { TableObject } from "./TableObject"; // Adjust the import path as necessary
import { Layer } from "./Layer"; // Adjust the import path as necessary
import { TableObjectChangedEventArgs } from "./TableObjectChangedEventArgs"; // Adjust the import path as necessary
import { EntityObject } from "./EntityObject"; // Adjust the import path as necessary
import { BlockEntityChangeEventArgs } from "./BlockEntityChangeEventArgs"; // Adjust the import path as necessary
import { BlockAttributeDefinitionChangeEventArgs } from "DXF.Lib/DXF typescript LIB/src/Blocks/BlockAttributeDefinitionChangeEventArgs.ts"; // Adjust the import path as necessary
import { AttributeDefinition } from "./AttributeDefinition"; // Adjust the import path as necessary

namespace DXF.Blocks {
    export class Block extends TableObject {
        private readonly entities: EntityCollection;
        private readonly attributes: AttributeDefinitionDictionary;
        private description: string;
        private readonly end: EndBlock; // Existing property
        private flags: BlockTypeFlags;
        private layer: Layer;
        private origin: Vector3;
        private readonly xrefFile: string;
        private forInternalUse: boolean;

        public static readonly DefaultModelSpaceName: string = "*Model_Space";
        public static readonly DefaultPaperSpaceName: string = "*Paper_Space";

        public static get ModelSpace(): Block {
            return new Block(Block.DefaultModelSpaceName, null, null, false);
        }

        public static get PaperSpace(): Block {
            return new Block(Block.DefaultPaperSpaceName, null, null, false);
        }

        public LayerChanged: ((sender: Block, e: TableObjectChangedEventArgs<Layer>) => void) | null = null;
        protected OnLayerChangedEvent(oldLayer: Layer, newLayer: Layer): Layer {
            const ae = this.LayerChanged;
            if (ae) {
                const eventArgs = new TableObjectChangedEventArgs<Layer>(oldLayer, newLayer);
                ae(this, eventArgs);
                return eventArgs.NewValue;
            }
            return newLayer;
        }

        public EntityAdded: ((sender: Block, e: BlockEntityChangeEventArgs) => void) | null = null;
        protected OnEntityAddedEvent(item: EntityObject): void {
            const ae = this.EntityAdded;
            if (ae) {
                ae(this, new BlockEntityChangeEventArgs(item));
            }
        }

        public EntityRemoved: ((sender: Block, e: BlockEntityChangeEventArgs) => void) | null = null;
        protected OnEntityRemovedEvent(item: EntityObject): void {
            const ae = this.EntityRemoved;
            if (ae) {
                ae(this, new BlockEntityChangeEventArgs(item));
            }
        }

        public AttributeDefinitionAdded: ((sender: Block, e: BlockAttributeDefinitionChangeEventArgs) => void) | null = null;
        protected OnAttributeDefinitionAddedEvent(item: AttributeDefinition): void {
            const ae = this.AttributeDefinitionAdded;
            if (ae) {
                ae(this, new BlockAttributeDefinitionChangeEventArgs(item));
            }
        }

        public AttributeDefinitionRemoved: ((sender: Block, e: BlockAttributeDefinitionChangeEventArgs) => void) | null = null;
        protected OnAttributeDefinitionRemovedEvent(item: AttributeDefinition): void {
            const ae = this.AttributeDefinitionRemoved;
            if (ae) {
                ae(this, new BlockAttributeDefinitionChangeEventArgs(item));
            }
        }

        constructor(name: string, xrefFile: string);
        constructor(name: string, xrefFile: string, overlay: boolean);
        constructor(name: string, entities: Iterable<EntityObject>);
        constructor(name: string, entities: Iterable<EntityObject>, attributes: Iterable<AttributeDefinition>);
        constructor(name: string, entities: Iterable<EntityObject>, attributes: Iterable<AttributeDefinition>, checkName: boolean);
        constructor(name: string, xrefFile?: string | Iterable<EntityObject>, overlayOrEntities?: boolean | Iterable<EntityObject> | Iterable<AttributeDefinition>, attributes?: Iterable<AttributeDefinition>, checkName: boolean = true) {
            if (xrefFile && typeof xrefFile === 'string') {
                this.xrefFile = xrefFile;
                this.flags = BlockTypeFlags.XRef | BlockTypeFlags.ResolvedExternalReference;
                if (typeof overlayOrEntities === 'boolean' && overlayOrEntities) {
                    this.flags |= BlockTypeFlags.XRefOverlay;
                }
            }

            if (typeof xrefFile === 'undefined' && typeof overlayOrEntities === 'undefined') {
                this.xrefFile = '';
            }

            if (typeof xrefFile === 'undefined' && Array.isArray(overlayOrEntities)) {
                entities = overlayOrEntities;
                attributes = attributes;
            }

            if (checkName && !name) {
                throw new Error('Name cannot be null or empty.');
            }

            super(name, DxfObjectCode.Block, checkName);

            this.IsReserved = string.equals(name, Block.DefaultModelSpaceName, StringComparison.OrdinalIgnoreCase);
            this.forInternalUse = name.startsWith("*");
            this.description = '';
            this.origin = Vector3.Zero;
            this.layer = Layer.Default;
            this.Owner = new BlockRecord(name);
            this.flags = BlockTypeFlags.None;
            this.end = new EndBlock(this); // Initialization of the end property

            this.entities = new EntityCollection();
            this.entities.BeforeAddItem += this.Entities_BeforeAddItem;
            this.entities.AddItem += this.Entities_AddItem;
            this.entities.BeforeRemoveItem += this.Entities_BeforeRemoveItem;
            this.entities.RemoveItem += this.Entities_RemoveItem;

            if (entities) {
                this.entities.AddRange(entities);
            }

            this.attributes = new AttributeDefinitionDictionary();
            this.attributes.BeforeAddItem += this.AttributeDefinitions_BeforeAddItem;
            this.attributes.AddItem += this.AttributeDefinitions_ItemAdd;
            this.attributes.BeforeRemoveItem += this.AttributeDefinitions_BeforeRemoveItem;
            this.attributes.RemoveItem += this.AttributeDefinitions_RemoveItem;

            if (attributes) {
                this.attributes.AddRange(attributes);
            }
        }

        /// <summary>
        /// Gets the name of the table object.
        /// </summary>
        public get Name(): string {
            return super.Name; // Assuming 'super' is defined properly
        }

        public set Name(value: string) {
            if (this.forInternalUse) {
                if (this.Name.startsWith("*U") || this.Name.startsWith("*T")) {
                    this.flags &= ~BlockTypeFlags.AnonymousBlock;
                } else {
                    throw new Error("Blocks for internal use cannot be renamed.");
                }
            }
            super.Name = value; // Assuming 'super' is defined properly
            this.Record.Name = value; // Assuming 'Record' is defined properly
        }

        /// <summary>
        /// Gets or sets the block description.
        /// </summary>
        public get Description(): string {
            return this.description;
        }

        public set Description(value: string) {
            this.description = value ? value : '';
        }

        /// <summary>
        /// Gets or sets the block origin in world coordinates, it is recommended to always keep this value to the default Vector3.Zero.
        /// </summary>
        public get Origin(): Vector3 {
            return this.origin;
        }

        public set Origin(value: Vector3) {
            this.origin = value;
        }

        /// <summary>
        /// Gets or sets the block layer.
        /// </summary>
        public get Layer(): Layer {
            return this.layer;
        }

        public set Layer(value: Layer) {
            if (!value) {
                throw new Error("Layer cannot be null.");
            }
            this.layer = this.OnLayerChangedEvent(this.layer, value);
        }

        /// <summary>
        /// Gets the entity list of the block.
        /// </summary>
        public get Entities(): EntityCollection {
            return this.entities;
        }

        /// <summary>
        /// Gets the attribute definitions list of the block.
        /// </summary>
        public get AttributeDefinitions(): AttributeDefinitionDictionary {
            return this.attributes;
        }

        /// <summary>
        /// Gets the owner of the actual DXF object.
        /// </summary>
        public get Owner(): BlockRecord {
            return <BlockRecord>super.Owner; // Assuming 'super' is defined properly
        }

        /// <summary>
        /// Gets the block record associated with this block.
        /// </summary>
        public get Record(): BlockRecord {
            return this.Owner;
        }

        /// <summary>
        /// Gets the block-type flags (bit-coded values, may be combined).
        /// </summary>
        public get Flags(): BlockTypeFlags {
            return this.flags;
        }

        public set Flags(value: BlockTypeFlags) {
            this.flags = value;
        }

        /// <summary>
        /// Gets the external reference path name.
        /// </summary>
        public get XrefFile(): string {
            return this.xrefFile;
        }

        /// <summary>
        /// Gets if the block is an external reference.
        /// </summary>
        public get IsXRef(): boolean {
            return this.flags.hasFlag(BlockTypeFlags.XRef);
        }

        /// <summary>
        /// All blocks that start with "*" are for internal use only.
        /// </summary>
        public get IsForInternalUseOnly(): boolean {
            return this.forInternalUse;
        }

        /// <summary>
        /// Gets the block end object.
        /// </summary>
        public get End(): EndBlock {
            return this.end;
        }

        // Public methods region
        /// <summary>
        /// Loads a block from the specified DXF document.
        /// </summary>
        /// <param name="dxfDocument">The DXF document to load from.</param>
        /// <param name="blockName">The name of the block to load.</param>
        public static LoadBlockFromDocument(dxfDocument: DxfDocument, blockName: string): Block {
            const block = dxfDocument.Blocks.find(b => b.Name === blockName);
            if (!block) {
                throw new Error(`Block with name "${blockName}" not found in the DXF document.`);
            }
            return block;
        }

        /// <summary>
        /// Creates a block with the specified properties.
        /// </summary>
        /// <param name="name">The name of the block.</param>
        /// <param name="description">The description of the block.</param>
        /// <param name="entities">The entities to include in the block.</param>
        public static CreateBlock(name: string, description: string, entities: EntityObject[]): Block {
            const block = new Block(name);
            block.Description = description;
            for (const entity of entities) {
                block.Entities.Add(entity);
            }
            return block;
        }

        /// <summary>
        /// Saves the block to the specified DXF file.
        /// </summary>
        /// <param name="filePath">The path of the file to save the block to.</param>
        public SaveToFile(filePath: string): void {
            const dxf = new DxfDocument();
            dxf.Blocks.Add(this);
            // Save logic to write the dxf document to the file
            // This is a placeholder, implement your file writing logic here
            console.log(`Block saved to ${filePath}`);
        }
         

        protected SetName(newName: string, checkName: boolean): void {
            // Hack to change the table name without having to check its name.
            // Some invalid characters are used for internal purposes only.
            super.Name = newName; // Call to the base class's SetName method
            this.Record.Name = newName;
            this.forInternalUse = newName.startsWith("*");
        }
    
              
    }
}
