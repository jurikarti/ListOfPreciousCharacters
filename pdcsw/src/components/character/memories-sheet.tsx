"use client";

import { UseFormRegister, Control, useFieldArray, Controller } from "react-hook-form";
import { CharacterSheetData } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "./image-upload";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, ScrollText, TrendingUp, Trash2, PlusCircle } from "lucide-react";

interface MemoriesSheetProps {
    register: UseFormRegister<CharacterSheetData>;
    control: Control<CharacterSheetData>;
    values: CharacterSheetData;
    rollDice: (notation: string, title?: string) => void;
}

type MemoryTabType = "profile" | "memories" | "growth";

export function MemoriesSheet({ register, control, values, rollDice }: MemoriesSheetProps) {
    const [activeTab, setActiveTab] = useState<MemoryTabType>("profile");

    const { fields: memoryFields, append: appendMemory, remove: removeMemory } = useFieldArray({
        control,
        name: "memories",
    });

    const { fields: growthFields } = useFieldArray({
        control,
        name: "growthTable",
    });

    const tabs: MemoryTabType[] = ["profile", "memories", "growth"];
    const handleTabChange = (tab: MemoryTabType) => {
        if (window.navigator.vibrate) window.navigator.vibrate(10);
        setActiveTab(tab);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="relative pb-20 lg:pb-0">
            {/* Desktop View */}
            <div className="hidden lg:block space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Character Profile Brief */}
                    <Card className="w-full md:w-1/3 border-2">
                        <CardHeader className="bg-muted/30 border-b py-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Профиль</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <Controller
                                name="image"
                                control={control}
                                render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />}
                            />
                            <div className="grid grid-cols-2 gap-2 text-[10px] uppercase font-bold text-muted-foreground mt-2">
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Возраст</Label>
                                    <Input {...register("age")} className="h-7 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px]">Пол</Label>
                                    <Input {...register("gender")} className="h-7 text-xs" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Resources Section */}
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4 font-sans">
                        {(['hp', 'mp', 'wp'] as const).map((pool) => {
                            const colors: Record<string, string> = {
                                hp: "bg-red-500/80 dark:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                mp: "bg-blue-500/80 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                                wp: "bg-purple-500/80 dark:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
                            };
                            return (
                                <Card key={pool} className="overflow-hidden border-2 h-full">
                                    <CardHeader className="p-3 bg-muted/30 border-b">
                                        <CardTitle className="text-center text-lg font-black uppercase tracking-tighter">{pool}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-3">
                                        <div className="flex justify-between text-xs font-bold uppercase">
                                            <span>{pool}</span>
                                            <span>{values[pool]?.current} / {values[pool]?.max}</span>
                                        </div>
                                        <Progress
                                            value={(values[pool]?.current / (values[pool]?.max || 1)) * 100}
                                            className="h-3"
                                            indicatorClassName={colors[pool]}
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Тек.</Label>
                                                <Input type="number" {...register(`${pool}.current`)} className="h-8 text-center font-bold" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px] text-muted-foreground uppercase font-bold">Макс.</Label>
                                                <Input type="number" {...register(`${pool}.max`)} className="h-8 text-center font-bold" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Memories Table */}
                <Card className="border-2">
                    <CardHeader className="bg-muted/30 border-b py-3">
                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">Таблица Воспоминаний</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-xs min-w-[600px]">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="py-2 px-3 text-left font-bold uppercase w-24">Дата</th>
                                    <th className="py-2 px-3 text-left font-bold uppercase">Воспоминания</th>
                                    <th className="py-2 px-3 text-center font-bold uppercase w-24">Возвышение</th>
                                    <th className="py-2 px-3 text-left font-bold uppercase w-48">Награда</th>
                                    <th className="py-2 px-3 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-muted/50">
                                {memoryFields.map((field, index) => (
                                    <tr key={field.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-2">
                                            <Input {...register(`memories.${index}.date`)} className="h-8 border-transparent hover:border-input focus:border-input bg-transparent" placeholder="Дата" />
                                        </td>
                                        <td className="p-2">
                                            <Input {...register(`memories.${index}.content`)} className="h-8 border-transparent hover:border-input focus:border-input bg-transparent" placeholder="Что произошло..." />
                                        </td>
                                        <td className="p-2 text-center">
                                            <Controller
                                                name={`memories.${index}.ascension`}
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex justify-center">
                                                        <Checkbox
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                            className="h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                                        />
                                                    </div>
                                                )}
                                            />
                                        </td>
                                        <td className="p-2">
                                            <Input {...register(`memories.${index}.reward`)} className="h-8 border-transparent hover:border-input focus:border-input bg-transparent" placeholder="Бонус/Ранг" />
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                onClick={() => removeMemory(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </CardContent>
                    <div className="p-2 border-t bg-muted/10">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-full text-xs hover:bg-muted/50 border-dashed border-2 py-4"
                            onClick={() => appendMemory({ date: "", content: "", ascension: false, reward: "" })}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" /> Добавить воспоминание
                        </Button>
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Growth Table */}
                    <Card className="border-2 h-full">
                        <CardHeader className="bg-muted/30 border-b py-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Таблица роста</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-xs">
                                <thead className="bg-muted/50 border-b">
                                    <tr>
                                        <th className="py-2 px-3 text-left font-bold uppercase w-20">Опыт</th>
                                        <th className="py-2 px-3 text-left font-bold uppercase">Содержание роста</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-muted/50">
                                    {growthFields.map((field, index) => (
                                        <tr key={field.id}>
                                            <td className="p-2">
                                                <Input {...register(`growthTable.${index}.exp`)} className="h-8 border-transparent hover:border-input focus:border-input bg-transparent font-mono text-[11px]" />
                                            </td>
                                            <td className="p-2">
                                                <Input {...register(`growthTable.${index}.content`)} className="h-8 border-transparent hover:border-input focus:border-input bg-transparent" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* Experience Points Placeholder */}
                    <Card className="border-2 h-full">
                        <CardHeader className="bg-muted/30 border-b py-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider">Очки опыта</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="h-full min-h-[150px] flex items-start justify-center text-muted-foreground text-xs italic text-center p-4 border-2 border-dashed rounded-lg bg-muted/10">
                                <div className="space-y-4 w-full">
                                    <Label className="text-xs uppercase font-bold text-foreground">Накопленный опыт для Мастера</Label>
                                    <Input
                                        {...register("experiencePoints")}
                                        className="text-2xl font-black text-center h-16 bg-card"
                                        placeholder="0"
                                    />
                                    <p className="text-[10px]">Блок для отслеживания общего прогресса сессий</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            const swipeThreshold = 50;
                            if (info.offset.x < -swipeThreshold) {
                                const currentIndex = tabs.indexOf(activeTab);
                                if (currentIndex < tabs.length - 1) handleTabChange(tabs[currentIndex + 1]);
                            } else if (info.offset.x > swipeThreshold) {
                                const currentIndex = tabs.indexOf(activeTab);
                                if (currentIndex > 0) handleTabChange(tabs[currentIndex - 1]);
                            }
                        }}
                        className="space-y-4"
                    >
                        {activeTab === "profile" && (
                            <div className="space-y-4 pb-4">
                                <Card className="border-2">
                                    <CardHeader className="py-3 px-4 bg-muted/30 border-b">
                                        <CardTitle className="text-xs font-bold uppercase tracking-wider">Профиль Мастера</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 space-y-4">
                                        <Controller
                                            name="image"
                                            control={control}
                                            render={({ field }) => <ImageUpload value={field.value} onChange={field.onChange} />}
                                        />
                                        <div className="grid grid-cols-2 gap-3 uppercase font-bold text-muted-foreground">
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Возраст</Label>
                                                <Input {...register("age")} className="h-9" />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-[10px]">Пол</Label>
                                                <Input {...register("gender")} className="h-9" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="grid grid-cols-1 gap-4">
                                    {(['hp', 'mp', 'wp'] as const).map((pool) => {
                                        const colors: Record<string, string> = {
                                            hp: "bg-red-500/80 dark:bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                            mp: "bg-blue-500/80 dark:bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]",
                                            wp: "bg-purple-500/80 dark:bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]",
                                        };
                                        return (
                                            <Card key={pool} className="overflow-hidden border-2">
                                                <CardHeader className="p-3 bg-muted/30 border-b">
                                                    <CardTitle className="text-center text-lg font-black uppercase tracking-tighter">{pool}</CardTitle>
                                                </CardHeader>
                                                <CardContent className="p-4 space-y-3">
                                                    <div className="flex justify-between text-xs font-bold uppercase">
                                                        <span>{pool}</span>
                                                        <span>{values[pool]?.current} / {values[pool]?.max}</span>
                                                    </div>
                                                    <Progress
                                                        value={(values[pool]?.current / (values[pool]?.max || 1)) * 100}
                                                        className="h-3"
                                                        indicatorClassName={colors[pool]}
                                                    />
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1 text-center">
                                                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Тек.</Label>
                                                            <Input type="number" {...register(`${pool}.current`)} className="h-10 text-center font-bold text-lg" />
                                                        </div>
                                                        <div className="space-y-1 text-center">
                                                            <Label className="text-[10px] text-muted-foreground uppercase font-bold">Макс.</Label>
                                                            <Input type="number" {...register(`${pool}.max`)} className="h-10 text-center font-bold text-lg" />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === "memories" && (
                            <Card className="border-2">
                                <CardHeader className="bg-muted/30 border-b py-3">
                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">Воспоминания</CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="divide-y divide-muted/50">
                                        {memoryFields.map((field, index) => (
                                            <div key={field.id} className="p-4 space-y-3 relative group">
                                                <div className="flex justify-between items-start gap-2">
                                                    <Input {...register(`memories.${index}.date`)} className="h-8 w-24 text-xs font-bold" placeholder="Дата" />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                                                        onClick={() => removeMemory(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[10px] uppercase font-bold">Событие</Label>
                                                    <Input {...register(`memories.${index}.content`)} className="h-9 text-xs" placeholder="Что произошло..." />
                                                </div>
                                                <div className="flex items-center justify-between gap-4 pt-1">
                                                    <div className="flex-grow space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold">Награда</Label>
                                                        <Input {...register(`memories.${index}.reward`)} className="h-8 text-[11px]" placeholder="Бонус/Ранг" />
                                                    </div>
                                                    <div className="text-center space-y-1">
                                                        <Label className="text-[10px] uppercase font-bold">Возвыш.</Label>
                                                        <Controller
                                                            name={`memories.${index}.ascension`}
                                                            control={control}
                                                            render={({ field }) => (
                                                                <div className="flex justify-center">
                                                                    <Checkbox
                                                                        checked={field.value}
                                                                        onCheckedChange={field.onChange}
                                                                        className="h-6 w-6 border-2 border-primary"
                                                                    />
                                                                </div>
                                                            )}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {memoryFields.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground italic text-xs">Нет записей</div>
                                    )}
                                    <div className="p-4 border-t bg-muted/10">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="w-full text-xs border-dashed border-2 py-6 bg-background hover:bg-muted/50"
                                            onClick={() => appendMemory({ date: "", content: "", ascension: false, reward: "" })}
                                        >
                                            <PlusCircle className="h-4 w-4 mr-2" /> Добавить воспоминание
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {activeTab === "growth" && (
                            <div className="space-y-4 pb-4">
                                <Card className="border-2">
                                    <CardHeader className="bg-muted/30 border-b py-3">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">Очки опыта</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] uppercase font-bold text-muted-foreground block text-center">Накопленный опыт Мастера</Label>
                                            <Input
                                                {...register("experiencePoints")}
                                                className="text-4xl font-black text-center h-20 bg-muted/20"
                                                placeholder="0"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-2">
                                    <CardHeader className="bg-muted/30 border-b py-3">
                                        <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">Таблица роста</CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-0">
                                        <div className="divide-y divide-muted/50">
                                            {growthFields.map((field, index) => (
                                                <div key={field.id} className="p-4 flex gap-4 items-center">
                                                    <div className="w-16 shrink-0">
                                                        <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">XP</Label>
                                                        <Input {...register(`growthTable.${index}.exp`)} className="h-8 text-center px-1 font-mono text-[11px]" />
                                                    </div>
                                                    <div className="flex-grow">
                                                        <Label className="text-[9px] uppercase font-bold text-muted-foreground block mb-1">Результат</Label>
                                                        <Input {...register(`growthTable.${index}.content`)} className="h-8 text-xs" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Mobile Navigation for Memories Sheet */}
                <nav className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t z-50 lg:hidden px-4 py-2 safe-area-pb">
                    <div className="flex justify-around items-center max-w-md mx-auto">
                        {[
                            { id: "profile", label: "Профиль", icon: User },
                            { id: "memories", label: "События", icon: ScrollText },
                            { id: "growth", label: "Рост", icon: TrendingUp },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id as MemoryTabType)}
                                className={cn(
                                    "relative flex flex-col items-center gap-1 p-2 rounded-xl transition-all min-w-[64px] group",
                                    activeTab === tab.id ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTabPillMemories"
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
            </div>
        </div>
    );
}
