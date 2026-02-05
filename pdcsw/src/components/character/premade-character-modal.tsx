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
        data: soulInfuser as unknown as CharacterSheetData
    },
    {
        id: "magical_conductor",
        name: "Magical Conductor (Магический Дирижер)",
        description: "Эльф-маг, использующий жезл и магию стихий.",
        style: "Caster (Кастер)",
        race: "Elf (Эльф)",
        data: magicalConductor as unknown as CharacterSheetData
    },
    {
        id: "marks_mage",
        name: "Marks Mage (Маркс Мейдж)",
        description: "Ангел-снайпер, специализирующийся на дальнем бое.",
        style: "Shooter (Стрелок)",
        race: "Angel (Ангел)",
        data: marksMage as unknown as CharacterSheetData
    },
    {
        id: "martial_dancer",
        name: "Martial Dancer (Боевой Танцор)",
        description: "Зверолюд-оборотень, сражающийся усиленным оружием.",
        style: "Shapeshifter (Оборотень)",
        race: "Therian (Зверолюд)",
        data: martialDancer as unknown as CharacterSheetData
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
            <DialogContent className="sm:max-w-[600px] w-full h-[100dvh] sm:h-auto sm:max-h-[85vh] flex flex-col p-0 gap-0 sm:p-6 sm:gap-4 overflow-hidden rounded-none sm:rounded-xl">
                <DialogHeader className="px-4 py-4 sm:px-0 sm:py-0 shrink-0 border-b sm:border-0 bg-background/95 backdrop-blur z-10">
                    <DialogTitle>Загрузить готового персонажа</DialogTitle>
                    <DialogDescription>
                        Выберите шаблон, чтобы начать приключение.
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 min-h-0 px-4 sm:px-0 bg-muted/10">
                    <div className="grid grid-cols-1 gap-4 py-4">
                        {PREMADE_CHARACTERS.map((char) => (
                            <Card
                                key={char.id}
                                className={`cursor-pointer transition-all hover:border-primary/50 relative overflow-hidden group ${selectedCharId === char.id ? 'border-primary ring-1 ring-primary shadow-md bg-primary/5' : 'border-border/60'}`}
                                onClick={() => setSelectedCharId(char.id)}
                            >
                                <CardHeader className="pb-3 p-4">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base sm:text-lg leading-tight">{char.name}</CardTitle>
                                            <div className="flex flex-wrap gap-1.5 text-[0.65rem] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                                <span className="bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50">{char.race}</span>
                                                <span className="bg-secondary/50 px-1.5 py-0.5 rounded border border-border/50">{char.style}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <CardDescription className="text-xs sm:text-sm mt-2 line-clamp-3">
                                        {char.description}
                                    </CardDescription>
                                </CardHeader>

                                {selectedCharId === char.id && (
                                    <div className="absolute top-2 right-2 sm:top-1/2 sm:-translate-y-1/2 sm:right-4 animate-in fade-in zoom-in duration-200">
                                        <Button
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleLoad();
                                            }}
                                            className="shadow-lg h-8 text-xs sm:h-9 sm:text-sm"
                                        >
                                            Загрузить
                                        </Button>
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </ScrollArea>

                <div className="flex justify-between items-center p-4 sm:pt-0 sm:px-0 border-t sm:border-0 bg-background sm:bg-transparent shrink-0 pb-safe">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto h-10 sm:h-9">Отмена</Button>
                    <Button onClick={handleLoad} disabled={!selectedCharId} className="w-full sm:w-auto ml-2 sm:ml-0 hidden sm:flex">Загрузить</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
