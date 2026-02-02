"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { characterSchema, defaultCharacter, type CharacterData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiceModal } from "./dice-modal";
import TiptapEditor from "./tiptap-editor";
import { ImageUpload } from "./image-upload";
import { Download, Upload, Dice5, Save, PlusCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const statKeys = ['body', 'intellect', 'mysticism', 'agility', 'passion', 'charisma'] as const;

const statLabels: Record<typeof statKeys[number], string> = {
    body: "Телосложение",
    intellect: "Интеллект",
    mysticism: "Мистицизм",
    agility: "Ловкость",
    passion: "Страсть / пыл",
    charisma: "Харизма"
};

const combatStatLabels: Record<keyof Omit<CharacterData['combat'], 'baseDamage'>, string> = {
    magicPower: "Магическая сила",
    evasion: "Уклонение",
    defense: "Защита",
    enemyRecognition: "Распознавание врага",
    evaluation: "Оценка",
};

const equipmentSlotLabels: Record<keyof CharacterData['equipment'], string> = {
    rightHand: "Правая рука",
    leftHand: "Левая рука",
    head: "Голова",
    body: "Тело",
    extraDefense: "Доп. защита",
    magic: "Магия",
};

export default function CharacterSheet() {
    const [diceState, setDiceState] = useState<{ open: boolean; notation: string; title: string }>({
        open: false,
        notation: "2d6",
        title: "",
    });

    const form = useForm<CharacterData>({
        resolver: zodResolver(characterSchema),
        defaultValues: defaultCharacter,
        mode: "onChange",
    });

    const { register, control, watch, reset, getValues } = form;
    const values = watch();

    const { fields: skills, append: appendSkill, remove: removeSkill } = useFieldArray({ control, name: "skills" });
    const { fields: enchantments, append: appendEnchantment, remove: removeEnchantment } = useFieldArray({ control, name: "enchantments" });
    const { fields: inventory } = useFieldArray({ control, name: "inventory" });

    // Безопасный подсчет веса
    const inventoryWeight = (values.inventory || []).reduce((acc, item) => acc + (Number(item.weight) || 0), 0);
    const equipmentWeight = Object.values(values.equipment || {}).reduce((acc, item) => acc + (Number(item.weight) || 0), 0);
    const currentWeight = inventoryWeight + equipmentWeight;

    // Загрузка, сохранение, импорт/экспорт...
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("pd-character-data");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    reset(parsed);
                    toast.success("Данные успешно восстановлены");
                } catch (e) { console.error("Ошибка загрузки автосохранения", e); }
            }
        }
    }, [reset]);

    useEffect(() => {
        const subscription = watch((value) => {
            if (value) {
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
                reset(json);
                toast.success("Персонаж и медиа-данные загружены");
            } catch (err) {
                console.error("Import error:", err);
                toast.error("Ошибка при чтении файла");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const rollDice = (notation: string, title: string) => {
        if (!notation) {
            toast.warning("Не указана формула для броска");
            return;
        }
        const finalNotation = notation.replace(/d\+/gi, 'd6+').replace(/d$/i, 'd6');
        setDiceState({ open: true, notation: finalNotation, title: `Проверка: ${title}` });
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


    return (
        <div className="container mx-auto p-2 md:p-6 space-y-4 max-w-screen-2xl font-sans">
            {/* Верхняя панель */}
            <header className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm sticky top-2 z-20 backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-2">
                    <div className="w-26 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">by jurikarti</div>
                    <h1 className="text-xl font-bold tracking-tight hidden sm:block">Драгоценные Дни</h1>
                </div>
                <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 mx-4">
                    <Input placeholder="Имя персонажа" {...register("name")} />
                    <Input placeholder="Имя игрока" {...register("playerName")} />
                    <Input placeholder="Наставник / Мастер" {...register("mentor")} />
                </div>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Импорт
                    </Button>
                    <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImport} />

                    <Button variant="default" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Экспорт
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-12 gap-4">
                {/* Левая колонка */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Внешность</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="image" control={control} render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />} />
                            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                <Input placeholder="Возраст" {...register("age")} />
                                <Input placeholder="Пол" {...register("gender")} />
                                <Input placeholder="Рост" {...register("height")} />
                                <Input placeholder="Цвет волос" {...register("hairColor")} />
                                <Input placeholder="Цвет глаз" {...register("eyeColor")} />
                                <Input placeholder="Цвет кожи" {...register("skinColor")} />
                            </div>
                        </CardContent>
                    </Card>
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
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span>{pool}</span>
                                            <span>{values[pool]?.current} / {values[pool]?.max}</span>
                                        </div>
                                        <Progress
                                            value={(values[pool]?.current / (values[pool]?.max || 1)) * 100}
                                            className="h-3"
                                            indicatorClassName={colors[pool]}
                                        />
                                        <div className="flex gap-2">
                                            <Input type="number" placeholder="Тек." {...register(`${pool}.current`)} className="h-8" />
                                            <Input type="number" placeholder="Макс." {...register(`${pool}.max`)} className="h-8" />
                                        </div>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>

                {/* Центральная колонка */}
                <div className="col-span-12 lg:col-span-9 space-y-4">
                    <Card>
                        <CardContent className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Column 1: Vital Path */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Жизненный путь</h3>
                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <Label className="text-xs">Происхождение</Label>
                                        <Input {...register("origin")} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Секрет</Label>
                                        <Input {...register("secret")} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Будущее</Label>
                                        <Input {...register("future")} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs">Фокусирующий предмет</Label>
                                        <Input {...register("focusItem")} />
                                    </div>
                                </div>
                            </div>

                            {/* Column 2: Combat Parameters */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Боевые параметры</h3>
                                <div className="space-y-3">
                                    {(['magicPower', 'evasion', 'defense'] as const).map(key => {
                                        const combatStat = values.combat?.[key];
                                        const total = `${combatStat?.check || ''}${combatStat?.modifier || ''}`;
                                        return (
                                            <div key={key} className="space-y-1">
                                                <Label className="text-xs">{combatStatLabels[key]}</Label>
                                                <div className="flex items-center gap-2">
                                                    <div className="relative flex-grow">
                                                        <Input {...register(`combat.${key}.check`)} className="pr-8" placeholder="2d6" />
                                                    </div>
                                                    <span className="text-muted-foreground">+</span>
                                                    <Input {...register(`combat.${key}.modifier`)} className="w-16 text-center" placeholder="Mod" />
                                                    <div className="flex items-center bg-muted rounded-md px-3 h-9 min-w-[3rem] justify-center font-mono text-sm border">
                                                        {total || "—"}
                                                    </div>
                                                    <Button type="button" size="icon" variant="ghost" onClick={() => rollDice(total, combatStatLabels[key])}>
                                                        <Dice5 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Column 3: Stats & Special */}
                            <div className="space-y-6">
                                {/* GL & Exp - Stylized */}
                                <div className="flex gap-4">
                                    {/* GL - Hero Badge Style */}
                                    <div className="relative group w-24 h-24 shrink-0 flex items-center justify-center">
                                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:bg-primary/30 transition-all" />

                                        {/* Circular Progress SVG */}
                                        <div className="absolute inset-0 transform -rotate-90">
                                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                                {/* Background Circle */}
                                                <circle
                                                    className="text-muted stroke-current"
                                                    strokeWidth="8"
                                                    fill="transparent"
                                                    r="42"
                                                    cx="50"
                                                    cy="50"
                                                />
                                                {/* Progress Circle */}
                                                <circle
                                                    className="text-primary stroke-current transition-all duration-500 ease-out"
                                                    strokeWidth="8"
                                                    strokeLinecap="round"
                                                    fill="transparent"
                                                    r="42"
                                                    cx="50"
                                                    cy="50"
                                                    style={{
                                                        strokeDasharray: 263.89, // 2 * PI * 42
                                                        strokeDashoffset: 263.89 - ((values.level || 0) / 10) * 263.89
                                                    }}
                                                />
                                            </svg>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-center justify-center">
                                            <span className="text-[0.6rem] font-black uppercase tracking-widest text-muted-foreground absolute -top-3">GL</span>
                                            <Input
                                                type="number"
                                                {...register("level", {
                                                    valueAsNumber: true,
                                                    onChange: (e) => {
                                                        const val = parseInt(e.target.value);
                                                        if (val > 10) e.target.value = "10";
                                                        if (val < 1) e.target.value = "1";
                                                    }
                                                })}
                                                min={1}
                                                max={10}
                                                className="w-16 h-10 text-4xl text-center font-black bg-transparent border-none shadow-none focus-visible:ring-0 p-0"
                                            />
                                        </div>
                                    </div>

                                    {/* Exp - Solid Display */}
                                    <div className="flex-grow flex flex-col justify-center gap-1.5">
                                        <div className="flex justify-between items-baseline px-1">
                                            <Label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Опыт (XP)</Label>
                                            <span className="text-[10px] text-muted-foreground">Total</span>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                {...register("exp")}
                                                className="h-10 text-right font-mono text-lg bg-muted/40 border-muted-foreground/20 focus-visible:border-primary/50"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                            </div>
                                        </div>
                                        <div className="h-1 w-full bg-primary/10 rounded-full overflow-hidden">
                                            <div className="h-full bg-primary/50 w-full animate-pulse" style={{ width: '100%' }} />
                                            {/* decorative bar since we don't have max xp */}
                                        </div>
                                    </div>
                                </div>

                                {/* Special Checks */}
                                <div>
                                    <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">Особые проверки</h3>
                                    <div className="space-y-3">
                                        {(['enemyRecognition', 'evaluation'] as const).map(key => {
                                            const combatStat = values.combat?.[key];
                                            const total = `${combatStat?.check || ''}${combatStat?.modifier || ''}`;
                                            return (
                                                <div key={key} className="space-y-1">
                                                    <Label className="text-xs">{combatStatLabels[key]}</Label>
                                                    <div className="flex items-center gap-2">
                                                        <Input {...register(`combat.${key}.check`)} className="flex-grow" placeholder="2d6" />
                                                        <span className="text-muted-foreground small">+</span>
                                                        <Input {...register(`combat.${key}.modifier`)} className="w-14 text-center" placeholder="0" />
                                                        <Button type="button" size="icon" variant="secondary" className="h-9 w-9 shrink-0" onClick={() => rollDice(total, combatStatLabels[key])}>
                                                            <Dice5 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="text-sm">Характеристики</CardTitle></CardHeader>
                        <CardContent className="overflow-x-auto">
                            <table className="w-full text-xs border-collapse">
                                <thead>
                                    <tr className="bg-muted/50">
                                        <th className="p-2 text-left border">Параметр / Атрибут</th>
                                        {statKeys.map(key => <th key={key} className="p-2 border">{statLabels[key]}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="p-1 border"><Input {...register("raceName")} placeholder="Раса" className="h-8" /></td>
                                        {statKeys.map(key => <td key={key} className="p-1 border"><Input type="number" {...register(`stats.${key}.race`)} className="h-8 w-full text-center" /></td>)}
                                    </tr>
                                    <tr>
                                        <td className="p-1 border"><Label>Бонус (5 очков)</Label></td>
                                        {statKeys.map(key => <td key={key} className="p-1 border"><Input type="number" {...register(`stats.${key}.bonus`)} className="h-8 w-full text-center" /></td>)}
                                    </tr>
                                    <tr className="bg-muted/30">
                                        <td className="p-2 border font-bold">Сумма базовых значений</td>
                                        {statKeys.map(key => <td key={key} className="p-2 border text-center font-bold">{calculatedStats[key]?.baseSum}</td>)}
                                    </tr>
                                    <tr className="bg-muted/30">
                                        <td className="p-2 border font-bold">(Базовое значение ÷ 3)</td>
                                        {statKeys.map(key => <td key={key} className="p-2 border text-center font-bold">{calculatedStats[key]?.dividedBy3}</td>)}
                                    </tr>
                                    <tr>
                                        <td className="p-1 border"><Input {...register("styleName")} placeholder="Стиль" className="h-8" /></td>
                                        {statKeys.map(key => <td key={key} className="p-1 border"><Input type="number" {...register(`stats.${key}.style`)} className="h-8 w-full text-center" /></td>)}
                                    </tr>
                                    <tr>
                                        <td className="p-1 border"><Input {...register("elementName")} placeholder="Стихия" className="h-8" /></td>
                                        {statKeys.map(key => <td key={key} className="p-1 border"><Input type="number" {...register(`stats.${key}.element`)} className="h-8 w-full text-center" /></td>)}
                                    </tr>
                                    <tr className="bg-primary/10">
                                        <td className="p-2 border font-bold text-primary">Характеристики</td>
                                        {statKeys.map(key => <td key={key} className="p-2 border text-center font-bold text-lg text-primary">{calculatedStats[key]?.finalStat}</td>)}
                                    </tr>
                                    <tr>
                                        <td className="p-1 border"><Label>Другие корректировки</Label></td>
                                        {statKeys.map(key => <td key={key} className="p-1 border"><Input type="number" {...register(`stats.${key}.other`)} className="h-8 w-full text-center" /></td>)}
                                    </tr>
                                    <tr className="bg-primary/20">
                                        <td className="p-2 border font-bold">Количество костей (Дайсы)</td>
                                        {statKeys.map(key => (
                                            <td key={key} className="p-2 border text-center font-bold">
                                                <Button type="button" variant="ghost" className="w-full" onClick={() => rollDice(`${calculatedStats[key]?.finalStat}d`, statLabels[key])}>
                                                    {calculatedStats[key]?.finalStat} (2D)
                                                </Button>
                                            </td>
                                        ))}
                                    </tr>
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Нижняя панель - Экипировка и Инвентарь */}
            <Card>
                <CardHeader><CardTitle className="text-sm">Экипировка и Инвентарь</CardTitle></CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr>
                                    <th className="text-left">Слот/Предмет</th>
                                    <th className="w-16">Вес</th>
                                    <th className="w-16">Попад.</th>
                                    <th className="w-24">Урон</th>
                                    <th className="w-16">Дальн.</th>
                                    <th className="w-16">Уклон.</th>
                                    <th className="w-16">Защита</th>
                                    <th className="text-left">Примечание</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(Object.keys(equipmentSlotLabels) as Array<keyof typeof equipmentSlotLabels>).map((slot) => (
                                    <tr key={slot}>
                                        <td><Input {...register(`equipment.${slot}.name`)} placeholder={equipmentSlotLabels[slot]} className="h-8" /></td>
                                        <td><Input type="number" {...register(`equipment.${slot}.weight`)} className="h-8" /></td>
                                        <td><Input type="number" {...register(`equipment.${slot}.hit`)} className="h-8" /></td>
                                        <td className="flex items-center gap-1">
                                            <Input {...register(`equipment.${slot}.damage`)} className="h-8" />
                                            <Button type="button" size="icon" variant="ghost" className="h-8 w-8" onClick={() => rollDice(values.equipment[slot].damage, values.equipment[slot].name)}><Dice5 className="w-4 h-4" /></Button>
                                        </td>
                                        <td><Input type="number" {...register(`equipment.${slot}.range`)} className="h-8" /></td>
                                        <td><Input type="number" {...register(`equipment.${slot}.evasion`)} className="h-8" /></td>
                                        <td><Input type="number" {...register(`equipment.${slot}.defense`)} className="h-8" /></td>
                                        <td><Input {...register(`equipment.${slot}.notes`)} className="h-8" /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-2">
                            <Label>Снаряжение (в рюкзаке)</Label>
                            <div className="text-sm">Вес: {currentWeight.toFixed(1)} / {values.maxWeight}</div>
                        </div>
                        {inventory.map((item, index) => (
                            <div key={item.id} className="flex gap-2 items-center mb-1">
                                <Input {...register(`inventory.${index}.name`)} placeholder={`Предмет ${index + 1}`} className="h-8 flex-grow" />
                                <div className="flex items-center gap-1">
                                    <Label className="text-xs">Вес:</Label>
                                    <Input type="number" {...register(`inventory.${index}.weight`)} className="h-8 w-20" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <DiceModal isOpen={diceState.open} onClose={() => setDiceState(prev => ({ ...prev, open: false }))} notation={diceState.notation} title={diceState.title} />
        </div>
    );
}
