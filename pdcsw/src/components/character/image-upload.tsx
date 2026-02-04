"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Upload, X, ArrowRight, Minimize2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const MAX_FILE_SIZE = 750 * 1024; // 750KB limit because localStorage has limited space

interface ImageUploadProps {
    value: string;
    onChange: (base64: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [isCompressionModalOpen, setIsCompressionModalOpen] = useState(false);
    const [pendingFile, setPendingFile] = useState<File | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                setPendingFile(file);
                setIsCompressionModalOpen(true);
                e.target.value = ""; // Reset input
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const compressImage = () => {
        if (!pendingFile) return;

        const reader = new FileReader();
        reader.readAsDataURL(pendingFile);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 1200;
                const MAX_HEIGHT = 1200;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx?.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                const dataUrl = canvas.toDataURL("image/jpeg", 0.7);

                // Check size again? Usually it's much smaller.
                onChange(dataUrl);
                toast.success("Изображение успешно сжато и загружено");
                setIsCompressionModalOpen(false);
                setPendingFile(null);
            };
        };
    };

    const removeImage = () => onChange("");

    return (
        <div className="space-y-2">
            <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 flex items-center justify-center group"
            >
                {value ? (
                    <>
                        <img src={value} alt="Character" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                            <Button
                                variant="destructive"
                                size="icon"
                                onClick={removeImage}
                                type="button"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-muted transition-colors">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <span className="text-xs text-muted-foreground">Загрузить фото (4:3)</span>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                )}
            </div>

            {/* Mobile Delete Button */}
            {value && (
                <Button
                    variant="outline"
                    size="sm"
                    className="w-auto px-8 sm:hidden mt-2 mx-auto flex items-center text-destructive hover:text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={removeImage}
                    type="button"
                >
                    <Trash2 className="mr-2 h-4 w-4" /> Удалить фото
                </Button>
            )}

            <Dialog open={isCompressionModalOpen} onOpenChange={setIsCompressionModalOpen}>
                <DialogContent className="w-[90%] max-w-sm rounded-xl sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Файл слишком большой</DialogTitle>
                        <DialogDescription>
                            Ваш файл весит {pendingFile ? (pendingFile.size / 1024 / 1024).toFixed(2) : 0} MB, что превышает лимит браузера (750KB).
                            <br />
                            Мы можем автоматически уменьшить размер и качество изображения, чтобы оно поместилось.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-center py-4">
                        <div className="bg-muted p-4 rounded-full">
                            <Minimize2 className="w-12 h-12 text-primary animate-pulse" />
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-2 sm:flex-col-reverse sm:items-center sm:space-x-0">
                        <Button variant="outline" onClick={() => setIsCompressionModalOpen(false)} className="h-12 sm:h-10 w-full sm:w-56">Отмена</Button>
                        <Button onClick={compressImage} className="h-12 sm:h-10 w-full sm:w-56">
                            Сжать и загрузить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}