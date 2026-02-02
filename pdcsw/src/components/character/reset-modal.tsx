"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Trash2, ArrowRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";

interface ResetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onExport: () => void;
}

export function ResetModal({ isOpen, onClose, onConfirm, onExport }: ResetModalProps) {
    const [sliderComplete, setSliderComplete] = useState(false);
    const x = useMotionValue(0);
    const sliderWidth = 240; // Track width minus handle width (approx)
    const opacity = useTransform(x, [0, sliderWidth - 40], [1, 0]);
    const background = useTransform(x, [0, sliderWidth], ["rgba(239, 68, 68, 0.1)", "rgba(239, 68, 68, 1)"]);

    useEffect(() => {
        if (!isOpen) {
            setSliderComplete(false);
            x.set(0);
        }
    }, [isOpen, x]);

    const handleDragEnd = () => {
        if (x.get() > sliderWidth - 20) {
            setSliderComplete(true);
            onConfirm();
            toast.error("Лист персонажа очищен");
            onClose();
        } else {
            x.set(0);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md text-center p-6">
                <DialogHeader>
                    <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                        <Trash2 className="w-6 h-6 text-destructive" />
                    </div>
                    <DialogTitle className="text-xl text-center">Вы уверены?</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Это действие нельзя отменить. Все данные персонажа будут удалены.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 space-y-8">
                    {/* iOS Style Slider */}
                    <div className="relative mx-auto w-72 h-14 bg-muted rounded-full p-1 border overflow-hidden">
                        <motion.div
                            style={{ background }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <motion.span
                                style={{ opacity }}
                                className="text-xs font-bold uppercase tracking-widest text-muted-foreground select-none"
                            >
                                Свайп для очистки
                            </motion.span>
                        </motion.div>

                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: sliderWidth }}
                            dragElastic={0}
                            style={{ x }}
                            onDragEnd={handleDragEnd}
                            className="relative z-10 w-12 h-12 bg-background rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing border-2 border-destructive"
                        >
                            <ArrowRight className="w-5 h-5 text-destructive" />
                        </motion.div>
                    </div>

                    <div className="space-y-4">
                        <div className="text-sm text-balance text-muted-foreground">
                            Рекомендуем сохранить копию файла перед сбросом:
                        </div>
                        <Button
                            variant="outline"
                            className="w-full gap-2 py-6 border-dashed border-primary/40 hover:border-primary/80 transition-all hover:bg-primary/5"
                            onClick={onExport}
                        >
                            <Download className="w-4 h-4" />
                            Экспортировать JSON
                        </Button>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>
                        Отмена
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
