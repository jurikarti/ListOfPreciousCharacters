"use client";
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Code } from "lucide-react";

interface EditorProps {
    value: string;
    onChange: (value: string) => void;
}

export default function TiptapEditor({ value, onChange }: EditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: value,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert w-full border rounded-md min-h-[150px] p-3 focus:outline-none bg-background [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4"
            }
        }
    });

    // Синхронизация при внешнем изменении (импорт)
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value);
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="space-y-2 border rounded-lg p-2 bg-background shadow-sm">
            <div className="flex gap-1 border-b pb-2 flex-wrap">
                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Bold"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`h-8 w-8 ${editor.isActive('bold') ? 'bg-muted' : ''}`}
                ><Bold className="h-4 w-4" /></Button>

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Italic"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`h-8 w-8 ${editor.isActive('italic') ? 'bg-muted' : ''}`}
                ><Italic className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-border mx-1 my-auto" />

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Heading 1"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`h-8 w-8 ${editor.isActive('heading', { level: 1 }) ? 'bg-muted' : ''}`}
                ><Heading1 className="h-4 w-4" /></Button>

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Heading 2"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`h-8 w-8 ${editor.isActive('heading', { level: 2 }) ? 'bg-muted' : ''}`}
                ><Heading2 className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-border mx-1 my-auto" />

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Bullet List"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`h-8 w-8 ${editor.isActive('bulletList') ? 'bg-muted' : ''}`}
                ><List className="h-4 w-4" /></Button>

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Ordered List"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`h-8 w-8 ${editor.isActive('orderedList') ? 'bg-muted' : ''}`}
                ><ListOrdered className="h-4 w-4" /></Button>

                <div className="w-px h-6 bg-border mx-1 my-auto" />

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Blockquote"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`h-8 w-8 ${editor.isActive('blockquote') ? 'bg-muted' : ''}`}
                ><Quote className="h-4 w-4" /></Button>

                <Button
                    size="icon"
                    variant="ghost"
                    type="button"
                    title="Code"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={`h-8 w-8 ${editor.isActive('code') ? 'bg-muted' : ''}`}
                ><Code className="h-4 w-4" /></Button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}