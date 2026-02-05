"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { characterSchema, defaultCharacter, type CharacterSheetData } from "@/lib/schema";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiceModal } from "./dice-modal";
import TiptapEditor from "./tiptap-editor";
import { ImageUpload } from "./image-upload";
import { ResetModal } from "./reset-modal";
import { MemoriesSheet } from "./memories-sheet";
import { SkillsManager } from "./skills-manager";
import { InventoryManager } from "./inventory-manager";
import { CreditsModal } from "./credits-modal";
import { NotesSection } from "./notes-section";
import { unequipItem, EquipmentSlotKey } from "@/lib/equipment-logic";
import { toast } from "sonner";
import { Download, Upload, Dice5, Save, PlusCircle, Trash2, Minus, Plus, User, Sword, FileText, Backpack, RefreshCcw, Layout, ClipboardList, ArrowUpCircle, ChevronDown, BookOpen, ArrowDown, Users } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";

import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const tabs = ["general", "combat", "skills", "stats", "inventory"] as const;
type TabType = typeof tabs[number];

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? "100%" : "-100%",
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction < 0 ? "100%" : "-100%",
        opacity: 0,
    }),
};

const statKeys = ['body', 'intellect', 'mysticism', 'agility', 'passion', 'charisma'] as const;
const statLabels: Record<typeof statKeys[number], string> = {
    body: "Телосложение",
    intellect: "Интеллект",
    mysticism: "Мистицизм",
    agility: "Ловкость",
    passion: "Страсть / пыл",
    charisma: "Харизма"
};

const combatStatLabels: Record<keyof Omit<CharacterSheetData['combat'], 'baseDamage'>, string> = {
    magicPower: "Магическая сила",
    evasion: "Уклонение",
    defense: "Защита",
    enemyRecognition: "Распознавание врага",
    evaluation: "Оценка",
};

const equipmentSlotLabels: Record<keyof CharacterSheetData['equipment'], string> = {
    rightHand: "Правая рука",
    leftHand: "Левая рука",
    head: "Голова",
    body: "Тело",
    extraDefense: "Доп. защита",
    magic: "Магия",
};

const RACES = {
    "Человек": { body: 8, intellect: 7, mysticism: 7, agility: 8, passion: 10, charisma: 10 },
    "Эльф": { body: 7, intellect: 12, mysticism: 7, agility: 8, passion: 8, charisma: 8 },
    "Ангел": { body: 8, intellect: 10, mysticism: 10, agility: 8, passion: 7, charisma: 7 },
    "Зверочеловек": { body: 8, intellect: 7, mysticism: 8, agility: 12, passion: 7, charisma: 8 },
} as const;

const STYLES = {
    "Энчантер": { stats: { body: 1, intellect: 0, mysticism: 1, agility: 0, passion: 1, charisma: 0 }, hp: 30, mp: 15 },
    "Кастер": { stats: { body: 0, intellect: 1, mysticism: 0, agility: 0, passion: 1, charisma: 1 }, hp: 28, mp: 17 },
    "Шутер": { stats: { body: 0, intellect: 1, mysticism: 0, agility: 1, passion: 0, charisma: 1 }, hp: 27, mp: 18 },
    "Шейпшифтер": { stats: { body: 1, intellect: 0, mysticism: 1, agility: 1, passion: 0, charisma: 0 }, hp: 30, mp: 15 },
    "Сейкрифер": { stats: { body: 0, intellect: 1, mysticism: 1, agility: 0, passion: 1, charisma: 0 }, hp: 28, mp: 17 },
    "Мистик": { stats: { body: 1, intellect: 0, mysticism: 1, agility: 0, passion: 1, charisma: 0 }, hp: 29, mp: 16 },
} as const;

const ELEMENTS = {
    "Земля": { body: 1, intellect: 0, mysticism: 0, agility: 0, passion: 0, charisma: 0 },
    "Вода": { body: 0, intellect: 0, mysticism: 1, agility: 0, passion: 0, charisma: 0 },
    "Огонь": { body: 0, intellect: 1, mysticism: 0, agility: 0, passion: 0, charisma: 0 },
    "Ветер": { body: 0, intellect: 0, mysticism: 0, agility: 1, passion: 0, charisma: 0 },
    "Свет": { body: 0, intellect: 0, mysticism: 0, agility: 0, passion: 0, charisma: 1 },
    "Тьма": { body: 0, intellect: 0, mysticism: 0, agility: 0, passion: 1, charisma: 0 },
} as const;

import { ChangelogModal } from "@/components/changelog-modal";
import { PremadeCharacterModal } from "./premade-character-modal";
import { APP_VERSION, getCurrentChangelog } from "@/lib/changelog";

// ... existing imports ...

export default function CharacterSheet() {
    const [diceState, setDiceState] = useState<{ open: boolean; notation: string; title: string }>({
        open: false,
        notation: "2d6",
        title: "",
    });

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
    const [isPremadeModalOpen, setIsPremadeModalOpen] = useState(false);
    const [sheetMode, setSheetMode] = useState<"character" | "memories">("character");

    // Tab state for mobile view
    const [activeTab, setActiveTab] = useState<TabType>("general");
    const [direction, setDirection] = useState(0);

    const [isChangelogOpen, setIsChangelogOpen] = useState(false);
    const [isStatsTableMode, setIsStatsTableMode] = useState(false);

    // Fix for duplicate inputs: Check screen size
    const [mounted, setMounted] = useState(false);
    const [isDesktop, setIsDesktop] = useState(true); // Default to true to avoid hydration mismatch flickering if possible, or false.

    useEffect(() => {
        setMounted(true);
        const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
        checkDesktop();
        window.addEventListener('resize', checkDesktop);

        // Check for updates
        const currentLog = getCurrentChangelog();
        const lastVersion = localStorage.getItem("pd_app_version");
        const lastDate = localStorage.getItem("pd_app_date");

        if (lastVersion !== currentLog.version || lastDate !== currentLog.date) {
            setIsChangelogOpen(true);
        }

        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // ... (rest of hook calls)

    const handleTabChange = (newTab: TabType) => {
        const currentIndex = tabs.indexOf(activeTab);
        const nextIndex = tabs.indexOf(newTab);
        if (currentIndex === nextIndex) return;
        setDirection(nextIndex > currentIndex ? 1 : -1);
        setActiveTab(newTab);
    };

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
        const swipe = swipePower(offset.x, velocity.x);

        if (swipe < -swipeConfidenceThreshold) {
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex < tabs.length - 1) {
                handleTabChange(tabs[currentIndex + 1]);
            }
        } else if (swipe > swipeConfidenceThreshold) {
            const currentIndex = tabs.indexOf(activeTab);
            if (currentIndex > 0) {
                handleTabChange(tabs[currentIndex - 1]);
            }
        }
    };




    const form = useForm<CharacterSheetData>({
        resolver: zodResolver(characterSchema),
        defaultValues: defaultCharacter,
        mode: "onBlur",
    });

    const { register, control, watch, reset, getValues, setValue } = form;
    const values = watch();

    const { fields: skills, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });
    const { fields: enchantments, append: appendEnchantment, remove: removeEnchantment } = useFieldArray({ control, name: "enchantments" });

    // Using watch for inventory instead of FieldArray for DB-driven approach
    // const {fields: inventory, append: appendInventory, remove: removeInventory } = useFieldArray({
    //     control: form.control,
    //     name: "inventory",
    // });
    const inventory = form.watch("inventory") || [];

    // Calculate totals
    const equipmentWeight = Object.values(values.equipment || {}).reduce((acc: number, item: { weight: number }) => acc + (Number(item.weight) || 0), 0);
    const currentWeight = (inventory?.reduce((sum, item) => sum + (Number(item.weight) || 0), 0) || 0) + equipmentWeight;

    // Загрузка, сохранение, импорт/экспорт...
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("pd-character-data");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);

                    // Migration: Convert legacy string notes to array
                    if (typeof parsed.notes === 'string') {
                        parsed.notes = parsed.notes ? [{
                            id: crypto.randomUUID(),
                            title: "Сохраненные заметки",
                            content: parsed.notes
                        }] : [];
                    }

                    const result = characterSchema.safeParse(parsed);

                    if (result.success) {
                        reset(result.data);
                        toast.success("Данные успешно восстановлены");
                    } else {
                        console.error("Validation error in saved data:", result.error);
                        toast.error("Ошибка валидации сохраненных данных. Некоторые поля могут быть сброшены.");
                        // Optional: Attempt to load partial data or just fail? 
                        // For safety, let's try to load what we parsed but warn user
                        reset(parsed);
                    }
                } catch (e) { console.error("Ошибка загрузки автосохранения", e); }
            }
        }
    }, [reset]);

    useEffect(() => {
        const subscription = watch((value) => {
            if (value) {
                // Ensure we only save if it looks roughly like an object? 
                // Watch returns the form data, usually safe to stringify.
                localStorage.setItem("pd-character-data", JSON.stringify(value));
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const handleExport = () => {
        const data = getValues();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.name || "character"}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Файл персонажа сохранен");
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                // Migration: Convert legacy string notes to array
                if (typeof json.notes === 'string') {
                    json.notes = json.notes ? [{
                        id: crypto.randomUUID(),
                        title: "Импортированные заметки",
                        content: json.notes
                    }] : [];
                }

                const result = characterSchema.safeParse(json);

                if (result.success) {
                    reset(result.data);
                    toast.success("Персонаж и медиа-данные загружены");
                } else {
                    console.error("Import Validation Error:", result.error);
                    toast.error("Ошибка: Неверный формат файла персонажа.");
                    // For file import, strictly reject invalid schema to avoid corrupting current state
                    // allowing partial load might be confusing.
                }
            } catch (err) {
                console.error("Import error:", err);
                toast.error("Ошибка при чтении файла");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const rollDice = (notation: string, title?: string) => {
        if (!notation) {
            toast.warning("Не указана формула для броска");
            return;
        }
        // Robustly replace 'd' with 'd6' if it's not followed by a digit (implied d6)
        // This handles "3d", "3d + 5", "d", "d+2" etc.
        const finalNotation = notation.trim().replace(/d(?![0-9])/gi, 'd6');

        setDiceState({ open: true, notation: finalNotation, title: `Проверка: ${title || "Бросок"}` });
    };

    // Расчеты для таблицы характеристик
    const calculatedStats = statKeys.reduce((acc, key) => {
        const stat = values.stats?.[key];
        const baseSum = (Number(stat?.race) || 0) + (Number(stat?.bonus) || 0);
        const dividedBy3 = Math.floor(baseSum / 3);
        const finalStat = dividedBy3 + (Number(stat?.style) || 0) + (Number(stat?.element) || 0) + (Number(stat?.other) || 0);
        acc[key] = { baseSum, dividedBy3, finalStat };
        return acc;
    }, {} as Record<typeof statKeys[number], { baseSum: number; dividedBy3: number; finalStat: number }>);

    // Helper to evaluate math expression safely (e.g., "10-1" -> 9)
    const evaluateMath = (str: string): number => {
        if (!str) return 0;
        try {
            // Remove any non-math characters except digits, +, -, *, /, (, )
            const sanitized = str.replace(/[^0-9+\-*/().]/g, '');
            if (!sanitized) return 0;
            // eslint-disable-next-line no-new-func
            return new Function('return ' + sanitized)();
        } catch {
            return 0;
        }
    };

    if (!mounted) return null;

    return (
        <div className="container mx-auto p-2 md:p-6 space-y-4 max-w-screen-2xl font-sans">
            {/* Верхняя панель */}
            <header className="flex flex-col gap-4 bg-zinc-100/50 dark:bg-zinc-900/50 p-4 rounded-xl border shadow-sm z-20 backdrop-blur-md relative">
                <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                        {values.image && (
                            <div className="w-8 h-8 rounded-full border bg-muted overflow-hidden md:hidden shadow-inner">
                                <img src={values.image} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <h1 className="text-xl font-bold tracking-tight hidden md:block">LoPC</h1>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{
                                scale: 0.95,
                                rotate: [0, -5, 5, -5, 5, 0],
                            }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setIsCreditsModalOpen(true)}
                            className="px-3 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-xs whitespace-nowrap cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                        >
                            by jurikarti
                        </motion.button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => setIsPremadeModalOpen(true)} className="h-8">
                            <Users className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Готовые Персонажи</span>
                        </Button>

                        <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()} className="h-8">
                            <Upload className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Импорт</span>
                        </Button>
                        <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImport} />

                        <Button variant="outline" size="sm" onClick={handleExport} className="h-8 font-medium">
                            <Download className="mr-0 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Экспорт</span>
                        </Button>

                        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
                            onClick={() => setIsResetModalOpen(true)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>

                        <div className="h-8 w-px bg-border mx-1 hidden sm:block" />

                        <ModeToggle />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
                    <div className="flex flex-col gap-1 w-full lg:w-auto">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold ml-1">Режим листа</Label>
                        <Tabs value={sheetMode} onValueChange={(v) => setSheetMode(v as any)} className="w-full lg:w-[320px]">
                            <TabsList className="grid w-full grid-cols-2 h-9">
                                <TabsTrigger value="character" className="flex items-center gap-2 text-xs">
                                    <Layout className="w-3.5 h-3.5" /> Лист игрока
                                </TabsTrigger>
                                <TabsTrigger value="memories" className="flex items-center gap-2 text-xs">
                                    <ClipboardList className="w-3.5 h-3.5" /> Воспоминания
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    <div className="space-y-1 w-full lg:w-1/4">
                        <Label className="text-[10px] uppercase text-muted-foreground font-bold">Имя персонажа</Label>
                        <Input {...register("name")} className="h-9" />
                    </div>

                    <div className="hidden lg:grid grid-cols-3 gap-3 flex-grow">
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Имя игрока</Label>
                            <Input {...register("playerName")} className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Наставник</Label>
                            <Input {...register("mentor")} className="h-9" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Имя Мастера</Label>
                            <Input {...register("masterName")} className="h-9" />
                        </div>
                    </div>
                </div>
            </header>


            <AnimatePresence mode="wait">
                {sheetMode === "memories" ? (
                    <motion.div
                        key="memories"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        <MemoriesSheet register={register} control={control} values={values} rollDice={rollDice} />
                    </motion.div>
                ) : (
                    <div key="character">
                        {/* Desktop View: Grid layout, always visible as a unit */}
                        {isDesktop && (
                            <div className="hidden lg:grid grid-cols-12 gap-4">
                                {/* ... existing desktop grid content ... */}
                                {/* Left Column */}
                                <div className="col-span-3 space-y-4">
                                    {/* Внешность */}
                                    <Card>
                                        <CardHeader><CardTitle className="text-sm">Внешность</CardTitle></CardHeader>
                                        <CardContent>
                                            <Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />} />
                                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                                {(['age', 'gender', 'height', 'hairColor', 'eyeColor', 'skinColor'] as const).map(key => (
                                                    <div key={key} className="space-y-1">
                                                        <Label className="text-xs text-muted-foreground">{key === 'age' ? 'Возраст' : key === 'gender' ? 'Пол' : key === 'height' ? 'Рост' : key === 'hairColor' ? 'Цвет волос' : key === 'eyeColor' ? 'Цвет глаз' : 'Цвет кожи'}</Label>
                                                        <Input {...register(key)} />
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Ресурсы */}
                                    <Card>
                                        <CardHeader><CardTitle className="text-sm">Ресурсы</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            {(['hp', 'mp', 'wp'] as const).map((pool) => {
                                                const colors: Record<string, string> = {
                                                    hp: "bg-red-500/80 dark:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                                    mp: "bg-blue-500/80 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                                                    wp: "bg-purple-500/80 dark:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
                                                };
                                                return (
                                                    <div key={pool} className="space-y-2">
                                                        <div className="flex justify-between text-xs font-bold uppercase"><span>{pool}</span><span>{values[pool]?.current} / {values[pool]?.max}</span></div>
                                                        <Progress value={(values[pool]?.current / (values[pool]?.max || 1)) * 100} className="h-3" indicatorClassName={colors[pool]} />
                                                        <div className="flex gap-2">
                                                            <div className="w-1/2 space-y-1"><Label className="text-[10px] uppercase text-muted-foreground">Тек.</Label><Input type="number" {...register(`${pool}.current`)} className="h-8" /></div>
                                                            <div className="w-1/2 space-y-1"><Label className="text-[10px] uppercase text-muted-foreground">Макс.</Label><Input type="number" {...register(`${pool}.max`)} className="h-8" /></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>

                                    {/* Заметки */}
                                    <NotesSection control={control} register={register} />
                                </div>

                                {/* Right Column */}
                                <div className="col-span-9 space-y-4">
                                    <Card>
                                        <CardContent className="p-6 grid grid-cols-3 gap-8">
                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Жизненный путь</h3>
                                                <div className="space-y-3">
                                                    {(['origin', 'secret', 'future', 'focusItem'] as const).map(key => (
                                                        <div key={key} className="space-y-1">
                                                            <Label className="text-xs">{key === 'origin' ? 'Происхождение' : key === 'secret' ? 'Секрет' : key === 'future' ? 'Будущее' : 'Фокусирующий предмет'}</Label>
                                                            <Input {...register(key)} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Боевые параметры</h3>
                                                <div className="space-y-3">
                                                    {(['magicPower', 'evasion', 'defense'] as const).map(key => {
                                                        const combatStat = values.combat?.[key];
                                                        const base = combatStat?.check || "2d6";
                                                        const modString = combatStat?.modifier || "";

                                                        // Evaluated modifier value (e.g. "10-1" -> 9)
                                                        const modValue = evaluateMath(modString);

                                                        // Construct total string: "2d6+9" or "2d6-2"
                                                        const sign = modValue >= 0 ? "+" : "";
                                                        const total = `${base}${sign}${modValue}`;

                                                        return (
                                                            <div key={key} className="space-y-1">
                                                                <Label className="text-xs">{combatStatLabels[key]}</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <div className="relative flex-grow"><Input {...register(`combat.${key}.check`)} className="pr-8" placeholder="2d6" /></div>
                                                                    <span className="text-muted-foreground">+</span>
                                                                    <Input {...register(`combat.${key}.modifier`)} className="w-20 text-center" placeholder="Mod" />
                                                                    <div className="flex items-center bg-muted rounded-md px-3 h-9 min-w-[4rem] justify-center font-mono text-sm border">{total}</div>
                                                                    <Button type="button" size="icon" variant="ghost" onClick={() => rollDice(total, combatStatLabels[key])}><Dice5 className="w-4 h-4" /></Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <div className="flex gap-4">
                                                    <div className="relative group w-24 h-24 shrink-0 flex items-center justify-center">
                                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />
                                                        <div className="absolute inset-0 transform -rotate-90">
                                                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                                                <circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" />
                                                                <circle className="text-primary stroke-current transition-all duration-500 ease-out" strokeWidth="8" strokeLinecap="round" fill="transparent" r="42" cx="50" cy="50" style={{ strokeDasharray: 263.89, strokeDashoffset: 263.89 - ((values.level || 0) / 6) * 263.89 }} />
                                                            </svg>
                                                        </div>
                                                        <div className="relative z-10 flex flex-col items-center justify-center h-full w-full"><span className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground absolute top-4">GL</span><span className="text-4xl font-black mt-2">{values.level}</span></div>
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-1 -ml-2">
                                                        <Button type="button" variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => { const current = values.level || 0; if (current < 6) setValue("level", current + 1); }} disabled={(values.level || 0) >= 6}><Plus className="h-3 w-3" /></Button>
                                                        <Button type="button" variant="outline" size="icon" className="h-6 w-6 rounded-full" onClick={() => { const current = values.level || 0; if (current > 0) setValue("level", current - 1); }} disabled={(values.level || 0) <= 0}><Minus className="h-3 w-3" /></Button>
                                                    </div>
                                                    <div className="flex-grow flex flex-col justify-center gap-1.5">
                                                        <div className="flex justify-between items-baseline px-1">
                                                            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Опыт (XP)</Label>
                                                            {(values.exp || 0) >= 10000 && (
                                                                <Button
                                                                    type="button"
                                                                    size="sm"
                                                                    variant="default" // Use primary color to stand out
                                                                    className="h-6 text-[10px] px-2 animate-pulse bg-green-600 hover:bg-green-700 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]"
                                                                    onClick={() => {
                                                                        const currentLevel = values.level || 0;
                                                                        if (currentLevel < 6) {
                                                                            setValue("level", currentLevel + 1);
                                                                            setValue("exp", 0);
                                                                            toast.success(`Уровень повышен! GL: ${currentLevel + 1}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    <ArrowUpCircle className="w-3 h-3 mr-1" />
                                                                    Level Up
                                                                </Button>
                                                            )}
                                                        </div>
                                                        <div className="relative"><Input type="number" {...register("exp")} className="h-10 text-right font-mono text-lg bg-muted/40 border-muted-foreground/20" /><div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div></div>
                                                        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden"><div className="h-full bg-primary/50 w-full animate-pulse" style={{ width: `${Math.min(((values.exp || 0) / 10000) * 100, 100)}%` }} /></div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    {(['enemyRecognition', 'evaluation'] as const).map(key => {
                                                        const combatStat = values.combat?.[key];
                                                        const base = combatStat?.check || "2d6";
                                                        const modString = combatStat?.modifier || "";

                                                        const modValue = evaluateMath(modString);
                                                        const sign = modValue >= 0 ? "+" : "";
                                                        const total = `${base}${sign}${modValue}`;

                                                        return (
                                                            <div key={key} className="space-y-1">
                                                                <Label className="text-xs">{combatStatLabels[key]}</Label>
                                                                <div className="flex items-center gap-2">
                                                                    <Input {...register(`combat.${key}.check`)} className="flex-grow" placeholder="2d6" />
                                                                    <span className="text-muted-foreground small">+</span>
                                                                    <Input {...register(`combat.${key}.modifier`)} className="w-20 text-center" placeholder="0" />
                                                                    <Button type="button" size="icon" variant="secondary" className="h-9 w-9 shrink-0" onClick={() => rollDice(total, combatStatLabels[key])}><Dice5 className="w-4 h-4" /></Button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Stats Table */}
                                    <Card>
                                        <CardHeader><CardTitle className="text-sm">Характеристики</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="rounded-md border overflow-x-auto">
                                                <table className="w-full text-sm min-w-[600px]">
                                                    <thead><tr className="bg-muted/50 border-b"><th className="h-10 px-4 text-left align-middle font-medium text-muted-foreground border-r w-[200px]">Параметр / Атрибут</th>{statKeys.map(key => (<th key={key} className="h-10 px-4 text-center align-middle font-medium text-muted-foreground border-r last:border-r-0">{statLabels[key]}</th>))}</tr></thead>
                                                    <tbody className="[&_tr:last-child]:border-0">
                                                        <tr className="border-b">
                                                            <td className="p-2 align-middle border-r">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="w-full h-8 justify-between font-normal px-2 border-transparent shadow-none hover:bg-muted/50">
                                                                            {values.raceName || "Выбрать расу"}
                                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="start" className="w-[180px]">
                                                                        {Object.keys(RACES).map((race) => (
                                                                            <DropdownMenuItem
                                                                                key={race}
                                                                                onClick={() => {
                                                                                    setValue("raceName", race);
                                                                                    const stats = RACES[race as keyof typeof RACES];
                                                                                    setValue("stats.body.race", stats.body);
                                                                                    setValue("stats.intellect.race", stats.intellect);
                                                                                    setValue("stats.mysticism.race", stats.mysticism);
                                                                                    setValue("stats.agility.race", stats.agility);
                                                                                    setValue("stats.passion.race", stats.passion);
                                                                                    setValue("stats.charisma.race", stats.charisma);
                                                                                }}
                                                                            >
                                                                                {race}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                            {statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Input type="number" {...register(`stats.${key}.race`)} className="h-8 w-full text-center border-transparent bg-transparent shadow-none no-spinner" /></td>))}
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className={`p-2 align-middle border-r font-medium text-xs ${Object.values(values.stats).reduce((acc, stat) => acc + (Number(stat.bonus) || 0), 0) > 5 ? "text-red-500 font-bold" : "text-muted-foreground"}`}>
                                                                Бонус ({Object.values(values.stats).reduce((acc, stat) => acc + (Number(stat.bonus) || 0), 0)}/5 очков)
                                                            </td>
                                                            {statKeys.map(key => (
                                                                <td key={key} className="p-2 align-middle border-r last:border-r-0">
                                                                    <Input
                                                                        type="number"
                                                                        {...register(`stats.${key}.bonus`)}
                                                                        className={`h-8 w-full text-center border-transparent bg-transparent shadow-none no-spinner ${Object.values(values.stats).reduce((acc, stat) => acc + (Number(stat.bonus) || 0), 0) > 5 ? "text-red-500 font-bold" : ""}`}
                                                                    />
                                                                </td>
                                                            ))}
                                                        </tr>
                                                        <tr className="border-b"><td className="p-2 align-middle border-r font-semibold text-xs">Сумма базовых значений</td>{statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Input disabled value={calculatedStats[key]?.baseSum || 0} className="h-8 w-full text-center border-transparent bg-transparent shadow-none disabled:opacity-100 font-semibold" /></td>))}</tr>
                                                        <tr className="bg-primary/5 dark:bg-primary/10 border-b"><td className="p-2 align-middle border-r font-semibold text-xs text-foreground">(Базовое значение ÷ 3)</td>{statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Input disabled value={calculatedStats[key]?.dividedBy3 || 0} className="h-8 w-full text-center border-transparent bg-transparent shadow-none disabled:opacity-100 font-semibold" /></td>))}</tr>
                                                        <tr className="border-b">
                                                            <td className="p-2 align-middle border-r">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="w-full h-8 justify-between font-normal px-2 border-transparent shadow-none hover:bg-muted/50">
                                                                            {values.styleName || "Выбрать стиль"}
                                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="start" className="w-[180px]">
                                                                        {Object.keys(STYLES).map((style) => (
                                                                            <DropdownMenuItem
                                                                                key={style}
                                                                                onClick={() => {
                                                                                    setValue("styleName", style);
                                                                                    const data = STYLES[style as keyof typeof STYLES];
                                                                                    setValue("stats.body.style", data.stats.body);
                                                                                    setValue("stats.intellect.style", data.stats.intellect);
                                                                                    setValue("stats.mysticism.style", data.stats.mysticism);
                                                                                    setValue("stats.agility.style", data.stats.agility);
                                                                                    setValue("stats.passion.style", data.stats.passion);
                                                                                    setValue("stats.charisma.style", data.stats.charisma);
                                                                                    // Update Max HP/MP
                                                                                    setValue("hp.max", data.hp);
                                                                                    setValue("mp.max", data.mp);
                                                                                    toast.success(`Стиль ${style} выбран! HP/MP обновлены.`);
                                                                                }}
                                                                            >
                                                                                {style}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                            {statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Input type="number" {...register(`stats.${key}.style`)} className="h-8 w-full text-center border-transparent bg-transparent shadow-none no-spinner" /></td>))}
                                                        </tr>
                                                        <tr className="border-b">
                                                            <td className="p-2 align-middle border-r">
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" className="w-full h-8 justify-between font-normal px-2 border-transparent shadow-none hover:bg-muted/50">
                                                                            {values.elementName || "Выбрать стихию"}
                                                                            <ChevronDown className="h-3 w-3 opacity-50" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="start" className="w-[180px]">
                                                                        {Object.keys(ELEMENTS).map((element) => (
                                                                            <DropdownMenuItem
                                                                                key={element}
                                                                                onClick={() => {
                                                                                    setValue("elementName", element);
                                                                                    const stats = ELEMENTS[element as keyof typeof ELEMENTS];
                                                                                    setValue("stats.body.element", stats.body);
                                                                                    setValue("stats.intellect.element", stats.intellect);
                                                                                    setValue("stats.mysticism.element", stats.mysticism);
                                                                                    setValue("stats.agility.element", stats.agility);
                                                                                    setValue("stats.passion.element", stats.passion);
                                                                                    setValue("stats.charisma.element", stats.charisma);
                                                                                }}
                                                                            >
                                                                                {element}
                                                                            </DropdownMenuItem>
                                                                        ))}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            </td>
                                                            {statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Input type="number" {...register(`stats.${key}.element`)} className="h-8 w-full text-center border-transparent bg-transparent shadow-none no-spinner" /></td>))}
                                                        </tr>
                                                        <tr className="bg-primary/5 dark:bg-primary/10 border-b"><td className="p-3 align-middle border-r font-bold text-primary">ХАРАКТЕРИСТИКИ</td>{statKeys.map(key => (<td key={key} className="p-3 align-middle border-r last:border-r-0"><Input disabled value={calculatedStats[key]?.finalStat || 0} className="h-9 w-full text-center border-transparent bg-transparent shadow-none disabled:opacity-100 font-bold text-xl p-0" /></td>))}</tr>
                                                        <tr className="border-b"><td className="p-2 align-middle border-r font-medium text-muted-foreground text-xs">Другие корректировки</td>{statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Input type="number" {...register(`stats.${key}.other`)} className="h-8 w-full text-center border-transparent bg-transparent shadow-none no-spinner" /></td>))}</tr>
                                                        <tr><td className="p-2 align-middle border-r font-semibold text-xs">Количество костей (Дайсы)</td>{statKeys.map(key => (<td key={key} className="p-2 align-middle border-r last:border-r-0"><Button type="button" variant="ghost" size="sm" className="w-full h-8 font-mono" onClick={() => rollDice(`${calculatedStats[key]?.finalStat}d6`, statLabels[key])}>{calculatedStats[key]?.finalStat} (2D)</Button></td>))}</tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* --- SKILLS --- */}
                                    <Card className="p-4 relative overflow-hidden">
                                        <SkillsManager
                                            form={form}
                                            level={values.level || 0}
                                            raceName={values.raceName}
                                            styleName={values.styleName}
                                        />
                                    </Card>

                                    {/* Equipment & Inventory */}
                                    <Card>
                                        <CardHeader><CardTitle className="text-sm">Экипировка и Инвентарь</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs min-w-[700px]">
                                                    <thead><tr><th className="text-left">Слот/Предмет</th><th className="w-16">Вес</th><th className="w-16">Попад.</th><th className="w-24">Урон</th><th className="w-16">Дальн.</th><th className="w-16">Уклон.</th><th className="w-16">Защита</th><th className="text-left">Примечание</th><th className="w-8"></th></tr></thead>
                                                    <tbody>
                                                        {(Object.keys(equipmentSlotLabels) as Array<keyof typeof equipmentSlotLabels>).map((slot) => (
                                                            <tr key={String(slot)} className="border-b border-muted/50 last:border-0 align-bottom group">
                                                                <td className="py-2 px-1"><div className="flex flex-col gap-0.5"><span className="text-[10px] text-muted-foreground font-semibold uppercase">{equipmentSlotLabels[slot]}</span><Input {...register(`equipment.${slot}.name`)} className="h-8" /></div></td>
                                                                <td className="py-2 px-1"><Input type="number" {...register(`equipment.${slot}.weight`)} className="h-8" /></td>
                                                                <td className="py-2 px-1"><Input type="number" {...register(`equipment.${slot}.hit`)} className="h-8" /></td>
                                                                <td className="py-2 px-1"><div className="flex items-center gap-1"><Input {...register(`equipment.${slot}.damage`)} className="h-8" /><Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => rollDice(values.equipment[slot].damage, values.equipment[slot].name)}><Dice5 className="w-4 h-4" /></Button></div></td>
                                                                <td className="py-2 px-1"><Input type="number" {...register(`equipment.${slot}.range`)} className="h-8" /></td>
                                                                <td className="py-2 px-1"><Input type="number" {...register(`equipment.${slot}.evasion`)} className="h-8" /></td>
                                                                <td className="py-2 px-1"><Input type="number" {...register(`equipment.${slot}.defense`)} className="h-8" /></td>
                                                                <td className="py-2 px-1"><Input {...register(`equipment.${slot}.notes`)} className="h-8" /></td>
                                                                <td className="py-2 px-1">
                                                                    {values.equipment[slot].name && (
                                                                        <Button
                                                                            type="button"
                                                                            variant="ghost"
                                                                            size="icon"
                                                                            className="h-8 w-8 text-muted-foreground hover:text-orange-500"
                                                                            title="Снять (вернуть в инвентарь)"
                                                                            onClick={() => {
                                                                                unequipItem(form, slot as EquipmentSlotKey);
                                                                                toast.info(`Снято: ${values.equipment[slot].name}`);
                                                                            }}
                                                                        >
                                                                            <ArrowDown className="w-4 h-4" />
                                                                        </Button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="mt-6">
                                                <InventoryManager form={form} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}

                        {/* Mobile View: Swipeable sections */}
                        {!isDesktop && (<>
                            <div className="lg:hidden relative min-h-[500px] overflow-x-hidden pb-12">
                                <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                                    <motion.div
                                        key={activeTab}
                                        custom={direction}
                                        variants={slideVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={1}
                                        onDragEnd={handleDragEnd}
                                        className="space-y-4 w-full"
                                    >
                                        {activeTab === "general" && (
                                            <>
                                                <Card>
                                                    <div className="p-4 grid grid-cols-2 gap-4">
                                                        <div className="space-y-1 col-span-2">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Имя персонажа</Label>
                                                            <Input {...register("name")} className="h-9" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Игрок</Label>
                                                            <Input {...register("playerName")} className="h-9" />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Наставник</Label>
                                                            <Input {...register("mentor")} className="h-9" />
                                                        </div>
                                                        <div className="space-y-1 col-span-2">
                                                            <Label className="text-[10px] uppercase text-muted-foreground font-bold">Имя Мастера</Label>
                                                            <Input {...register("masterName")} className="h-9" />
                                                        </div>
                                                    </div>
                                                </Card>
                                                <Card>
                                                    <CardHeader><CardTitle className="text-sm">Внешность</CardTitle></CardHeader>
                                                    <CardContent>
                                                        <Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />} />
                                                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                                            {(['age', 'gender', 'height', 'hairColor', 'eyeColor', 'skinColor'] as const).map(key => (
                                                                <div key={key} className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">{key === 'age' ? 'Возраст' : key === 'gender' ? 'Пол' : key === 'height' ? 'Рост' : key === 'hairColor' ? 'Цвет волос' : key === 'eyeColor' ? 'Цвет глаз' : 'Цвет кожи'}</Label>
                                                                    <Input {...register(key)} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-6 space-y-4">
                                                        <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Жизненный путь</h3>
                                                        <div className="space-y-3">
                                                            {(['origin', 'secret', 'future', 'focusItem'] as const).map(key => (
                                                                <div key={key} className="space-y-1">
                                                                    <Label className="text-xs">{key === 'origin' ? 'Происхождение' : key === 'secret' ? 'Секрет' : key === 'future' ? 'Будущее' : 'Фокусирующий предмет'}</Label>
                                                                    <Input {...register(key)} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </CardContent>
                                                </Card>

                                                {/* Заметки (Мобильная версия) */}
                                                <NotesSection control={control} register={register} />
                                            </>
                                        )}

                                        {activeTab === "combat" && (
                                            <>
                                                <Card>
                                                    <CardHeader><CardTitle className="text-sm">Ресурсы</CardTitle></CardHeader>
                                                    <CardContent className="space-y-4">
                                                        {(['hp', 'mp', 'wp'] as const).map((pool) => {
                                                            const colors: Record<string, string> = {
                                                                hp: "bg-red-500/80 dark:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                                                mp: "bg-blue-500/80 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                                                                wp: "bg-purple-500/80 dark:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
                                                            };
                                                            return (
                                                                <div key={pool} className="space-y-2">
                                                                    <div className="flex justify-between text-xs font-bold uppercase"><span>{pool}</span><span>{values[pool]?.current} / {values[pool]?.max}</span></div>
                                                                    <Progress value={(values[pool]?.current / (values[pool]?.max || 1)) * 100} className="h-3" indicatorClassName={colors[pool]} />
                                                                    <div className="flex gap-2">
                                                                        <div className="w-1/2 space-y-1">
                                                                            <Label className="text-[10px] text-muted-foreground uppercase">Тек.</Label>
                                                                            <Input type="number" {...register(`${pool}.current`)} className="h-8" />
                                                                            <div className="flex gap-1 h-8">
                                                                                <Button type="button" variant="outline" className="flex-1 h-full p-0" onClick={() => {
                                                                                    const current = Number(getValues(`${pool}.current`)) || 0;
                                                                                    setValue(`${pool}.current` as any, current - 1);
                                                                                }}><Minus className="w-4 h-4" /></Button>
                                                                                <Button type="button" variant="outline" className="flex-1 h-full p-0" onClick={() => {
                                                                                    const current = Number(getValues(`${pool}.current`)) || 0;
                                                                                    setValue(`${pool}.current` as any, current + 1);
                                                                                }}><Plus className="w-4 h-4" /></Button>
                                                                            </div>
                                                                        </div>
                                                                        <div className="w-1/2 space-y-1">
                                                                            <Label className="text-[10px] text-muted-foreground uppercase">Макс.</Label>
                                                                            <Input type="number" {...register(`${pool}.max`)} className="h-8" />
                                                                            <div className="flex gap-1 h-8">
                                                                                <Button type="button" variant="outline" className="flex-1 h-full p-0" onClick={() => {
                                                                                    const current = Number(getValues(`${pool}.max`)) || 0;
                                                                                    setValue(`${pool}.max` as any, current - 1);
                                                                                }}><Minus className="w-4 h-4" /></Button>
                                                                                <Button type="button" variant="outline" className="flex-1 h-full p-0" onClick={() => {
                                                                                    const current = Number(getValues(`${pool}.max`)) || 0;
                                                                                    setValue(`${pool}.max` as any, current + 1);
                                                                                }}><Plus className="w-4 h-4" /></Button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </CardContent>
                                                </Card>
                                                <Card>
                                                    <CardContent className="p-6 space-y-6">
                                                        <div className="flex justify-center gap-6">
                                                            <div className="relative group w-24 h-24 shrink-0 flex items-center justify-center">
                                                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                                                                <div className="absolute inset-0 transform -rotate-90">
                                                                    <svg className="w-full h-full" viewBox="0 0 100 100"><circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="42" cx="50" cy="50" /><circle className="text-primary stroke-current transition-all duration-500 ease-out" strokeWidth="8" strokeLinecap="round" fill="transparent" r="42" cx="50" cy="50" style={{ strokeDasharray: 263.89, strokeDashoffset: 263.89 - ((values.level || 0) / 6) * 263.89 }} /></svg>
                                                                </div>
                                                                <div className="relative z-10 flex flex-col items-center justify-center h-full w-full"><span className="text-[0.6rem] font-black uppercase text-muted-foreground absolute top-4">GL</span><span className="text-4xl font-black mt-2">{values.level}</span></div>
                                                            </div>
                                                            <div className="flex flex-col justify-center gap-2">
                                                                <Button type="button" variant="outline" size="icon" onClick={() => { const current = values.level || 0; if (current < 6) setValue("level", current + 1); }} disabled={(values.level || 0) >= 6}><Plus className="h-3 w-3" /></Button>
                                                                <Button type="button" variant="outline" size="icon" onClick={() => { const current = values.level || 0; if (current > 0) setValue("level", current - 1); }} disabled={(values.level || 0) <= 0}><Minus className="h-3 w-3" /></Button>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2 px-2">
                                                            <div className="flex justify-between items-baseline">
                                                                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Опыт (XP)</Label>
                                                                {(values.exp || 0) >= 10000 && (
                                                                    <Button
                                                                        type="button"
                                                                        size="sm"
                                                                        variant="default"
                                                                        className="h-6 text-[10px] px-2 animate-pulse bg-green-600 hover:bg-green-700 text-white shadow-[0_0_10px_rgba(22,163,74,0.5)]"
                                                                        onClick={() => {
                                                                            const currentLevel = values.level || 0;
                                                                            if (currentLevel < 6) {
                                                                                setValue("level", currentLevel + 1);
                                                                                setValue("exp", 0);
                                                                                toast.success(`Уровень повышен! GL: ${currentLevel + 1}`);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <ArrowUpCircle className="w-3 h-3 mr-1" />
                                                                        Level Up
                                                                    </Button>
                                                                )}
                                                            </div>
                                                            <div className="relative"><Input type="number" {...register("exp")} className="h-10 text-right font-mono text-lg bg-muted/40 border-muted-foreground/20" /><div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50"><div className="w-1.5 h-1.5 rounded-full bg-primary" /></div></div>
                                                            <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden"><div className="h-full bg-primary/50 w-full animate-pulse" style={{ width: `${Math.min(((values.exp || 0) / 10000) * 100, 100)}%` }} /></div>
                                                        </div>
                                                        <div className="space-y-4">
                                                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Боевые параметры</h3>
                                                            {(['magicPower', 'evasion', 'defense'] as const).map(key => {
                                                                const combatStat = values.combat?.[key];
                                                                const base = combatStat?.check || "2d6";
                                                                const modString = combatStat?.modifier || "";

                                                                // Use evaluateMath identical to Desktop
                                                                const modValue = evaluateMath(modString);
                                                                const sign = modValue >= 0 ? "+" : "";
                                                                const total = `${base}${sign}${modValue}`;

                                                                return (
                                                                    <div key={key} className="space-y-1">
                                                                        <Label className="text-xs">{combatStatLabels[key]}</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <Input {...register(`combat.${key}.check`)} className="flex-grow" placeholder="2d6" />
                                                                            <Input {...register(`combat.${key}.modifier`)} className="w-14 text-center" placeholder="Mod" />
                                                                            <Button type="button" size="icon" variant="ghost" onClick={() => rollDice(total, combatStatLabels[key])}><Dice5 className="w-4 h-4" /></Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                        <div className="space-y-4 pt-4 border-t">
                                                            <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Особые проверки</h3>
                                                            {(['enemyRecognition', 'evaluation'] as const).map(key => {
                                                                const combatStat = values.combat?.[key];
                                                                const base = combatStat?.check || "2d6";
                                                                const modString = combatStat?.modifier || "";

                                                                const modValue = evaluateMath(modString);
                                                                const sign = modValue >= 0 ? "+" : "";
                                                                const total = `${base}${sign}${modValue}`;

                                                                return (
                                                                    <div key={key} className="space-y-1">
                                                                        <Label className="text-xs">{combatStatLabels[key]}</Label>
                                                                        <div className="flex items-center gap-2">
                                                                            <Input {...register(`combat.${key}.check`)} className="flex-grow" placeholder="2d6" />
                                                                            <Input {...register(`combat.${key}.modifier`)} className="w-14 text-center" placeholder="Mod" />
                                                                            <Button type="button" size="icon" variant="ghost" onClick={() => rollDice(total, combatStatLabels[key])}><Dice5 className="w-4 h-4" /></Button>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </>
                                        )}

                                        {activeTab === "skills" && (
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Навыки</CardTitle></CardHeader>
                                                <CardContent>
                                                    <SkillsManager
                                                        form={form}
                                                        isMobile={true}
                                                        level={values.level || 0}
                                                        raceName={values.raceName}
                                                        styleName={values.styleName}
                                                    />
                                                </CardContent>
                                            </Card>
                                        )}

                                        {activeTab === "stats" && (
                                            <div className="space-y-4">
                                                <div className="flex justify-end px-1">
                                                    <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg">
                                                        <Button
                                                            variant={!isStatsTableMode ? "secondary" : "ghost"}
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => setIsStatsTableMode(false)}
                                                        >
                                                            <Layout className="w-3 h-3 mr-1" />
                                                            Карточки
                                                        </Button>
                                                        <Button
                                                            variant={isStatsTableMode ? "secondary" : "ghost"}
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => setIsStatsTableMode(true)}
                                                        >
                                                            <ClipboardList className="w-3 h-3 mr-1" />
                                                            Таблица
                                                        </Button>
                                                    </div>
                                                </div>

                                                {!isStatsTableMode ? (
                                                    <div className="space-y-4">
                                                        {/* Configuration Card */}
                                                        <Card>
                                                            <CardHeader className="pb-3"><CardTitle className="text-sm">Настройка персонажа</CardTitle></CardHeader>
                                                            <CardContent className="grid grid-cols-1 gap-4">
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Раса</Label>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" className="w-full justify-between font-normal h-9">
                                                                                {values.raceName || "Выбрать расу"}
                                                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                            {Object.keys(RACES).map((race) => (
                                                                                <DropdownMenuItem key={race} onClick={() => {
                                                                                    setValue("raceName", race);
                                                                                    const stats = RACES[race as keyof typeof RACES];
                                                                                    setValue("stats.body.race", stats.body);
                                                                                    setValue("stats.intellect.race", stats.intellect);
                                                                                    setValue("stats.mysticism.race", stats.mysticism);
                                                                                    setValue("stats.agility.race", stats.agility);
                                                                                    setValue("stats.passion.race", stats.passion);
                                                                                    setValue("stats.charisma.race", stats.charisma);
                                                                                }}>{race}</DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Стиль боля</Label>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" className="w-full justify-between font-normal h-9">
                                                                                {values.styleName || "Выбрать стиль"}
                                                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                            {Object.keys(STYLES).map((style) => (
                                                                                <DropdownMenuItem key={style} onClick={() => {
                                                                                    setValue("styleName", style);
                                                                                    const styleData = STYLES[style as keyof typeof STYLES];
                                                                                    setValue("stats.body.style", styleData.stats.body);
                                                                                    setValue("stats.intellect.style", styleData.stats.intellect);
                                                                                    setValue("stats.mysticism.style", styleData.stats.mysticism);
                                                                                    setValue("stats.agility.style", styleData.stats.agility);
                                                                                    setValue("stats.passion.style", styleData.stats.passion);
                                                                                    setValue("stats.charisma.style", styleData.stats.charisma);
                                                                                    setValue("hp.max", styleData.hp);
                                                                                    setValue("mp.max", styleData.mp);
                                                                                    toast.success(`Стиль ${style} выбран! HP/MP обновлены.`);
                                                                                }}>{style}</DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-xs text-muted-foreground">Стихия</Label>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="outline" className="w-full justify-between font-normal h-9">
                                                                                {values.elementName || "Выбрать стихию"}
                                                                                <ChevronDown className="h-3 w-3 opacity-50" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
                                                                            {Object.keys(ELEMENTS).map((element) => (
                                                                                <DropdownMenuItem key={element} onClick={() => {
                                                                                    setValue("elementName", element);
                                                                                    const stats = ELEMENTS[element as keyof typeof ELEMENTS];
                                                                                    setValue("stats.body.element", stats.body);
                                                                                    setValue("stats.intellect.element", stats.intellect);
                                                                                    setValue("stats.mysticism.element", stats.mysticism);
                                                                                    setValue("stats.agility.element", stats.agility);
                                                                                    setValue("stats.passion.element", stats.passion);
                                                                                    setValue("stats.charisma.element", stats.charisma);
                                                                                }}>{element}</DropdownMenuItem>
                                                                            ))}
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </div>
                                                            </CardContent>
                                                        </Card>

                                                        {/* Stats Cards Grid */}
                                                        <div className="grid grid-cols-1 gap-3">
                                                            {statKeys.map(key => {
                                                                const final = calculatedStats[key]?.finalStat || 0;
                                                                return (
                                                                    <Card key={key} className="overflow-hidden">
                                                                        <div className="flex">
                                                                            {/* Left Side: Summary & Roll */}
                                                                            <div className="flex flex-col items-center justify-center bg-muted/30 w-24 p-3 border-r">
                                                                                <span className="text-2xl font-black text-primary">{final}</span>
                                                                                <span className="text-[10px] text-muted-foreground uppercase font-bold text-center leading-tight mb-2">{statLabels[key]}</span>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="outline"
                                                                                    className="h-8 w-full text-xs font-mono gap-1"
                                                                                    onClick={() => rollDice(`${final}d6`, statLabels[key])}
                                                                                >
                                                                                    <Dice5 className="w-3 h-3" />
                                                                                    {final}d
                                                                                </Button>
                                                                            </div>

                                                                            {/* Right Side: Details */}
                                                                            <div className="flex-1 p-3 space-y-3">
                                                                                <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                                                                    <div className="text-muted-foreground">База:</div>
                                                                                    <div className="font-mono text-right">{calculatedStats[key]?.baseSum || 0}</div>

                                                                                    <div className="text-muted-foreground">База ÷ 3:</div>
                                                                                    <div className="font-mono text-right">{calculatedStats[key]?.dividedBy3 || 0}</div>
                                                                                </div>

                                                                                <div className="grid grid-cols-2 gap-2 mt-2">
                                                                                    <div className="space-y-0.5">
                                                                                        <Label className="text-[10px] text-muted-foreground">Бонус</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            {...register(`stats.${key}.bonus`)}
                                                                                            className={`h-7 text-center ${Object.values(values.stats).reduce((acc, stat) => acc + (Number(stat.bonus) || 0), 0) > 5 ? "border-red-500 text-red-500" : ""}`}
                                                                                        />
                                                                                    </div>
                                                                                    <div className="space-y-0.5">
                                                                                        <Label className="text-[10px] text-muted-foreground">Прочее</Label>
                                                                                        <Input
                                                                                            type="number"
                                                                                            {...register(`stats.${key}.other`)}
                                                                                            className="h-7 text-center"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </Card>
                                                                );
                                                            })}

                                                            <div className={`text-center text-xs font-medium py-2 ${Object.values(values.stats).reduce((acc, stat) => acc + (Number(stat.bonus) || 0), 0) > 5 ? "text-red-500" : "text-muted-foreground"}`}>
                                                                Использовано бонусов: {Object.values(values.stats).reduce((acc, stat) => acc + (Number(stat.bonus) || 0), 0)} / 5
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <Card>
                                                        <CardHeader><CardTitle className="text-sm">Характеристики (Таблица)</CardTitle></CardHeader>
                                                        <CardContent>
                                                            <div className="overflow-x-auto rounded-md border">
                                                                <table className="w-full text-sm min-w-[600px]">
                                                                    <thead><tr className="bg-muted/50 border-b"><th className="h-10 px-4 text-left font-medium text-muted-foreground border-r w-[180px]">Параметр</th>{statKeys.map(key => (<th key={key} className="h-10 px-2 text-center text-muted-foreground">{statLabels[key]}</th>))}</tr></thead>
                                                                    <tbody>
                                                                        <tr className="border-b">
                                                                            <td className="p-2 border-r">
                                                                                <div className="text-xs font-medium text-muted-foreground p-2">Раса</div>
                                                                            </td>
                                                                            {statKeys.map(key => (<td key={key} className="p-2"><Input type="number" {...register(`stats.${key}.race`)} className="h-8 w-full text-center no-spinner border-transparent bg-transparent shadow-none" /></td>))}
                                                                        </tr>
                                                                        <tr className="border-b"><td className="p-2 border-r font-medium text-xs text-muted-foreground">Бонус (5)</td>{statKeys.map(key => (<td key={key} className="p-2 text-center"><Input type="number" {...register(`stats.${key}.bonus`)} className="h-8 w-full text-center no-spinner border-transparent bg-transparent shadow-none" /></td>))}</tr>
                                                                        <tr className="border-b"><td className="p-2 border-r font-semibold text-[10px] text-muted-foreground uppercase">База Сумма</td>{statKeys.map(key => (<td key={key} className="p-2 text-center"><Input disabled value={calculatedStats[key]?.baseSum || 0} className="h-8 w-full text-center border-transparent bg-transparent shadow-none disabled:opacity-100 font-semibold" /></td>))}</tr>
                                                                        <tr className="bg-primary/5 dark:bg-primary/10 border-b"><td className="p-2 border-r font-semibold text-[10px] text-primary uppercase">База / 3</td>{statKeys.map(key => (<td key={key} className="p-2 text-center"><Input disabled value={calculatedStats[key]?.dividedBy3 || 0} className="h-8 w-full text-center border-transparent bg-transparent shadow-none disabled:opacity-100 font-semibold" /></td>))}</tr>
                                                                        <tr className="border-b">
                                                                            <td className="p-2 border-r">
                                                                                <div className="text-xs font-medium text-muted-foreground p-2">Стиль</div>
                                                                            </td>
                                                                            {statKeys.map(key => (<td key={key} className="p-2"><Input type="number" {...register(`stats.${key}.style`)} className="h-8 w-full text-center no-spinner border-transparent bg-transparent shadow-none" /></td>))}
                                                                        </tr>
                                                                        <tr className="border-b">
                                                                            <td className="p-2 border-r">
                                                                                <div className="text-xs font-medium text-muted-foreground p-2">Стихия</div>
                                                                            </td>
                                                                            {statKeys.map(key => (<td key={key} className="p-2"><Input type="number" {...register(`stats.${key}.element`)} className="h-8 w-full text-center no-spinner border-transparent bg-transparent shadow-none" /></td>))}
                                                                        </tr>
                                                                        <tr className="bg-primary/5 dark:bg-primary/10 border-b">
                                                                            <td className="p-3 border-r font-bold text-primary">ИТОГО</td>
                                                                            {statKeys.map(key => (<td key={key} className="p-3 text-center font-bold text-xl text-primary">{calculatedStats[key]?.finalStat}</td>))}
                                                                        </tr>
                                                                        <tr className="border-b"><td className="p-2 border-r font-medium text-xs text-muted-foreground">Коррект.</td>{statKeys.map(key => (<td key={key} className="p-2"><Input type="number" {...register(`stats.${key}.other`)} className="h-8 w-full text-center no-spinner border-transparent bg-transparent shadow-none" /></td>))}</tr>
                                                                        <tr>
                                                                            <td className="p-2 border-r">Дайсы</td>
                                                                            {statKeys.map(key => (<td key={key} className="p-2"><Button variant="ghost" className="w-full h-8 px-0" onClick={() => rollDice(`${calculatedStats[key]?.finalStat}d`, statLabels[key])}>{calculatedStats[key]?.finalStat}d</Button></td>))}
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === "inventory" && (
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Экипировка и Инвентарь</CardTitle></CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="space-y-3">
                                                        <h4 className="font-semibold text-xs uppercase text-muted-foreground">Снаряжение</h4>
                                                        {(Object.keys(equipmentSlotLabels) as Array<keyof typeof equipmentSlotLabels>).map((slot) => (
                                                            <div key={String(slot)} className="flex gap-2 items-end">
                                                                <div className="flex-grow space-y-1"><Label className="text-[10px] uppercase">{equipmentSlotLabels[slot]}</Label><Input {...register(`equipment.${slot}.name`)} className="h-8" /></div>
                                                                <div className="w-16"><Label className="text-[10px] uppercase">Урон</Label><Input {...register(`equipment.${slot}.damage`)} className="h-8" /></div>
                                                                <Button size="icon" variant="ghost" className="h-8 w-8 mb-0" onClick={() => rollDice(values.equipment[slot].damage, values.equipment[slot].name)}><Dice5 className="w-4 h-4" /></Button>
                                                                {values.equipment[slot] && values.equipment[slot].name && (
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-8 w-8 mb-0 text-muted-foreground hover:text-orange-500"
                                                                        onClick={() => {
                                                                            unequipItem(form, slot as EquipmentSlotKey);
                                                                            toast.info(`Снято: ${values.equipment[slot].name}`);
                                                                        }}
                                                                    >
                                                                        <ArrowDown className="w-4 h-4" />
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="pt-4 border-t space-y-4">
                                                        <InventoryManager form={form} isMobile />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Мобильная навигация */}
                            <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 lg:hidden px-4 py-2 safe-area-pb">
                                <div className="flex justify-around items-center max-w-md mx-auto">
                                    {[
                                        { id: "general", label: "Инфо", icon: User },
                                        { id: "combat", label: "Бой", icon: Sword },
                                        { id: "skills", label: "Навыки", icon: BookOpen },
                                        { id: "stats", label: "Хар-ки", icon: FileText },
                                        { id: "inventory", label: "Вещи", icon: Backpack },
                                    ].map((tab) => (
                                        <button
                                            key={tab.id}
                                            onClick={() => handleTabChange(tab.id as TabType)}
                                            className={cn(
                                                "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px] group",
                                                activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {activeTab === tab.id && (
                                                <motion.div
                                                    layoutId="activeTabPill"
                                                    className="absolute inset-0 bg-primary/10 rounded-xl"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <tab.icon className={cn("w-5 h-5 relative z-10", activeTab === tab.id && "animate-in zoom-in-75 duration-200")} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight relative z-10">{tab.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </nav>
                        </>
                        )}

                    </div>
                )
                }
            </AnimatePresence >

            <DiceModal
                isOpen={diceState.open}
                onClose={() => setDiceState(prev => ({ ...prev, open: false }))}
                notation={diceState.notation}
                title={diceState.title}
            />

            <PremadeCharacterModal
                isOpen={isPremadeModalOpen}
                onClose={() => setIsPremadeModalOpen(false)}
                form={form}
            />
            <ResetModal
                isOpen={isResetModalOpen}
                onClose={() => setIsResetModalOpen(false)}
                onConfirm={() => {
                    reset(defaultCharacter);
                    localStorage.removeItem("pd-character-data");
                }}
                onExport={handleExport}
            />
            <CreditsModal
                isOpen={isCreditsModalOpen}
                onClose={() => setIsCreditsModalOpen(false)}
            />
            <ChangelogModal
                isOpen={isChangelogOpen}
                entry={getCurrentChangelog()}
                onClose={() => {
                    const currentLog = getCurrentChangelog();
                    localStorage.setItem("pd_app_version", currentLog.version);
                    localStorage.setItem("pd_app_date", currentLog.date);
                    setIsChangelogOpen(false);
                }}
            />
        </div >
    );
}
