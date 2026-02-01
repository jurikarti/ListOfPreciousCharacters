"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface DiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    notation: string;
    title?: string;
}

export function DiceModal({ isOpen, onClose, notation, title }: DiceModalProps) {
    const [result, setResult] = useState<DiceRoll | null>(null);

    useEffect(() => {
        if (isOpen && notation) {
            try {
                const roll = new DiceRoll(notation);
                setResult(roll);
            } catch (e) {
                console.error("Invalid dice notation", e);
            }
        } else {
            setResult(null); // Сброс при закрытии
        }
    }, [isOpen, notation]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle>{title || "Результат броска"}</DialogTitle>
                </DialogHeader>

                <div className="py-8 flex flex-col items-center justify-center space-y-4">
                    <div className="text-sm text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
                        {notation}
                    </div>

                    <AnimatePresence mode="wait">
                        {result && (
                            <motion.div
                                key={result.total + Math.random()} // Force re-render animation
                                initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="text-7xl font-bold text-primary"
                            >
                                {result.total}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="text-sm text-muted-foreground mt-4">
                        Подробно: {result?.output}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}