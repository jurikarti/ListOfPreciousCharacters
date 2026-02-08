
import { useState } from "react";
import { Plus, Trash2, Search, BookOpen, Lock, ChevronDown, Zap } from "lucide-react";
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { SKILLS, Skill } from "@/lib/game-data";
import { CharacterSheetData } from "@/lib/schema";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SkillsManagerProps {
    form: UseFormReturn<CharacterSheetData>;
    isMobile?: boolean;
    level: number;
    raceName: string;
    styleName: string;
}

export function SkillsManager({ form, isMobile, level, raceName, styleName }: SkillsManagerProps) {
    const skills = form.watch("skills");
    const [searchQuery, setSearchQuery] = useState("");
    const [styleFilter, setStyleFilter] = useState<string>("all");
    const [isOpen, setIsOpen] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState<CharacterSheetData['skills'][0] | null>(null);

    const currentGL = Number(level);

    // Derive unique styles from skills list for the filter
    const allStyles = Array.from(new Set(SKILLS.map(s => s.requirements.style).filter(Boolean))).sort();

    const handleAddSkill = (skill: Skill) => {
        const currentSkills = form.getValues("skills");
        if (currentSkills.some((s) => s.id === skill.id)) {
            toast.error("Этот навык уже изучен!");
            return;
        }

        const newSkill = {
            id: skill.id,
            name: skill.name,
            cost: skill.cost,
            effect: skill.effect,
            classification: skill.classification,
            timing: skill.timing,
            description: skill.description || "", // Add description to stored data if possible or fetch from DB
        };

        form.setValue("skills", [...currentSkills, newSkill]);
        toast.success(`Навык "${skill.name}" добавлен!`);
        setIsOpen(false);
    };

    const handleRemoveSkill = (e: React.MouseEvent | null, index: number) => {
        if (e) e.stopPropagation(); // Prevent opening details when deleting
        const currentSkills = form.getValues("skills");
        const removed = currentSkills[index];
        form.setValue("skills", currentSkills.filter((_, i) => i !== index));
        toast.info(`Навык "${removed.name}" удален/забыт.`);
        if (selectedSkill?.id === removed.id) {
            setSelectedSkill(null);
        }
    };

    const filteredAvailableSkills = SKILLS.filter((skill) => {
        // 1. Filter out already learned skills
        if (skills.some((s) => s.id === skill.id)) return false;

        // 2. Search query
        if (searchQuery && !skill.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;

        // 3. Style/Class Filter logic
        if (styleFilter === "all") return true;
        if (styleFilter === "general") return !skill.requirements.style;
        if (styleFilter === "current") return skill.requirements.style === styleName;

        return skill.requirements.style === styleFilter;
    }).sort((a, b) => {
        return a.requirements.gl - b.requirements.gl;
    });

    const handleUseSkill = (e: React.MouseEvent, skill: CharacterSheetData['skills'][0]) => {
        e.stopPropagation();

        // Extract MP cost
        const costStr = skill.cost || "";
        const mpMatch = costStr.match(/(\d+)\s*MP/i);

        if (!mpMatch) {
            toast.info(`Навык "${skill.name}" не требует MP для использования.`);
            return;
        }

        const cost = parseInt(mpMatch[1], 10);
        const currentMP = form.getValues("mp.current");

        if (currentMP < cost) {
            toast.error(`Недостаточно MP! Требуется: ${cost}, Текущее: ${currentMP}`);
            return;
        }

        form.setValue("mp.current", currentMP - cost);
        toast.success(`Использован навык "${skill.name}". Потрачено ${cost} MP.`);
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Навыки / Skills
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" size="sm" className="gap-2">
                            <Plus className="w-4 h-4" /> Добавить навык
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl h-[80vh] md:h-[85vh] flex flex-col p-6 overflow-hidden">
                        <DialogHeader>
                            <DialogTitle>Изучение нового навыка</DialogTitle>
                            <DialogDescription>
                                Выберите навыки, доступные для вашей расы ({raceName}) и стиля ({styleName}).
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row gap-2 mb-4 shrink-0">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Поиск навыка..."
                                    className="pl-8"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="w-full sm:w-[200px] justify-between">
                                        {styleFilter === "all" ? "Все стили" :
                                            styleFilter === "general" ? "Общие" :
                                                styleFilter === "current" ? `Мой стиль` :
                                                    styleFilter}
                                        <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px] h-[300px] overflow-y-auto">
                                    <DropdownMenuItem onClick={() => setStyleFilter("all")}>
                                        Все стили
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStyleFilter("general")}>
                                        Общие (Без стиля)
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setStyleFilter("current")}>
                                        Мой стиль ({styleName})
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>Стили</DropdownMenuLabel>
                                    {allStyles.map(style => (
                                        <DropdownMenuItem key={style} onClick={() => setStyleFilter(style as string)}>
                                            {style}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                        <ScrollArea className="flex-1 -mr-4 pr-4 h-full">
                            <div className="grid grid-cols-1 gap-4 pb-32">
                                {filteredAvailableSkills.map((skill) => {
                                    const isLocked = false; // User requested to remove lock. Previously: skill.requirements.gl > currentGL;
                                    const glRequirement = skill.requirements.gl;
                                    const originLabel = skill.requirements.race ? `Раса: ${skill.requirements.race}` :
                                        skill.requirements.style ? `Стиль: ${skill.requirements.style}` :
                                            "Общий";

                                    const isReqMismatch = (skill.requirements.race && skill.requirements.race !== raceName);

                                    return (
                                        <Card
                                            key={skill.id}
                                            className={cn(
                                                "p-4 flex flex-col gap-2 transition-colors hover:bg-muted/50 cursor-pointer border-l-4",
                                                getSkillColor(skill),
                                                isReqMismatch ? "bg-red-50 dark:bg-red-950/20" : ""
                                            )}
                                            onClick={() => handleAddSkill(skill)}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col gap-1">
                                                    <div className="font-bold flex items-center gap-2">
                                                        {skill.name}
                                                        {isReqMismatch && (
                                                            <Badge variant="outline" className="text-amber-600 border-amber-600/30 text-[10px] h-5">
                                                                Чужая раса
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2 text-xs text-muted-foreground flex-wrap">
                                                        <Badge variant="outline" className="bg-background text-primary border-primary/20">{originLabel}</Badge>
                                                        <Badge variant="outline">{skill.classification}</Badge>
                                                        {skill.cost !== "-" && <Badge variant="secondary">{skill.cost}</Badge>}
                                                        {skill.timing && <span className="flex items-center">⏱ {skill.timing}</span>}
                                                        {glRequirement > 0 && <Badge variant="secondary" className="bg-muted text-muted-foreground">GL {glRequirement}</Badge>}
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-6">Изучить</Button>
                                            </div>
                                            <div className="text-sm border-t pt-2 mt-1">
                                                <span className="font-semibold text-primary/80">Эффект:</span> {skill.effect}
                                            </div>
                                            <div className="text-xs text-muted-foreground italic">
                                                {skill.description}
                                            </div>
                                        </Card>
                                    );
                                })}
                                {filteredAvailableSkills.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Нет доступных навыков для изучения.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            {/* List of Acquired Skills */}
            <div className={`rounded-md border ${isMobile ? "border-none" : ""}`}>
                {/* Desktop Table View */}
                <div className="w-full text-sm">
                    {!isMobile && (
                        <div className="grid grid-cols-[2fr_100px_3fr_110px_40px] gap-4 p-3 bg-muted/40 font-medium border-b text-muted-foreground uppercase text-xs items-center">
                            <div>Название навыка</div>
                            <div className="text-center">Стоимость</div>
                            <div>Эффект</div>
                            <div className="text-right">Действие</div>
                            <div></div>
                        </div>
                    )}
                    <ScrollArea className={isMobile ? "h-[calc(100vh-220px)]" : "h-[300px]"}>
                        <div className="divide-y pb-24">
                            {skills.map((skill, index) => {
                                // Try to find the full skill data from DB to get description if missing
                                const dbSkill = SKILLS.find(s => s.id === skill.id);
                                const classification = skill.classification || dbSkill?.classification;
                                const originLabel = dbSkill?.requirements.race ? `Раса: ${dbSkill.requirements.race}` :
                                    dbSkill?.requirements.style ? `Стиль: ${dbSkill.requirements.style}` :
                                        "Общий";

                                const hasMpCost = (skill.cost || "").toUpperCase().includes("MP");

                                return (
                                    <div
                                        key={index}
                                        className={cn(
                                            "group hover:bg-muted/30 transition-colors cursor-pointer",
                                            isMobile ? "flex flex-col gap-2 p-4 border-b last:border-0" : "grid grid-cols-[2fr_100px_3fr_110px_40px] gap-4 p-3 items-center",
                                            // Apply color stripe if dbSkill is found
                                            isMobile && dbSkill ? cn("border-l-4", getSkillColor(dbSkill).replace("border-l-", "border-l-")) : ""
                                        )}
                                        onClick={() => setSelectedSkill(skill)}
                                    >
                                        <div className="font-medium flex flex-col">
                                            <span>{skill.name}</span>
                                            {isMobile && (
                                                <div className="flex gap-2 mt-1 flex-wrap">
                                                    <Badge variant="outline" className="text-[10px] h-5 bg-background text-primary border-primary/20">{originLabel}</Badge>
                                                    <Badge variant="outline" className="text-[10px] h-5">{classification}</Badge>
                                                    <Badge variant="secondary" className="text-[10px] h-5">{skill.cost}</Badge>
                                                </div>
                                            )}
                                            {!isMobile && (
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] h-5 bg-background text-muted-foreground border-border">{originLabel}</Badge>
                                                </div>
                                            )}
                                        </div>

                                        {!isMobile && (
                                            <div className="text-center">
                                                <Badge variant="secondary">{skill.cost}</Badge>
                                            </div>
                                        )}

                                        <div className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                                            {skill.effect}
                                        </div>

                                        {/* Use Button (Desktop) */}
                                        {!isMobile && (
                                            <div className="flex justify-end pr-2">
                                                {hasMpCost && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="h-7 text-xs px-3 gap-1.5 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-900 hover:border-purple-300 transition-all shadow-sm font-semibold"
                                                        onClick={(e) => handleUseSkill(e, skill)}
                                                    >
                                                        <Zap className="w-3.5 h-3.5" />
                                                        Каст
                                                    </Button>
                                                )}
                                            </div>
                                        )}

                                        {/* Mobile Use Button & Trash */}
                                        {isMobile && (
                                            <div className="flex justify-between items-center mt-2 border-t pt-2">
                                                <div>
                                                    {hasMpCost && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-8 text-xs px-3 gap-1.5 border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 hover:text-purple-900 transition-all font-semibold"
                                                            onClick={(e) => handleUseSkill(e, skill)}
                                                        >
                                                            <Zap className="w-3.5 h-3.5" />
                                                            Каст
                                                        </Button>
                                                    )}
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={(e) => handleRemoveSkill(e, index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}

                                        {!isMobile && (
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-8 w-8 text-muted-foreground hover:text-destructive transition-opacity",
                                                        "opacity-0 group-hover:opacity-100"
                                                    )}
                                                    onClick={(e) => handleRemoveSkill(e, index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {skills.length === 0 && (
                                <div className="p-8 text-center text-muted-foreground">
                                    Вы еще не изучили ни одного навыка.
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* View Skill Details Dialog */}
            <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedSkill?.name}
                        </DialogTitle>
                        <div className="flex gap-2 pt-2 flex-wrap">
                            {(() => {
                                const dbSkill = SKILLS.find(s => s.id === selectedSkill?.id);
                                const originLabel = dbSkill?.requirements.race ? `Раса: ${dbSkill.requirements.race}` :
                                    dbSkill?.requirements.style ? `Стиль: ${dbSkill.requirements.style}` :
                                        "Общий";
                                return <Badge variant="outline" className="bg-background text-primary border-primary/20">{originLabel}</Badge>;
                            })()}
                            <Badge variant="outline">{selectedSkill?.classification || SKILLS.find(s => s.id === selectedSkill?.id)?.classification}</Badge>
                            <Badge variant="secondary">{selectedSkill?.cost}</Badge>
                            {selectedSkill?.timing && <Badge variant="secondary" className="bg-muted text-muted-foreground">⏱ {selectedSkill.timing}</Badge>}
                        </div>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="rounded-md bg-muted/50 p-3 text-sm">
                            <span className="font-semibold text-primary block mb-1">Эффект:</span>
                            {selectedSkill?.effect}
                        </div>
                        <div className="text-sm text-muted-foreground italic">
                            {SKILLS.find(s => s.id === selectedSkill?.id)?.description || "Описание недоступно."}
                        </div>
                        <Button
                            variant="destructive"
                            className="w-full mt-4"
                            onClick={() => {
                                const index = skills.findIndex(s => s.id === selectedSkill?.id);
                                if (index !== -1) handleRemoveSkill(null as any, index);
                            }}
                        >
                            <Trash2 className="w-4 h-4 mr-2" /> Удалить навык
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function getSkillColor(skill: Skill) {
    if (skill.classification === "Раса" || skill.requirements.race) return "border-l-pink-500";
    if (skill.classification === "Общий" || !skill.requirements.style) return "border-l-zinc-500"; // Changed to zinc for better neutral visibility

    switch (skill.requirements.style) {
        case "Энчантер": return "border-l-orange-500";
        case "Кастер": return "border-l-blue-500";
        case "Шутер": return "border-l-emerald-500";
        case "Шейпшифтер": return "border-l-violet-500";
        case "Сейкрифер": return "border-l-amber-500"; // Yellow-ish
        case "Мистик": return "border-l-indigo-500";
        default: return "border-l-gray-300";
    }
}
