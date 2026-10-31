"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';
import { Bold, Italic, Code, List, Heading2 } from 'lucide-react';

interface TiptapEditorProps {
  value: any;
  onChange: (value: any) => void;
  editable?: boolean;
}

export default function TiptapEditor({ value, onChange, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add details, context, or reproduction steps...',
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3 text-xs leading-relaxed text-zinc-900 dark:text-zinc-100',
      },
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isFocused) {
      const currentJson = editor.getJSON();
      if (JSON.stringify(currentJson) !== JSON.stringify(value)) {
        editor.commands.setContent(value);
      }
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`rounded-xl border border-zinc-200/80 dark:border-zinc-800/80 overflow-hidden bg-white dark:bg-zinc-950 ${!editable ? 'opacity-85' : ''}`}>
      {editable && (
        <div className="flex items-center gap-1 p-1.5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/70 dark:bg-zinc-900/40">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              editor.isActive('bold') 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              editor.isActive('italic') 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              editor.isActive('code') 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded-md text-xs transition-colors ${
              editor.isActive('bulletList') 
                ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' 
                : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
