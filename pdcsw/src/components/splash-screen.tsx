"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function SplashScreen({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Минимальное время показа заставки, чтобы избежать мерцания (800мс)
        // Так как это React Component, он маунтится почти мгновенно после загрузки бандла.
        // Мы просто даем пользователю насладиться логотипом секунду.
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            {isLoading ? (
                <motion.div
                    key="splash"
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                    exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeInOut" } }}
                >
                    <div className="space-y-6 flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <motion.h1
                                className="text-3xl font-bold text-center tracking-[0.2em] uppercase"
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            >
                                Precious Days
                            </motion.h1>
                        </motion.div>

                        <div className="flex flex-col items-center gap-2">
                            <motion.div
                                className="h-1 w-32 bg-primary/20 rounded-full overflow-hidden"
                            >
                                <motion.div
                                    className="h-full bg-primary"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                            </motion.div>
                            <p className="text-[10px] text-muted-foreground font-mono tracking-widest opacity-70">
                                ЗАГРУЗКА
                            </p>
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="contents" // Используем contents, чтобы не ломать layout
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
    );
}
