"use client";

import { ChangeEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { User, Upload, X } from "lucide-react";

interface ImageUploadProps {
    value: string;
    onChange: (base64: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
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
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
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
        </div>
    );
}