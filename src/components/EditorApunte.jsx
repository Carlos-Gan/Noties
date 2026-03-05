import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'
import { useEffect } from 'react'

const lowlight = createLowlight(common)

export default function EditorApunte({ contenido, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // lo reemplazamos con el de lowlight
      }),
      Image,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: contenido || { type: 'doc', content: [] },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON()) // manda el JSON a quien lo use
    },
  })

  // Si cambia el apunte desde afuera, actualizar el editor
  useEffect(() => {
    if (editor && contenido) {
      editor.commands.setContent(contenido)
    }
  }, [contenido?.doc]) // solo si cambia el documento

  if (!editor) return null

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-white/10 flex-wrap">
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="B"
          className="font-bold"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="I"
          className="italic"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          label="S"
          className="line-through"
        />
        <div className="w-px bg-white/10 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          label="H1"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          label="H2"
        />
        <div className="w-px bg-white/10 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          label="• Lista"
        />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          label="1. Lista"
        />
        <div className="w-px bg-white/10 mx-1" />
        <ToolbarBtn
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          label="<Código>"
        />
        <ToolbarBtn
          onClick={() => {
            const url = prompt('URL de la imagen:')
            if (url) editor.chain().focus().setImage({ src: url }).run()
          }}
          label="🖼 Imagen"
        />
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="flex-1 overflow-y-auto p-6 prose prose-invert max-w-none focus:outline-none"
      />
    </div>
  )
}

function ToolbarBtn({ onClick, active, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 rounded text-sm transition-colors ${className}
        ${active
          ? 'bg-white/20 text-white'
          : 'text-white/50 hover:text-white hover:bg-white/10'
        }`}
    >
      {label}
    </button>
  )
}