"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MEMORIES_TABLES, MemoryTable } from "@/data/memories-tables";
import { ChevronLeft, Table as TableIcon } from "lucide-react";

interface MemoriesTablesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MemoriesTablesModal({ open, onOpenChange }: MemoriesTablesModalProps) {
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

    const selectedTable = MEMORIES_TABLES.find(t => t.id === selectedTableId);

    const handleBack = () => {
        setSelectedTableId(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden">
                <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {selectedTableId && (
                            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 -ml-2 mr-1">
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                        )}
                        <DialogTitle className="text-lg font-bold truncate">
                            {selectedTable ? selectedTable.title : "Справочные Таблицы"}
                        </DialogTitle>
                    </div>
                    {!selectedTable && <DialogDescription>Выберите таблицу для просмотра</DialogDescription>}
                </DialogHeader>

                <ScrollArea className="flex-1 p-6 min-h-0">
                    {selectedTable ? (
                        <div className="space-y-4 pb-10">
                            <div className="rounded-md border overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-muted/50 border-b">
                                            <th className="h-10 px-4 text-left font-medium text-muted-foreground w-20">d66</th>
                                            {selectedTable.columns.map((col, i) => (
                                                <th key={i} className="h-10 px-4 text-left font-medium text-muted-foreground border-l">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTable.rows.map((row, idx) => (
                                            <tr key={idx} className="border-b last:border-0 hover:bg-muted/30">
                                                <td className="p-3 font-mono text-muted-foreground font-medium align-top">
                                                    {row.roll}
                                                </td>
                                                {row.content.map((cell, cIdx) => (
                                                    <td key={cIdx} className="p-3 border-l align-top">
                                                        {cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {selectedTable.note && (
                                <p className="text-sm text-muted-foreground italic border-l-2 border-primary/30 pl-3">
                                    {selectedTable.note}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-10">
                            {MEMORIES_TABLES.map(table => (
                                <Button
                                    key={table.id}
                                    variant="outline"
                                    className="h-auto py-4 px-4 justify-start text-left flex flex-col items-start gap-1 hover:bg-primary/5 hover:border-primary/30 transition-all whitespace-normal"
                                    onClick={() => setSelectedTableId(table.id)}
                                >
                                    <div className="flex items-center gap-2 font-semibold w-full">
                                        <TableIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <span className="flex-1">{table.title.split('|')[0].trim()}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground pl-6">
                                        {table.rows.length} вариантов
                                    </span>
                                </Button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
