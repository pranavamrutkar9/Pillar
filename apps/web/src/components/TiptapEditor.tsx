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
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] p-3.5 text-xs font-medium leading-relaxed text-black dark:text-zinc-100',
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
    <div className={`rounded-xl border-2 border-black dark:border-white overflow-hidden bg-white dark:bg-zinc-950 shadow-[3px_3px_0px_0px_#000] dark:shadow-[3px_3px_0px_0px_#fff] ${!editable ? 'opacity-85' : ''}`}>
      {editable && (
        <div className="flex items-center gap-1.5 p-2 border-b-2 border-black dark:border-white bg-[#FFE600] text-black">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded text-xs font-black transition-all cursor-pointer ${
              editor.isActive('bold') 
                ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_#000]' 
                : 'text-black hover:bg-black/10'
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded text-xs font-black transition-all cursor-pointer ${
              editor.isActive('italic') 
                ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_#000]' 
                : 'text-black hover:bg-black/10'
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-1.5 rounded text-xs font-black transition-all cursor-pointer ${
              editor.isActive('code') 
                ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_#000]' 
                : 'text-black hover:bg-black/10'
            }`}
            title="Code"
          >
            <Code className="w-4 h-4 stroke-[2.5]" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-1.5 rounded text-xs font-black transition-all cursor-pointer ${
              editor.isActive('bulletList') 
                ? 'bg-black text-white border border-black shadow-[1px_1px_0px_0px_#000]' 
                : 'text-black hover:bg-black/10'
            }`}
            title="Bullet List"
          >
            <List className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
