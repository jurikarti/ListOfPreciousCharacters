"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DiceRoll } from "@dice-roller/rpg-dice-roller";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// --- Defines 3D Dice Component ---

const Die3D = ({ value, index }: { value: number; index: number }) => {
    // Rotation mapping for each face to be visible
    // To show a face, we must rotate the CUBE in the OPPOSITE direction of the face's position.
    const getRotation = (val: number) => {
        switch (val) {
            case 1: return { x: 0, y: 0 };
            case 2: return { x: 90, y: 0 };   // Face is Bottom (-90X), so Rotate Cube +90X
            case 3: return { x: 0, y: 90 };   // Face is Left (-90Y), so Rotate Cube +90Y
            case 4: return { x: 0, y: -90 };  // Face is Right (90Y), so Rotate Cube -90Y
            case 5: return { x: -90, y: 0 };  // Face is Top (90X), so Rotate Cube -90X
            case 6: return { x: 180, y: 0 };
            default: return { x: 0, y: 0 };
        }
    };

    // Calculate target rotation plus random extra spins for "tumbling"
    const baseTarget = getRotation(value);

    // We want the dice to spin effectively. 
    // Add multiple full rotations (360 * n) to the target so it physically rotates to get there.
    // Randomize direction (+) or (-) for variety.
    const spins = 2 + Math.floor(Math.random() * 2); // 2 or 3 spins

    // We start from a random rotation (0-360) and rotate TO the target + spins.
    // This ensures traversing through the rotation space (showing other faces).
    const startX = Math.random() * 360;
    const startY = Math.random() * 360;

    const targetX = baseTarget.x + (360 * spins);
    const targetY = baseTarget.y + (360 * spins);

    return (
        <div className="scene w-16 h-16" style={{ perspective: "600px" }}>
            <motion.div
                className="cube w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                initial={{
                    rotateX: startX,
                    rotateY: startY,
                    rotateZ: Math.random() * 360,
                    scale: 0.5,
                    y: -50 // Start slightly 'up'
                }}
                animate={{
                    rotateX: targetX,
                    rotateY: targetY,
                    rotateZ: 0, // Settle Z
                    scale: 1,
                    y: 0
                }}
                transition={{
                    duration: 1.0,
                    ease: "circOut",
                    delay: index * 0.1,
                }}
            >
                {/* Faces */}
                <DieFace className="[transform:translateZ(32px)]" dots={[5]} /> {/* 1 (Front) */}
                <DieFace className="[transform:rotateY(180deg)_translateZ(32px)]" dots={[1, 3, 4, 6, 7, 9]} /> {/* 6 (Back) */}
                <DieFace className="[transform:rotateY(90deg)_translateZ(32px)]" dots={[1, 3, 7, 9]} /> {/* 4 (Right) */}
                <DieFace className="[transform:rotateY(-90deg)_translateZ(32px)]" dots={[1, 5, 9]} /> {/* 3 (Left) */}
                <DieFace className="[transform:rotateX(90deg)_translateZ(32px)]" dots={[1, 3, 5, 7, 9]} /> {/* 5 (Top) */}
                <DieFace className="[transform:rotateX(-90deg)_translateZ(32px)]" dots={[1, 9]} /> {/* 2 (Bottom) */}
            </motion.div>
        </div>
    );
};

// Helper for generic dot placement (3x3 grid)
const DieFace = ({ className, dots }: { className?: string, dots: number[] }) => (
    <div className={cn(
        "absolute w-full h-full bg-white border-2 border-black rounded-lg flex flex-wrap p-1 gap-1 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] [backface-visibility:hidden]",
        className
    )}>
        {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="w-[calc(33.33%-4px)] h-[calc(33.33%-4px)] flex items-center justify-center">
                {dots.includes(i + 1) && (
                    <div className="w-2.5 h-2.5 bg-black rounded-full" />
                )}
            </div>
        ))}
    </div>
);

// Helper to extract dice values recursively or from standard structures
const extractD6Values = (roll: DiceRoll): number[] => {
    let values: number[] = [];

    // Strategy 1: Object Traversal
    // Heuristic: Recursively find objects with numeric value between 1-6 that are leaves (no sub-rolls).
    const traverse = (obj: any) => {
        if (!obj) return;

        if (Array.isArray(obj)) {
            obj.forEach(traverse);
        } else if (typeof obj === 'object') {
            const hasSubRolls = obj.rolls && Array.isArray(obj.rolls) && obj.rolls.length > 0;

            // Check if this is a result leaf
            if (!hasSubRolls && typeof obj.value === 'number') {
                // If it's broadly a standard die range (d6)
                if (obj.value >= 1 && obj.value <= 6) {
                    // Exclude total-like objects if possible, but leaves usually aren't totals.
                    // Validation: typical RollResult has 'type'="result".
                    // If type is missing, strictly checking value range is a reasonable approximation for d6 context.
                    values.push(obj.value);
                }
            }
            // Continue recursion
            if (obj.rolls) traverse(obj.rolls);
        }
    };

    if (roll.rolls) traverse(roll.rolls);

    // Strategy 2: String Parsing Fallback
    // If traversal found nothing, try to parse the official output string (e.g. "2d6: [4, 6] = 10")
    if (values.length === 0 && roll.output) {
        try {
            // Regex to find content inside brackets: [1, 2, 3]
            const match = roll.output.match(/: \[(.*?)\]/);
            if (match && match[1]) {
                const parts = match[1].split(',').map(s => parseInt(s.trim()));
                // Filter valid d6
                const validParts = parts.filter(n => !isNaN(n) && n >= 1 && n <= 6);
                if (validParts.length > 0) {
                    values = validParts;
                }
            }
        } catch (e) {
            console.error("Dice regex fallback failed", e);
        }
    }

    return values;
};

interface DiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    notation: string;
    title?: string;
}

export function DiceModal({ isOpen, onClose, notation, title }: DiceModalProps) {
    const [result, setResult] = useState<DiceRoll | null>(null);
    const [diceValues, setDiceValues] = useState<number[]>([]);

    useEffect(() => {
        if (isOpen && notation) {
            try {
                const roll = new DiceRoll(notation);
                setResult(roll);

                // Use robust extraction
                const values = extractD6Values(roll);
                setDiceValues(values);

            } catch (e) {
                console.error("Invalid dice notation", e);
                setResult(null);
                setDiceValues([]);
            }
        } else {
            setResult(null);
            setDiceValues([]);
        }
    }, [isOpen, notation]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader>
                    <DialogTitle>{title || "Результат броска"}</DialogTitle>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center space-y-6 min-h-[180px]">

                    {/* Dice Visualization - Always takes precedence if valid dice found */}
                    <div className="flex flex-wrap gap-4 justify-center items-center perspective-[1000px] min-h-[4rem]">
                        <AnimatePresence mode="wait">
                            {result && diceValues.length > 0 ? (
                                diceValues.map((val, i) => (
                                    <Die3D key={`${result.total}-${i}-${isOpen}`} value={val} index={i} />
                                ))
                            ) : result ? (
                                // Fallback only if NO dice extraction worked
                                <motion.div
                                    key={result.total}
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="text-6xl font-black text-primary"
                                >
                                    {result.total}
                                </motion.div>
                            ) : null}
                        </AnimatePresence>
                    </div>

                    {/* Total and Details */}
                    <div className="flex flex-col items-center gap-1 w-full bg-muted/20 p-4 rounded-xl">
                        <div className="text-3xl font-bold flex items-center gap-2">
                            <span className="text-muted-foreground text-lg uppercase font-bold tracking-wider">Итого:</span>
                            {result?.total}
                        </div>

                        <div className="flex flex-col gap-1 mt-2 w-full">
                            <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit mx-auto">
                                {notation}
                            </div>
                            <div className="text-sm text-muted-foreground font-medium">
                                {result?.output}
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}