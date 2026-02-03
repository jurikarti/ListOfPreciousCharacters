import { useState } from "react";
import { Plus, Trash2, Search, Backpack, ChevronDown, Info, Sword, Shield, Sparkles, Zap, Hammer, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ITEMS, Item, ItemType } from "@/lib/game-data";
import { CharacterSheetData } from "@/lib/schema";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { equipItem, getValidSlots, EQUIPMENT_SLOTS, EquipmentSlotKey } from "@/lib/equipment-logic";

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 9);

interface InventoryManagerProps {
    form: UseFormReturn<CharacterSheetData>;
    isMobile?: boolean;
}

const CATEGORIES: { label: string; value: ItemType | "All" }[] = [
    { label: "Все", value: "All" },
    { label: "Оружие", value: "Weapon" },
    { label: "Броня", value: "Armor" },
    { label: "Обереги", value: "Ward" },
    { label: "Наложения", value: "Enchant" },
    { label: "Инструменты", value: "Tool" },
    { label: "Расходники", value: "Consumable" },
];

const getItemColor = (type: ItemType) => {
    switch (type) {
        case "Weapon": return "border-l-red-500 bg-red-500/5 hover:bg-red-500/10";
        case "Armor": return "border-l-blue-500 bg-blue-500/5 hover:bg-blue-500/10";
        case "Ward": return "border-l-cyan-500 bg-cyan-500/5 hover:bg-cyan-500/10";
        case "Enchant": return "border-l-purple-500 bg-purple-500/5 hover:bg-purple-500/10";
        case "Tool": return "border-l-amber-500 bg-amber-500/5 hover:bg-amber-500/10";
        case "Consumable": return "border-l-green-500 bg-green-500/5 hover:bg-green-500/10";
        default: return "border-l-gray-500";
    }
};

export function InventoryManager({ form, isMobile }: InventoryManagerProps) {
    const inventory = form.watch("inventory");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState<ItemType | "All">("All");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<CharacterSheetData['inventory'][0] | null>(null);

    const handleEquip = (index: number, slot: EquipmentSlotKey) => {
        equipItem(form, index, slot);
        toast.success(`Предмет экипирован: ${EQUIPMENT_SLOTS[slot]}`);
    };

    const handleAddItem = (item: Item) => {
        const currentInventory = form.getValues("inventory");

        // Items can be duplicates, so we generate a unique ID for the instance in inventory if needed, 
        // effectively checking if we want to stack or unrelated. User said "similar to skills", skills are unique.
        // But consumables are stackable usually. For now let's just add it as a new entry.
        // We need to match the schema exactly.

        const newItem = {
            id: generateId(), // Unique ID for this instance
            name: item.name,
            type: item.type,
            grade: item.grade,
            weight: item.weight || 0,
            effect: item.effect,
            description: item.description,
            accuracyCheck: item.accuracyCheck,
            damage: item.damage,
            range: item.range,
            slot: item.slot,
            evasion: item.evasion,
            defense: item.defense,
        };

        form.setValue("inventory", [...currentInventory, newItem]);
        toast.success(`Предмет "${item.name}" добавлен!`);
        // We keep the dialog open to add more items
    };

    const handleRemoveItem = (e: React.MouseEvent | null, index: number) => {
        if (e) e.stopPropagation();
        const currentInventory = form.getValues("inventory");
        const removed = currentInventory[index];
        form.setValue("inventory", currentInventory.filter((_, i) => i !== index));
        toast.info(`Предмет "${removed.name}" удален.`);
        if (selectedItem === removed) {
            setSelectedItem(null);
        }
    };

    const filteredAvailableItems = ITEMS.filter((item) => {
        // 1. Search
        if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // 2. Category
        if (categoryFilter !== "All" && item.type !== categoryFilter) return false;

        return true;
    });

    const currentWeight = inventory.reduce((sum, item) => sum + (item.weight || 0), 0);
    const maxWeight = form.watch("maxWeight") || 30;

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Backpack className="w-5 h-5" />
                    Инвентарь ({currentWeight} / {maxWeight})
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Добавить предмет
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-6 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Добавление предмета</DialogTitle>
                            <DialogDescription>
                                Выберите предмет из списка.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4 shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Поиск..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                                        {CATEGORIES.find(c => c.value === categoryFilter)?.label || categoryFilter}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {CATEGORIES.map(cat => (
                                        <DropdownMenuItem key={cat.value} onClick={() => setCategoryFilter(cat.value)}>
                                            {cat.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <ScrollArea className="flex-1 -mr-6 pr-6 h-full">
                            <div className="grid grid-cols-1 gap-4 pb-12">
                                {filteredAvailableItems.map((item) => (
                                    <Card
                                        key={item.id}
                                        className={cn(
                                            "p-3 flex flex-col gap-2 transition-colors cursor-pointer border-l-4",
                                            getItemColor(item.type)
                                        )}
                                        onClick={() => handleAddItem(item)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <div className="font-bold flex items-center gap-2">
                                                    {item.name}
                                                    {item.grade > 0 && <Badge variant="secondary" className="text-[10px] h-5">Grade {item.grade}</Badge>}
                                                </div>
                                                <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                                                    <Badge variant="outline">{item.type}</Badge>
                                                    {item.weight !== undefined && <Badge variant="outline">Вес: {item.weight}</Badge>}
                                                    {item.slot && <Badge variant="secondary">{item.slot}</Badge>}
                                                </div>
                                            </div>
                                            <Button size="sm" variant="ghost" className="h-6">Добавить</Button>
                                        </div>
                                        <div className="text-sm pt-1">
                                            {item.effect}
                                        </div>
                                        {/* Display specific stats if they exist */}
                                        {(item.damage || item.defense) && (
                                            <div className="flex gap-2 mt-1 text-xs font-mono bg-muted/30 p-1 rounded w-fit">
                                                {item.accuracyCheck && <span>Меткость: {item.accuracyCheck}</span>}
                                                {item.damage && <span>Урон: {item.damage}</span>}
                                                {item.defense && <span>Защита: {item.defense}</span>}
                                                {item.evasion && <span>Уворот: {item.evasion}</span>}
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Inventory List */}
            <ScrollArea className="flex-1 border rounded-md p-2">
                <div className="space-y-2">
                    {inventory.map((item, index) => (
                        <Card
                            key={index}
                            className={cn(
                                "p-2 flex flex-row flex-nowrap w-full justify-start items-center group transition-colors border-l-4 cursor-pointer relative overflow-hidden",
                                getItemColor(item.type as ItemType)
                            )}
                            onClick={() => setSelectedItem(item)}
                        >
                            <div className="flex flex-1 items-center gap-2 overflow-hidden min-w-0">
                                {/* Left: Icon */}
                                <div className={cn(
                                    "p-1.5 rounded-full shrink-0",
                                    getItemColor(item.type as ItemType).replace("border-l-4", "").replace("border-l-", "bg-").replace("bg-", "text-").replace("/5", "")
                                )}>
                                    {/* Icon rendering based on type */}
                                    {(() => {
                                        switch (item.type) {
                                            case "Weapon": return <Sword className="w-5 h-5" />;
                                            case "Armor": return <Shield className="w-5 h-5" />;
                                            case "Ward": return <Sparkles className="w-5 h-5" />;
                                            case "Enchant": return <Zap className="w-5 h-5" />;
                                            case "Tool": return <Hammer className="w-5 h-5" />;
                                            case "Consumable": return <FlaskConical className="w-5 h-5" />;
                                            default: return <Backpack className="w-5 h-5" />;
                                        }
                                    })()}
                                </div>

                                {/* Middle: Name and Info */}
                                <div className="flex-1 min-w-0 text-left">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="font-medium text-sm break-words">{item.name}</span>
                                        {item.weight > 0 && <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">Вес {item.weight}</span>}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground leading-tight mt-0.5 break-words">
                                        {item.effect}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 ml-auto shrink-0 pr-1">
                                {(() => {
                                    const realIndex = inventory.findIndex(i => i.id === item.id);
                                    const validSlots = getValidSlots(item as any);
                                    if (validSlots.length === 0) return null;

                                    if (validSlots.length === 0) return null;

                                    // If only one valid slot, equip immediately on click
                                    if (validSlots.length === 1) {
                                        return (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                title={`Экипировать в слот: ${EQUIPMENT_SLOTS[validSlots[0]]}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEquip(realIndex, validSlots[0]);
                                                }}
                                            >
                                                <Shield className="w-4 h-4" />
                                            </Button>
                                        );
                                    }

                                    // If multiple slots, show dropdown
                                    return (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={(e) => e.stopPropagation()}>
                                                    <Shield className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {validSlots.map(slot => (
                                                    <DropdownMenuItem key={slot} onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleEquip(realIndex, slot);
                                                    }}>
                                                        В слот: {EQUIPMENT_SLOTS[slot]}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    );
                                })()}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={(e) => handleRemoveItem(e, index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                    {inventory.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            Рюкзак пуст.
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Item Details Modal */}
            <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{selectedItem?.name}</DialogTitle>
                        <DialogDescription>{selectedItem?.type} • Grade {selectedItem?.grade}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                            {selectedItem?.weight !== undefined && <div className="bg-muted/30 p-2 rounded">Вес: {selectedItem.weight}</div>}
                            {selectedItem?.slot && <div className="bg-muted/30 p-2 rounded">Слот: {selectedItem.slot}</div>}
                        </div>

                        {(selectedItem?.damage || selectedItem?.defense) && (
                            <div className="bg-muted/50 p-3 rounded-md text-sm font-mono space-y-1">
                                {selectedItem.accuracyCheck && <div>Меткость: {selectedItem.accuracyCheck}</div>}
                                {selectedItem.damage && <div>Урон: {selectedItem.damage}</div>}
                                {selectedItem.defense && <div>Защита: {selectedItem.defense}</div>}
                                {selectedItem.evasion && <div>Уворот: {selectedItem.evasion}</div>}
                                {selectedItem.range && <div>Дальность: {selectedItem.range}</div>}
                            </div>
                        )}

                        <div className="text-sm">
                            <span className="font-semibold block mb-1">Эффект/Описание:</span>
                            {selectedItem?.effect}
                            {selectedItem?.description && <div className="mt-2 italic text-muted-foreground">{selectedItem.description}</div>}
                        </div>

                        <Button
                            variant="destructive"
                            className="w-full mt-2"
                            onClick={() => {
                                const idx = inventory.indexOf(selectedItem!);
                                if (idx !== -1) handleRemoveItem(null, idx);
                                setSelectedItem(null);
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Удалить предмет
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
