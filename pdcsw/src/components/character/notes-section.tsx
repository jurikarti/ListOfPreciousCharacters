
"use client";



import { useFieldArray, Control, UseFormRegister, Controller, useWatch } from "react-hook-form";
import { CharacterSheetData } from "@/lib/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus, StickyNote } from "lucide-react";
import TiptapEditor from "./tiptap-editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface NotesSectionProps {
    control: Control<CharacterSheetData>;
    register: UseFormRegister<CharacterSheetData>;
}

export function NotesSection({ control, register }: NotesSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "notes"
    });

    const watchedNotes = useWatch({
        control,
        name: "notes"
    });

    return (
        <Card className="mt-6 border-dashed border-2 bg-muted/5 w-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        Заметки (Notes)
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => append({ id: crypto.randomUUID(), title: "", content: "" })}
                        className="gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Добавить заметку
                    </Button>
                </div>
                <CardDescription>
                    Ваши личные записи, идеи и важная информация о персонаже.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground italic">
                        У вас пока нет заметок. Нажмите "Добавить заметку", чтобы создать первую запись.
                    </div>
                )}

                <Accordion type="multiple" className="w-full space-y-4">
                    {fields.map((field, index) => (
                        <AccordionItem key={field.id} value={field.id} className="border rounded-lg bg-card px-4">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <div className="flex items-center gap-3 w-full text-left">
                                    <div className="font-medium truncate flex-1">
                                        <span className="font-bold">
                                            {watchedNotes?.[index]?.title || `Заметка ${index + 1}`}
                                        </span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="pt-2 pb-4 space-y-4">
                                <div className="flex justify-end mb-2">
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => {
                                            // Prevent accordion toggle when clicking delete
                                            // e.stopPropagation() approach might be needed if button was in trigger, but here it's in content.
                                            remove(index);
                                        }}
                                        className="h-8 gap-1.5"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Удалить
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Заголовок</label>
                                    <Input
                                        {...register(`notes.${index}.title` as const)}
                                        placeholder="Название заметки..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Содержание</label>
                                    <Controller
                                        control={control}
                                        name={`notes.${index}.content` as const}
                                        render={({ field }) => (
                                            <TiptapEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        )}
                                    />
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </CardContent>
        </Card>
    );
}
