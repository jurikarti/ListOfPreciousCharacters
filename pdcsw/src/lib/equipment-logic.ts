
import { toast } from "sonner";
import { UseFormReturn } from "react-hook-form";
import { CharacterSheetData } from "./schema";
import { Item, ItemType } from "./game-data";

// Simple local ID generator
const generateId = () => Math.random().toString(36).substr(2, 9);

export type EquipmentSlotKey = keyof CharacterSheetData['equipment'];

export const EQUIPMENT_SLOTS: Record<EquipmentSlotKey, string> = {
    rightHand: "Правая рука",
    leftHand: "Левая рука",
    head: "Голова",
    body: "Торс",
    extraDefense: "Всп. броня",
    magic: "Магия", // This might need special handling as it's not a standard item slot in the same way? Or is it?
    // Wait, "Magical Equipment" like Enchants go to specific slots?
    // Rules say: Enchant Magic uses slots equal to Grade. Here we have just one "magic" slot in schema?
    // The schema has `magic: equipmentSlotSchema`. 
    // And `enchantments: z.array(...)`.
    // Let's focus on the physical slots first.
};

export const VALID_SLOTS: Record<ItemType | string, EquipmentSlotKey[]> = {
    "Weapon": ["rightHand", "leftHand"],
    "Armor": ["body", "head", "extraDefense"], // Needs checking specific type keywords if possible, otherwise user chooses
    "Ward": ["extraDefense"],
    "Enchant": ["magic"],
    "Tool": ["rightHand", "leftHand"],
    "Consumable": [], // Cannot equip
};

/**
 * Returns a list of valid slots for a given item.
 */
export function getValidSlots(item: Partial<Item> & { type: string }): EquipmentSlotKey[] {
    // If item has a specific 'slot' property defined (from DB), use it mapping
    // But currently DB items might not have it.

    // Fallback to type-based mapping
    const slots = VALID_SLOTS[item.type] || [];

    // Refinement based on Item Name keywords could happen here
    // e.g. if name contains "Шлем" -> head only.
    if (item.type === "Armor") {
        const lowerName = item.name?.toLowerCase() || "";
        if (lowerName.includes("шлем") || lowerName.includes("диадема") || lowerName.includes("шляпа")) return ["head"];
        if (lowerName.includes("доспех") || lowerName.includes("роба") || lowerName.includes("одежда") || lowerName.includes("плащ")) return ["body", "extraDefense"];
        if (lowerName.includes("щит")) return ["leftHand"]; // Shields are often off-hand
    }

    return slots;
}

/**
 * Moves an item from Inventory to a specific Equipment Slot.
 * - Handles swapping if slot is occupied.
 * - Preserves item data.
 */
export function equipItem(
    form: UseFormReturn<CharacterSheetData>,
    itemIndex: number,
    targetSlot: EquipmentSlotKey
) {
    const currentInventory = form.getValues("inventory");
    console.log("Attempting to equip from index:", itemIndex, "to slot:", targetSlot);

    const itemToEquip = currentInventory[itemIndex];

    if (!itemToEquip) {
        toast.error("Ошибка: Предмет не найден в инвентаре.");
        console.error("Item not found at index", itemIndex);
        return;
    }

    const currentEquipment = form.getValues("equipment");
    const slotItem = currentEquipment[targetSlot];

    const isSlotOccupied = slotItem.name && slotItem.name.trim() !== "";

    // Helper for safe parsing
    const safeParse = (val: string | number | undefined) => {
        if (typeof val === 'number') return val;
        if (!val) return 0;
        // Handle "2d6+1" or similar by stripping non-numeric prefix if needed, but here we expect stats like hit/range/evasion to be roughly numeric or parsed to 0 if NaN.
        // For strict numbers:
        const parsed = parseInt(String(val), 10);
        return isNaN(parsed) ? 0 : parsed;
    };

    // Prepare the new equipment data
    const newEquipmentData = {
        id: itemToEquip.id,
        name: itemToEquip.name,
        type: itemToEquip.type,
        grade: itemToEquip.grade,
        weight: itemToEquip.weight,
        effect: itemToEquip.effect,
        description: itemToEquip.description,

        // Stats - explicit casting to string for damage, safe parsing for numbers
        hit: safeParse(itemToEquip.accuracyCheck),
        damage: String(itemToEquip.damage || "0"),
        range: safeParse(itemToEquip.range),
        evasion: safeParse(itemToEquip.evasion),
        defense: safeParse(itemToEquip.defense),

        notes: "",

        originalItem: itemToEquip
    };

    console.log("New Equipment Data:", newEquipmentData);

    const newInventory = [...currentInventory];

    // If occupied, move current equipped item to inventory
    if (isSlotOccupied) {
        let returnedItem: any;

        if (slotItem.originalItem) {
            returnedItem = slotItem.originalItem;
        } else {
            returnedItem = {
                id: generateId(),
                name: slotItem.name,
                type: "Unknown",
                weight: slotItem.weight,
                grade: 0,
                effect: "",
                description: slotItem.notes || "",
                damage: slotItem.damage,
                range: String(slotItem.range),
                defense: String(slotItem.defense),
                evasion: String(slotItem.evasion),
                // Initialize missing optional fields to avoid undefined issues later
                accuracyCheck: String(slotItem.hit),
            };
        }

        newInventory[itemIndex] = returnedItem;
        toast.info(`Предметы заменены: ${itemToEquip.name} <-> ${slotItem.name}`);
    } else {
        newInventory.splice(itemIndex, 1);
        toast.success(`Экипировано: ${itemToEquip.name}`);
    }

    // Update Form
    form.setValue("inventory", newInventory);
    form.setValue(`equipment.${targetSlot}`, newEquipmentData);
}

/**
 * Moves an item from an Equipment Slot back to Inventory.
 */
export function unequipItem(
    form: UseFormReturn<CharacterSheetData>,
    slot: EquipmentSlotKey
) {
    const currentEquipment = form.getValues("equipment");
    const slotItem = currentEquipment[slot];

    if (!slotItem.name) return;

    const currentInventory = form.getValues("inventory");

    // Recover item data
    let returnedItem: any;
    if (slotItem.originalItem) {
        returnedItem = slotItem.originalItem;
    } else {
        returnedItem = {
            id: slotItem.id || generateId(),
            name: slotItem.name,
            type: slotItem.type || "Unknown",
            weight: slotItem.weight,
            grade: slotItem.grade || 0,
            effect: slotItem.effect || "",
            description: slotItem.description || slotItem.notes || "",
            damage: slotItem.damage,
            range: String(slotItem.range),
            defense: String(slotItem.defense),
            evasion: String(slotItem.evasion),
        };
    }

    // Add to inventory
    form.setValue("inventory", [...currentInventory, returnedItem]);

    // Clear slot
    form.setValue(`equipment.${slot}`, {
        name: "",
        weight: 0,
        hit: 0,
        damage: "0",
        range: 0,
        evasion: 0,
        defense: 0,
        notes: "",
    });
}
