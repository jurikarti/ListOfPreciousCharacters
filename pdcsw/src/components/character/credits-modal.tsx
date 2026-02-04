"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Send, Heart, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

import { useState, useEffect } from "react";

interface CreditsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
    const [isActivated, setIsActivated] = useState(false);
    const [pulse, setPulse] = useState(0);

    // Reset pulse intensity after a short delay
    useEffect(() => {
        if (pulse > 0) {
            const timer = setTimeout(() => setPulse(0), 400);
            return () => clearTimeout(timer);
        }
    }, [pulse]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] border-2 shadow-2xl overflow-hidden p-0">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
                            className="p-6"
                        >
                            <DialogHeader className="items-center text-center space-y-4">
                                <motion.div
                                    className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center cursor-pointer relative"
                                    onClick={() => {
                                        setIsActivated(true);
                                        setPulse(prev => prev + 1);
                                    }}
                                    animate={{
                                        scale: pulse > 0 ? [1, 1.2, 1] : 1,
                                        boxShadow: isActivated
                                            ? `0 0 ${20 + Math.min(pulse * 10, 40)}px rgba(239, 68, 68, ${0.4 + Math.min(pulse * 0.1, 0.4)})`
                                            : "0 0 0px rgba(0,0,0,0)",
                                        backgroundColor: isActivated ? "rgba(239, 68, 68, 0.15)" : "rgba(var(--primary), 0.1)"
                                    }}
                                    transition={{
                                        boxShadow: { duration: 0.3 },
                                        scale: { duration: 0.2 }
                                    }}
                                >
                                    <Heart
                                        className={cn(
                                            "w-8 h-8 transition-all duration-300",
                                            isActivated ? "text-red-500 fill-red-500 scale-110" : "text-primary fill-primary/20"
                                        )}
                                    />
                                </motion.div>
                                <DialogTitle className="text-2xl font-black tracking-tight">ку</DialogTitle>
                                <DialogDescription className="text-base text-balance leading-relaxed text-center">
                                    Спасибо, что пользуетесь приложением LoPC!<br />
                                    Если есть баги или предложения, то пишите в телегу.<br />
                                    На гите лежит открытый исходный код.<br />
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-8 space-y-4">
                                <Button
                                    variant="default"
                                    className="w-full h-14 text-lg font-bold gap-3 rounded-2xl shadow-[0_4px_20px_rgba(var(--primary),0.3)] hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white border-0"
                                    onClick={() => window.open("https://t.me/lopcweb", "_blank")}
                                >
                                    <Send className="w-6 h-6" />
                                    Канал
                                </Button>
                                <p className="text-xs text-center text-muted-foreground uppercase font-bold tracking-widest">Новости проекта</p>
                                <Button
                                    variant="default"
                                    className="w-full h-14 text-lg font-bold gap-3 rounded-2xl shadow-[0_4px_20px_rgba(var(--primary),0.3)] hover:shadow-primary/40 transition-all hover:-translate-y-1 active:scale-95 bg-[#0088cc] hover:bg-[#0088cc]/90 text-white border-0"
                                    onClick={() => window.open("https://t.me/jurikarti", "_blank")}
                                >
                                    <Send className="w-6 h-6" />
                                    тгшка
                                </Button>
                                <p className="text-xs text-center text-muted-foreground uppercase font-bold tracking-widest">Связаться со мной</p>

                                <Button
                                    variant="default"
                                    className="w-full h-14 text-lg font-bold gap-3 rounded-2xl shadow-[0_4px_20px_rgba(36,41,46,0.3)] hover:shadow-black/40 transition-all hover:-translate-y-1 active:scale-95 bg-[#24292e] hover:bg-[#24292e]/90 text-white border-0"
                                    onClick={() => window.open("https://github.com/jurikarti/ListOfPreciousCharacters", "_blank")}
                                >
                                    <Github className="w-6 h-6" />
                                    GitHub
                                </Button>
                                <p className="text-xs text-center text-muted-foreground uppercase font-bold tracking-widest">Исходный код</p>
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Button variant="ghost" onClick={onClose} className="rounded-full px-8">
                                    Закрыть
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
