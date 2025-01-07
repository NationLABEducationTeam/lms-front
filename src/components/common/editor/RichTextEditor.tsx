import { FC } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Color from '@tiptap/extension-color';
import { Toggle } from '@/components/ui/toggle';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Type,
  Palette,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor: FC<RichTextEditorProps> = ({ content, onChange }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const fonts = [
    { label: '기본', value: 'Inter' },
    { label: '나눔고딕', value: 'Nanum Gothic' },
    { label: '나눔명조', value: 'Nanum Myeongjo' },
    { label: '맑은 고딕', value: 'Malgun Gothic' },
    { label: '돋움', value: 'Dotum' },
    { label: '굴림', value: 'Gulim' },
  ] as const;

  const colors = [
    { label: '검정', value: '#000000' },
    { label: '회색', value: '#666666' },
    { label: '빨강', value: '#ff0000' },
    { label: '파랑', value: '#0000ff' },
    { label: '초록', value: '#00aa00' },
    { label: '보라', value: '#800080' },
  ] as const;

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkInput(false);
    }
  };

  const ToolbarButton = ({ isActive = false, onClick, children }: any) => (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={onClick}
      className={cn(
        "h-8 w-8 p-0 text-slate-700",
        "hover:bg-slate-100 hover:text-slate-900",
        "data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900",
        "disabled:opacity-50"
      )}
    >
      {children}
    </Toggle>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-slate-200 mx-1" />
  );

  return (
    <div className="rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 p-2">
        <div className="flex flex-wrap gap-1 items-center">
          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
            >
              <UnderlineIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('left').run()}
              isActive={editor.isActive({ textAlign: 'left' })}
            >
              <AlignLeft className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('center').run()}
              isActive={editor.isActive({ textAlign: 'center' })}
            >
              <AlignCenter className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().setTextAlign('right').run()}
              isActive={editor.isActive({ textAlign: 'right' })}
            >
              <AlignRight className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
            >
              <List className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>
          </div>

          <Divider />

          <div className="flex items-center gap-1">
            <Type className="h-4 w-4 text-slate-700" />
            <Select
              value={editor.getAttributes('textStyle').fontFamily}
              onValueChange={(value: string) => editor.chain().focus().setFontFamily(value).run()}
            >
              <SelectTrigger className="h-8 w-[120px] border-slate-200 bg-white text-slate-700">
                <SelectValue placeholder="글꼴" />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-1">
            <Palette className="h-4 w-4 text-slate-700" />
            <Select
              value={editor.getAttributes('textStyle').color}
              onValueChange={(value: string) => editor.chain().focus().setColor(value).run()}
            >
              <SelectTrigger className="h-8 w-[100px] border-slate-200 bg-white text-slate-700">
                <SelectValue placeholder="색상" />
              </SelectTrigger>
              <SelectContent>
                {colors.map((color) => (
                  <SelectItem key={color.value} value={color.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border border-slate-200"
                        style={{ backgroundColor: color.value }}
                      />
                      {color.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Divider />

          <div className="flex items-center">
            {showLinkInput ? (
              <>
                <Input
                  type="url"
                  placeholder="URL 입력"
                  value={linkUrl}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLinkUrl(e.target.value)}
                  className="h-8 w-[200px] border-slate-200 bg-white text-slate-700"
                />
                <ToolbarButton pressed={true} onClick={setLink}>
                  <LinkIcon className="h-4 w-4" />
                </ToolbarButton>
              </>
            ) : (
              <ToolbarButton
                isActive={editor.isActive('link')}
                onClick={() => setShowLinkInput(true)}
              >
                <LinkIcon className="h-4 w-4" />
              </ToolbarButton>
            )}
          </div>

          <Divider />

          <div className="flex items-center">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>
      </div>

      <EditorContent
        editor={editor}
        className="prose prose-slate max-w-none p-4 min-h-[300px] focus:outline-none text-slate-900"
      />
    </div>
  );
};

export default RichTextEditor; 