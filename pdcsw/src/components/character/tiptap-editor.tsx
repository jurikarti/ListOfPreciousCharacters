"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        // Это исправляет ошибку SSR в Next.js
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert w-full border rounded-md min-h-[150px] p-3 focus:outline-none bg-background"
            }
        }
    });

    if (!editor) return null;

    return (
        <div className="space-y-2 border rounded-lg p-2 bg-background shadow-sm">
            <div className="flex gap-1 border-b pb-2 flex-wrap">
                <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'bg-muted' : ''}
                >
                    <b>B</b>
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'bg-muted' : ''}
                >
                    <i>I</i>
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'bg-muted' : ''}
                >
                    List
                </Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}