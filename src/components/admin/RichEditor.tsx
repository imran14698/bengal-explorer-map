import { useEffect } from "react";
import * as React from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import LinkExt from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { FontFamily } from "@tiptap/extension-font-family";
import { FontSize } from "@tiptap/extension-font-size";
import Highlight from "@tiptap/extension-highlight";
import { Table } from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  Heading1, Heading2, Heading3, Heading4,
  List, ListOrdered, Quote, Code, Code2,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Image as ImageIcon, Link as LinkIcon, Unlink,
  Undo, Redo, Minus, Highlighter, Palette,
  Table as TableIcon, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFonts, BANGLA_PRESETS, ENGLISH_PRESETS } from "@/hooks/useFonts";
import { ensureFontLink } from "@/lib/fontLoader";

const FONT_SIZES = ["12px", "14px", "16px", "18px", "24px", "32px"];

const FontSizePicker = ({ editor }: { editor: Editor }) => {
  const current = (editor.getAttributes("textStyle").fontSize as string | undefined) || "";
  const handleChange = (val: string) => {
    if (val === "__default__") {
      editor.chain().focus().unsetFontSize().run();
      return;
    }
    editor.chain().focus().setFontSize(val).run();
  };
  return (
    <Select value={current || "__default__"} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-[80px] text-xs" title="Font size">
        <SelectValue placeholder="Size" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__default__">Default</SelectItem>
        {FONT_SIZES.map((s) => (
          <SelectItem key={s} value={s}>
            <span style={{ fontSize: s }}>{s}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const FontFamilyPicker = ({ editor }: { editor: Editor }) => {
  const { fonts } = useFonts();

  // Build grouped list: site fonts (current) + Bangla presets + English presets, deduped.
  const siteFonts = [
    { family: fonts.bangla_heading.family, weights: fonts.bangla_heading.weights, group: "site" as const, label: "Bangla heading" },
    { family: fonts.bangla_body.family, weights: fonts.bangla_body.weights, group: "site" as const, label: "Bangla body" },
    { family: fonts.english_heading.family, weights: fonts.english_heading.weights, group: "site" as const, label: "English heading" },
    { family: fonts.english_body.family, weights: fonts.english_body.weights, group: "site" as const, label: "English body" },
  ];

  // Preload all listed fonts so they render in the dropdown previews.
  React.useEffect(() => {
    siteFonts.forEach((f) => ensureFontLink(f.family, f.weights));
    BANGLA_PRESETS.forEach((f) => ensureFontLink(f.family, f.weights));
    ENGLISH_PRESETS.forEach((f) => ensureFontLink(f.family, f.weights));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fonts.bangla_heading.family, fonts.bangla_body.family, fonts.english_heading.family, fonts.english_body.family]);

  const current = (editor.getAttributes("textStyle").fontFamily as string | undefined) || "";
  // Strip surrounding quotes for matching
  const currentFamily = current.replace(/^["']|["']$/g, "").split(",")[0].trim();

  const handleChange = (val: string) => {
    if (val === "__default__") {
      editor.chain().focus().unsetFontFamily().run();
      return;
    }
    ensureFontLink(val);
    editor.chain().focus().setFontFamily(`"${val}", sans-serif`).run();
  };

  return (
    <Select value={currentFamily || "__default__"} onValueChange={handleChange}>
      <SelectTrigger className="h-8 w-[170px] text-xs" title="Font family">
        <SelectValue placeholder="Font" />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        <SelectItem value="__default__">Default (theme)</SelectItem>
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-wider">Site fonts</SelectLabel>
          {siteFonts.map((f, i) => (
            <SelectItem key={`site-${i}-${f.family}`} value={f.family}>
              <span style={{ fontFamily: `"${f.family}", sans-serif` }}>{f.family}</span>
              <span className="ml-2 text-[10px] text-muted-foreground">{f.label}</span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-wider">Bangla</SelectLabel>
          {BANGLA_PRESETS.map((f) => (
            <SelectItem key={`bn-${f.family}`} value={f.family}>
              <span style={{ fontFamily: `"${f.family}", sans-serif` }} lang="bn">
                {f.family} — অ আ ই
              </span>
            </SelectItem>
          ))}
        </SelectGroup>
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-wider">English</SelectLabel>
          {ENGLISH_PRESETS.map((f) => (
            <SelectItem key={`en-${f.family}`} value={f.family}>
              <span style={{ fontFamily: `"${f.family}", sans-serif` }}>{f.family}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
};


interface RichEditorProps {
  value: string;
  onChange: (html: string) => void;
  onUploadImage?: (file: File) => Promise<string | null>;
  placeholder?: string;
}

const TB = ({
  onClick, active, disabled, title, children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className={cn("h-8 w-8 shrink-0", active && "bg-primary/15 text-primary")}
    onClick={onClick}
    disabled={disabled}
    title={title}
  >
    {children}
  </Button>
);

const Toolbar = ({ editor, onUploadImage }: { editor: Editor; onUploadImage?: (f: File) => Promise<string | null> }) => {
  const insertImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      if (onUploadImage) {
        const url = await onUploadImage(file);
        if (url) editor.chain().focus().setImage({ src: url }).run();
      } else {
        const reader = new FileReader();
        reader.onload = () => editor.chain().focus().setImage({ src: reader.result as string }).run();
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = prompt("Link URL:", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url, target: "_blank" }).run();
  };

  const setColor = () => {
    const current = editor.getAttributes("textStyle").color as string | undefined;
    const c = prompt("Text color (hex or CSS color):", current || "#16a34a");
    if (c) editor.chain().focus().setColor(c).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-md border border-border bg-muted/40 p-1.5 overflow-x-auto scrollbar-slim">
      <FontFamilyPicker editor={editor} />
      <FontSizePicker editor={editor} />
      <Separator orientation="vertical" className="mx-1 h-6" />
      <TB title="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" /></TB>
      <TB title="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" /></TB>
      <TB title="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}><UnderlineIcon className="h-4 w-4" /></TB>
      <TB title="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}><Strikethrough className="h-4 w-4" /></TB>
      <TB title="Highlight" active={editor.isActive("highlight")} onClick={() => editor.chain().focus().toggleHighlight().run()}><Highlighter className="h-4 w-4" /></TB>
      <TB title="Text color" onClick={setColor}><Palette className="h-4 w-4" /></TB>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <TB title="Heading 1" active={editor.isActive("heading", { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}><Heading1 className="h-4 w-4" /></TB>
      <TB title="Heading 2" active={editor.isActive("heading", { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}><Heading2 className="h-4 w-4" /></TB>
      <TB title="Heading 3" active={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}><Heading3 className="h-4 w-4" /></TB>
      <TB title="Heading 4" active={editor.isActive("heading", { level: 4 })} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}><Heading4 className="h-4 w-4" /></TB>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <TB title="Bullet list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" /></TB>
      <TB title="Ordered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}><ListOrdered className="h-4 w-4" /></TB>
      <TB title="Blockquote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}><Quote className="h-4 w-4" /></TB>
      <TB title="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}><Code className="h-4 w-4" /></TB>
      <TB title="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}><Code2 className="h-4 w-4" /></TB>
      <TB title="Horizontal rule" onClick={() => editor.chain().focus().setHorizontalRule().run()}><Minus className="h-4 w-4" /></TB>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <TB title="Align left" active={editor.isActive({ textAlign: "left" })} onClick={() => editor.chain().focus().setTextAlign("left").run()}><AlignLeft className="h-4 w-4" /></TB>
      <TB title="Align center" active={editor.isActive({ textAlign: "center" })} onClick={() => editor.chain().focus().setTextAlign("center").run()}><AlignCenter className="h-4 w-4" /></TB>
      <TB title="Align right" active={editor.isActive({ textAlign: "right" })} onClick={() => editor.chain().focus().setTextAlign("right").run()}><AlignRight className="h-4 w-4" /></TB>
      <TB title="Justify" active={editor.isActive({ textAlign: "justify" })} onClick={() => editor.chain().focus().setTextAlign("justify").run()}><AlignJustify className="h-4 w-4" /></TB>

      <Separator orientation="vertical" className="mx-1 h-6" />

      <TB title="Insert link" active={editor.isActive("link")} onClick={setLink}><LinkIcon className="h-4 w-4" /></TB>
      <TB title="Remove link" disabled={!editor.isActive("link")} onClick={() => editor.chain().focus().unsetLink().run()}><Unlink className="h-4 w-4" /></TB>
      <TB title="Insert image" onClick={insertImage}><ImageIcon className="h-4 w-4" /></TB>
      <TB title="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}><TableIcon className="h-4 w-4" /></TB>
      {editor.isActive("table") && (
        <TB title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}><Trash2 className="h-4 w-4" /></TB>
      )}

      <Separator orientation="vertical" className="mx-1 h-6" />

      <TB title="Undo" onClick={() => editor.chain().focus().undo().run()}><Undo className="h-4 w-4" /></TB>
      <TB title="Redo" onClick={() => editor.chain().focus().redo().run()}><Redo className="h-4 w-4" /></TB>
    </div>
  );
};

const RichEditor = ({ value, onChange, onUploadImage, placeholder }: RichEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Image.configure({ inline: false, allowBase64: true }),
      LinkExt.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer nofollow", target: "_blank" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
      Color,
      Highlight.configure({ multicolor: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: "rich-content min-h-[280px] w-full rounded-b-md border border-t-0 border-border bg-background px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
        "data-placeholder": placeholder || "",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // External value sync (e.g. switching between BN / EN tabs)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className="tiptap-editor">
      <Toolbar editor={editor} onUploadImage={onUploadImage} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichEditor;
