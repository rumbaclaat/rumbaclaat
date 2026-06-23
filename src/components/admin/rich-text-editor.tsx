"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState } from "react";

function Btn({
  editor,
  onClick,
  active,
  children,
}: {
  editor: Editor | null;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`rte-btn${active ? " active" : ""}`}
      onMouseDown={(e) => {
        e.preventDefault();
        if (editor) onClick();
      }}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  name,
  defaultValue = "",
}: {
  name: string;
  defaultValue?: string;
}) {
  const [html, setHtml] = useState(defaultValue);
  const editor = useEditor({
    extensions: [StarterKit],
    content: defaultValue,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
  });

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <Btn editor={editor} active={editor?.isActive("bold")} onClick={() => editor!.chain().focus().toggleBold().run()}><strong>B</strong></Btn>
        <Btn editor={editor} active={editor?.isActive("italic")} onClick={() => editor!.chain().focus().toggleItalic().run()}><em>I</em></Btn>
        <Btn editor={editor} active={editor?.isActive("heading", { level: 2 })} onClick={() => editor!.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Btn>
        <Btn editor={editor} active={editor?.isActive("heading", { level: 3 })} onClick={() => editor!.chain().focus().toggleHeading({ level: 3 }).run()}>H3</Btn>
        <Btn editor={editor} active={editor?.isActive("bulletList")} onClick={() => editor!.chain().focus().toggleBulletList().run()}>• List</Btn>
        <Btn editor={editor} active={editor?.isActive("orderedList")} onClick={() => editor!.chain().focus().toggleOrderedList().run()}>1. List</Btn>
        <Btn editor={editor} active={editor?.isActive("blockquote")} onClick={() => editor!.chain().focus().toggleBlockquote().run()}>❝</Btn>
        <Btn editor={editor} onClick={() => editor!.chain().focus().setParagraph().run()}>¶</Btn>
      </div>
      <EditorContent editor={editor} className="rte-content" />
      <input type="hidden" name={name} value={html} />
    </div>
  );
}
