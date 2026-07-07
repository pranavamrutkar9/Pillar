"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect } from 'react';

interface TiptapEditorProps {
  value: any;
  onChange: (value: any) => void;
  editable?: boolean;
}

export default function TiptapEditor({ value, onChange, editable = true }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add a description...',
      }),
    ],
    content: value,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[150px] p-4 border border-zinc-200 dark:border-zinc-800 rounded-b-md bg-white dark:bg-zinc-950 text-black dark:text-white dark:prose-invert',
      },
    },
  });

  useEffect(() => {
    if (editor && value && !editor.isFocused) {
      // Only update content if it's vastly different and not focused to prevent cursor jumping
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
    <div className={`tiptap-wrapper ${!editable ? 'opacity-80' : ''}`}>
      {editable && (
        <div className="flex gap-2 p-2 border-b border-zinc-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900 rounded-t-md">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'}`}
          >
            Bold
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-2 py-1 rounded text-sm font-medium transition-colors ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-zinc-800 text-black dark:text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-800'}`}
          >
            Italic
          </button>
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
