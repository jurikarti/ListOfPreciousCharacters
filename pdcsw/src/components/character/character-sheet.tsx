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
import { Download, Upload, Dice5 } from "lucide-react";
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

    // 1. Загрузка из LocalStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("pd-character-data");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    reset(parsed);
                    toast.success("Данные восстановлены");
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }, [reset]);

    // 2. Автосохранение
    useEffect(() => {
        const subscription = watch((value) => {
            if(value) {
                localStorage.setItem("pd-character-data", JSON.stringify(value));
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    // 3. Экспорт
    const handleExport = () => {
        const data = getValues();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${data.name || "character"}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Персонаж экспортирован");
    };

    // 4. Импорт
    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                const result = characterSchema.safeParse(json);
                if (result.success) {
                    reset(result.data);
                    toast.success("Персонаж загружен успешно");
                } else {
                    console.error(result.error);
                    toast.error("Ошибка структуры файла");
                }
            } catch (err) {
                toast.error("Не удалось прочитать файл");
            }
        };
        reader.readAsText(file);
        // Сброс инпута, чтобы можно было загрузить тот же файл снова
        e.target.value = "";
    };

    const rollDice = (diceAmount: number, statName: string) => {
        if (diceAmount < 1) {
            toast.warning("Нет кубов для броска!");
            return;
        }
        setDiceState({
            open: true,
            notation: `${diceAmount}d6`,
            title: `Проверка: ${statName}`,
        });
    };

    return (
        <div className="container mx-auto p-2 md:p-6 space-y-6 max-w-5xl font-sans">
            {/* Меню действий */}
            <div className="flex justify-between items-center bg-card p-4 rounded-lg border shadow-sm sticky top-2 z-20 backdrop-blur-sm bg-opacity-95">
                <h1 className="text-xl font-bold tracking-tight hidden sm:block">Precious Days</h1>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                        <Upload className="mr-2 h-4 w-4" /> Импорт
                    </Button>
                    <input id="import-file" type="file" accept=".json" className="hidden" onChange={handleImport} />

                    <Button variant="default" size="sm" onClick={handleExport}>
                        <Download className="mr-2 h-4 w-4" /> Экспорт
                    </Button>
                </div>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                {/* Блок 1: Инфо */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Card className="md:col-span-8">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Основное</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div><Label>Имя персонажа</Label><Input {...register("name")} /></div>
                            <div><Label>Имя игрока</Label><Input {...register("playerName")} /></div>
                            <div><Label>Наставник/Мастер</Label><Input {...register("mentor")} /></div>
                            <div className="grid grid-cols-2 gap-2">
                                <div><Label>GL (Ур.)</Label><Input type="number" {...register("level")} /></div>
                                <div><Label>Опыт</Label><Input type="number" {...register("exp")} /></div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-4">
                        <CardHeader className="pb-2"><CardTitle className="text-sm uppercase text-muted-foreground">Внешность</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <Input placeholder="Возраст" {...register("age")} />
                                <Input placeholder="Пол" {...register("gender")} />
                            </div>
                            <Input placeholder="Рост" {...register("height")} />
                            <Input placeholder="Цвет глаз" {...register("eyeColor")} />
                        </CardContent>
                    </Card>
                </div>

                {/* Блок 2: Характеристики */}
                <Card>
                    <CardHeader className="pb-2"><CardTitle>Характеристики</CardTitle></CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-center text-sm border-collapse">
                                <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 min-w-[100px]">Параметр</th>
                                    {(['body', 'intellect', 'mysticism', 'agility', 'senses', 'charisma'] as const).map(stat => (
                                        <th key={stat} className="p-2 capitalize text-muted-foreground">{stat}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {/* Поля ввода */}
                                <tr>
                                    <td className="text-left font-semibold p-2">Значение</td>
                                    {(['body', 'intellect', 'mysticism', 'agility', 'senses', 'charisma'] as const).map((stat) => (
                                        <td key={stat} className="p-2">
                                            <Input
                                                type="number"
                                                className="w-14 mx-auto text-center h-8"
                                                {...register(`stats.${stat}.base`)}
                                            />
                                        </td>
                                    ))}
                                </tr>
                                {/* Кнопки дайсов */}
                                <tr className="bg-muted/30">
                                    <td className="text-left font-semibold p-2 text-xs">Проверка</td>
                                    {(['body', 'intellect', 'mysticism', 'agility', 'senses', 'charisma'] as const).map((stat) => {
                                        const statVal = values.stats?.[stat]?.base || 0;
                                        return (
                                            <td key={stat} className="p-2">
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    size="sm"
                                                    className="w-full h-8 text-xs"
                                                    onClick={() => rollDice(statVal, stat)}
                                                >
                                                    <Dice5 className="w-3 h-3 mr-1" />
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

                {/* Блок 3: Состояние и Текст */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <Card className="md:col-span-4 h-fit">
                        <CardHeader className="pb-2"><CardTitle>Параметры</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            {['hp', 'mp', 'wp'].map((stat) => (
                                <div key={stat} className="flex items-center gap-2">
                                    <span className="uppercase font-black w-10 text-lg text-primary">{stat}</span>
                                    <Input className="text-center" placeholder="Cur" type="number" {...register(stat as any).current} />
                                    <span className="text-muted-foreground">/</span>
                                    <Input className="text-center bg-muted/20" placeholder="Max" type="number" {...register(stat as any).max} />
                                </div>
                            ))}
                            <div className="pt-4 border-t space-y-2">
                                <div className="flex justify-between items-center">
                                    <Label>Маг. Сила</Label>
                                    <Input className="w-20 text-center" type="number" {...register("combat.magicPower")} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Label>Уклонение</Label>
                                    <Input className="w-20 text-center" type="number" {...register("combat.evasion")} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <Label>Защита</Label>
                                    <Input className="w-20 text-center" type="number" {...register("combat.defense")} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="md:col-span-8 h-full min-h-[400px]">
                        <CardHeader className="pb-2"><CardTitle>Заметки / Способности</CardTitle></CardHeader>
                        <CardContent>
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

            <DiceModal
                isOpen={diceState.open}
                onClose={() => setDiceState(prev => ({ ...prev, open: false }))}
                notation={diceState.notation}
                title={diceState.title}
            />
        </div>
    );
}