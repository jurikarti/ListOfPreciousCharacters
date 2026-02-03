import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { ChangelogEntry } from "@/lib/changelog";

interface ChangelogModalProps {
    isOpen: boolean;
    onClose: () => void;
    entry: ChangelogEntry;
}

export function ChangelogModal({ isOpen, onClose, entry }: ChangelogModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md sm:max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-primary/10 rounded-full text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Что нового</span>
                    </div>
                    <DialogTitle className="text-2xl">Обновление {entry.version}</DialogTitle>
                    <DialogDescription>
                        Вышла новая версия приложения! Вот что изменилось {entry.date}:
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh] pr-4 my-2">
                    <div className="space-y-4">
                        <div className="bg-muted/30 p-4 rounded-lg border">
                            <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Основные изменения
                            </h4>
                            <ul className="space-y-3">
                                {entry.changes.map((change, index) => (
                                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-foreground/90">
                                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5 opacity-80" />
                                        <span>{change}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter>
                    <Button onClick={onClose} className="w-full sm:w-auto">
                        Понятно, спасибо!
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
