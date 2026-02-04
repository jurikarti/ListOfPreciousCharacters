"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CharacterSheetData } from "@/lib/schema";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import soulInfuser from "@/data/premade/soul_infuser.json";
import magicalConductor from "@/data/premade/magical_conductor.json";
import marksMage from "@/data/premade/marks_mage.json";
import martialDancer from "@/data/premade/martial_dancer.json";

// Define the type for premade characters metadata
interface PremadeCharacter {
    id: string;
    name: string;
    description: string;
    style: string;
    race: string;
    data: CharacterSheetData;
}

// In a real app, this might come from an API or a dynamic import.
// For now, we import the JSON directly.
const PREMADE_CHARACTERS: PremadeCharacter[] = [
    {
        id: "soul_infuser",
        name: "Soul Infuser (Вливатель Душ)",
        description: "Магический мечник, наполняющий оружие маной.",
        style: "Enchanter (Зачарователь)",
        race: "Human (Человек)",
        data: soulInfuser as CharacterSheetData
    },
    {
        id: "magical_conductor",
        name: "Magical Conductor (Магический Дирижер)",
        description: "Эльф-маг, использующий жезл и магию стихий.",
        style: "Caster (Кастер)",
        race: "Elf (Эльф)",
        data: magicalConductor as CharacterSheetData
    },
    {
        id: "marks_mage",
        name: "Marks Mage (Маркс Мейдж)",
        description: "Ангел-снайпер, специализирующийся на дальнем бое.",
        style: "Shooter (Стрелок)",
        race: "Angel (Ангел)",
        data: marksMage as CharacterSheetData
    },
    {
        id: "martial_dancer",
        name: "Martial Dancer (Боевой Танцор)",
        description: "Зверолюд-оборотень, сражающийся усиленным оружием.",
        style: "Shapeshifter (Оборотень)",
        race: "Therian (Зверолюд)",
        data: martialDancer as CharacterSheetData
    }
];

interface PremadeCharacterModalProps {
    isOpen: boolean;
    onClose: () => void;
    form: UseFormReturn<CharacterSheetData>;
}

export function PremadeCharacterModal({ isOpen, onClose, form }: PremadeCharacterModalProps) {
    const [selectedCharId, setSelectedCharId] = useState<string | null>(null);

    const handleLoad = () => {
        if (!selectedCharId) return;

        const character = PREMADE_CHARACTERS.find(c => c.id === selectedCharId);
        if (character) {
            // Confirm overwrite
            if (window.confirm("Это перезапишет текущие данные персонажа. Вы уверены?")) {
                form.reset(character.data);
                toast.success(`Загружен персонаж: ${character.name}`);
                onClose();
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Загрузить готового персонажа</DialogTitle>
                    <DialogDescription>
                        Выберите шаблон, чтобы начать приключение.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4">
                    <div className="grid grid-cols-1 gap-4 py-4">
                        {PREMADE_CHARACTERS.map((char) => (
                            <Card
                                key={char.id}
                                className={`cursor-pointer transition-all hover:border-primary/50 ${selectedCharId === char.id ? 'border-primary ring-1 ring-primary' : ''}`}
                                onClick={() => setSelectedCharId(char.id)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <CardTitle className="text-lg">{char.name}</CardTitle>
                                        <div className="flex gap-2 text-xs">
                                            <span className="bg-secondary px-2 py-1 rounded-full">{char.race}</span>
                                            <span className="bg-secondary px-2 py-1 rounded-full">{char.style}</span>
                                        </div>
                                    </div>
                                    <CardDescription>{char.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center pt-4 border-t mt-2">
                    <Button variant="outline" onClick={onClose}>Отмена</Button>
                    <Button onClick={handleLoad} disabled={!selectedCharId}>Загрузить</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
