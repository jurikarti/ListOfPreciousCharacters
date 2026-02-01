"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { characterSchema, CharacterData, defaultCharacter } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DiceModal } from "./dice-modal";
import TiptapEditor from "./tiptap-editor";
import { ImageUpload } from "./image-upload";
import { Download, Upload, Dice5, Save } from "lucide-react";
import { toast } from "sonner";

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

    // 1. Загрузка из LocalStorage при монтировании
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("pd-character-data");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    reset(parsed);
                    toast.success("Данные успешно восстановлены");
                } catch (e) {
                    console.error("Ошибка загрузки автосохранения", e);
                }
            }
        }
    }, [reset]);

    // 2. Автосохранение при каждом изменении полей
    useEffect(() => {
        const subscription = watch((value) => {
            if (value) {
                localStorage.setItem("pd-character-data", JSON.stringify(value));
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    // 3. Экспорт персонажа в JSON файл
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

    // 4. Импорт персонажа из JSON файла
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);

                // Сбрасываем форму новыми данными
                reset(json);

                // Явно обновляем поля, которые могут не триггернуть UI
                if (json.notes) form.setValue("notes", json.notes);
                if (json.image) form.setValue("image", json.image);

                toast.success("Персонаж и медиа-данные загружены");
            } catch (err) {
                console.error("Import error:", err);
                toast.error("Ошибка при чтении файла");
            }
        };
        reader.readAsText(file);
        e.target.value = "";
    };

    const rollDice = (diceAmount: number, statName: string) => {
        const amount = diceAmount || 0;
        if (amount < 1) {
            toast.warning("Нет кубов для броска (значение 0)");
            return;
        }
        setDiceState({
            open: true,
            notation: `${amount}d6`,
            title: `Проверка: ${statName}`,
        });
    };

    return (
        <div className="container mx-auto p-2 md:p-6 space-y-6 max-w-6xl font-sans">
            {/* Верхняя панель управления */}
            <header className="flex justify-between items-center bg-card p-4 rounded-xl border shadow-sm sticky top-2 z-20 backdrop-blur-md bg-opacity-90">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold">P</div>
                    <h1 className="text-xl font-bold tracking-tight hidden sm:block">Precious Days</h1>
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

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                {/* Блок 1: Портрет, Основные данные и Внешность */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Портрет */}
                    <Card className="md:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Портрет</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Controller
                                name="image"
                                control={control}
                                render={({ field }) => (
                                    <ImageUpload value={field.value} onChange={field.onChange} />
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Данные персонажа */}
                    <Card className="md:col-span-6">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Основная информация</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <Label className="text-xs">Имя персонажа</Label>
                                <Input {...register("name")} className="h-9" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs">Имя игрока</Label>
                                <Input {...register("playerName")} className="h-9" />
                            </div>
                            <div className="sm:col-span-2 grid grid-cols-3 gap-2 pt-2">
                                <div className="space-y-1">
                                    <Label className="text-xs">GL (Уровень)</Label>
                                    <Input type="number" {...register("level")} className="h-9 text-center" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Опыт</Label>
                                    <Input type="number" {...register("exp")} className="h-9 text-center" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Наставник</Label>
                                    <Input {...register("mentor")} className="h-9" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Внешность */}
                    <Card className="md:col-span-3">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs uppercase text-muted-foreground font-bold">Внешность</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Возраст" {...register("age")} className="h-8 text-xs" />
                                <Input placeholder="Пол" {...register("gender")} className="h-8 text-xs" />
                            </div>
                            <Input placeholder="Рост" {...register("height")} className="h-8 text-xs" />
                            <Input placeholder="Цвет глаз" {...register("eyeColor")} className="h-8 text-xs" />
                            <Input placeholder="Волосы" {...register("hairColor")} className="h-8 text-xs" />
                        </CardContent>
                    </Card>
                </div>

                {/* Блок 2: Таблица Характеристик */}
                <Card className="overflow-hidden border-2 border-primary/10">
                    <CardHeader className="bg-muted/30 pb-3">
                        <CardTitle className="text-sm font-bold">Характеристики и Проверки</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-center text-sm border-collapse min-w-[600px]">
                                <thead>
                                <tr className="border-b bg-muted/20">
                                    <th className="text-left p-4 font-bold text-primary">Параметр</th>
                                    <th className="p-2 text-muted-foreground">BODY (Тс)</th>
                                    <th className="p-2 text-muted-foreground">INT (Инт)</th>
                                    <th className="p-2 text-muted-foreground">MYS (Мис)</th>
                                    <th className="p-2 text-muted-foreground">AGI (Лов)</th>
                                    <th className="p-2 text-muted-foreground">SNS (Чув)</th>
                                    <th className="p-2 text-muted-foreground">CHA (Хар)</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr className="hover:bg-muted/10 transition-colors">
                                    <td className="text-left font-semibold p-4 border-r">Значение</td>
                                    {(['body', 'intellect', 'mysticism', 'agility', 'senses', 'charisma'] as const).map((stat) => (
                                        <td key={stat} className="p-3">
                                            <Input
                                                type="number"
                                                className="w-16 mx-auto text-center h-10 text-lg font-bold"
                                                {...register(`stats.${stat}.base`)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                                <tr className="bg-primary/5">
                                    <td className="text-left font-bold p-4 border-r text-primary">Бросок (D6)</td>
                                    {(['body', 'intellect', 'mysticism', 'agility', 'senses', 'charisma'] as const).map((stat) => {
                                        const statVal = values.stats?.[stat]?.base || 0;
                                        return (
                                            <td key={stat} className="p-3">
                                                <Button
                                                    type="button"
                                                    variant="default"
                                                    size="sm"
                                                    className="w-full h-10 shadow-sm hover:scale-105 transition-transform"
                                                    onClick={() => rollDice(statVal, stat.toUpperCase())}
                                                >
                                                    <Dice5 className="w-4 h-4 mr-2" />
                                                    {statVal}D
                                                </Button>
                                            </td>
                                        );
                                    })}
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Блок 3: Состояние и Заметки */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Жизненные показатели */}
                    <Card className="md:col-span-4 h-fit border-t-4 border-t-primary">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold">Состояние</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {(['hp', 'mp', 'wp'] as const).map((stat) => (
                                <div key={stat} className="space-y-1">
                                    <div className="flex justify-between text-xs font-black uppercase mb-1">
                                        <span>{stat}</span>
                                        <span className="text-muted-foreground">Текущее / Максимум</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input className="text-center font-bold text-lg h-11" placeholder="Cur" type="number" {...register(`${stat}.current` as any)} />
                                        <span className="text-xl font-light text-muted-foreground">/</span>
                                        <Input className="text-center bg-muted/30 h-11" placeholder="Max" type="number" {...register(`${stat}.max` as any)} />
                                    </div>
                                </div>
                            ))}

                            <div className="pt-4 border-t space-y-3">
                                <div className="flex justify-between items-center bg-muted/20 p-2 rounded-md">
                                    <Label className="text-xs font-bold uppercase">Маг. Сила</Label>
                                    <Input className="w-16 h-8 text-center font-bold" type="number" {...register("combat.magicPower")} />
                                </div>
                                <div className="flex justify-between items-center bg-muted/20 p-2 rounded-md">
                                    <Label className="text-xs font-bold uppercase">Уклонение</Label>
                                    <Input className="w-16 h-8 text-center font-bold" type="number" {...register("combat.evasion")} />
                                </div>
                                <div className="flex justify-between items-center bg-muted/20 p-2 rounded-md">
                                    <Label className="text-xs font-bold uppercase">Защита</Label>
                                    <Input className="w-16 h-8 text-center font-bold" type="number" {...register("combat.defense")} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Текстовый редактор для заметок */}
                    <Card className="md:col-span-8 flex flex-col min-h-[500px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold uppercase">Заметки, Способности и Снаряжение</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow flex flex-col">
                            <Controller
                                name="notes"
                                control={control}
                                render={({ field }) => (
                                    <TiptapEditor value={field.value} onChange={field.onChange} />
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>
            </form>

            {/* Всплывающее окно броска кубиков */}
            <DiceModal
                isOpen={diceState.open}
                onClose={() => setDiceState(prev => ({ ...prev, open: false }))}
                notation={diceState.notation}
                title={diceState.title}
            />

            <footer className="text-center text-[10px] text-muted-foreground pt-8 pb-4">
                Precious Days Character Sheet Web v1.0 • JSON-based • Next.js + Shadcn
            </footer>
        </div>
    );
}