// src/components/common/RichTextEditor.tsx
import React, { useEffect, useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: number;
  showSlideSeparator?: boolean;
  disabled?: boolean;
}

export interface RichTextEditorRef {
  getEditor: () => any;
  insertSlideSeparator: () => void;
}

const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(({
  value,
  onChange,
  placeholder = "Start writing your content here...",
  minHeight = 300,
  showSlideSeparator = false,
  disabled = false
}, ref) => {
  const quillRef = useRef<ReactQuill>(null);

  // custom slide separator handler
  const insertSlideSeparator = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      const index = range ? range.index : editor.getLength();
      
      // insert slide separator with some formatting
      editor.insertText(index, '\n---SLIDE---\n', 'user');
      editor.setSelection(index + 13, 0); // position cursor after the separator
    }
  };

  // expose methods through ref
  useImperativeHandle(ref, () => ({
    getEditor: () => quillRef.current?.getEditor(),
    insertSlideSeparator
  }));

  // quill editor configuration
  const quillModules = useMemo(() => {
    const toolbar = [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean'] // remove formatting button
    ];

    const handlers: any = {};

    // add slide separator if enabled
    if (showSlideSeparator) {
      toolbar.splice(-1, 0, ['slide-separator']); // insert before 'clean'
      handlers['slide-separator'] = insertSlideSeparator;
    }

    return {
      toolbar: {
        container: toolbar,
        handlers
      },
      clipboard: {
        matchVisual: false
      }
    };
  }, [showSlideSeparator]);

  const quillFormats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'align',
    'list', 'bullet', 'indent',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // custom styles for the quill editor
  const editorStyles = `
    .rich-text-editor .ql-editor {
      min-height: ${minHeight}px;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .rich-text-editor .ql-toolbar {
      border-top: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-radius: 8px 8px 0 0;
    }
    
    .rich-text-editor .ql-container {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
      border-radius: 0 0 8px 8px;
    }

    .rich-text-editor .ql-editor.ql-blank::before {
      color: #9ca3af;
      font-style: italic;
    }

    /* custom slide separator button styles */
    .rich-text-editor .ql-toolbar .ql-slide-separator {
      width: 28px;
      height: 28px;
    }
    
    .rich-text-editor .ql-toolbar .ql-slide-separator:before {
      content: '';
      display: inline-block;
      width: 16px;
      height: 16px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M12 2L2 7l10 5 10-5-10-5z'/%3E%3Cpath d='M2 17l10 5 10-5'/%3E%3Cpath d='M2 12l10 5 10-5'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
    }

    .rich-text-editor .ql-toolbar .ql-slide-separator.ql-active:before,
    .rich-text-editor .ql-toolbar .ql-slide-separator:hover:before {
      filter: brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(2073%) hue-rotate(212deg) brightness(95%) contrast(101%);
    }

    /* style the slide separators in the content */
    .rich-text-editor .ql-editor p:has-text("---SLIDE---"),
    .rich-text-editor .ql-editor:contains("---SLIDE---") {
      background-color: #f3f4f6;
      border: 2px dashed #9ca3af;
      padding: 8px;
      margin: 16px 0;
      text-align: center;
      font-weight: bold;
      color: #6b7280;
      border-radius: 4px;
    }

    /* disabled state */
    .rich-text-editor.disabled .ql-toolbar {
      pointer-events: none;
      opacity: 0.6;
    }
    
    .rich-text-editor.disabled .ql-editor {
      background-color: #f9fafb;
      color: #6b7280;
    }
  `;

  // initialize custom toolbar after component mounts
  useEffect(() => {
    if (showSlideSeparator) {
      // add custom tooltip to the slide separator button
      const slideButton = document.querySelector('.rich-text-editor .ql-slide-separator');
      if (slideButton) {
        slideButton.setAttribute('title', 'insert slide separator');
      }
    }
  }, [showSlideSeparator]);

  return (
    <>
      {/* add custom styles */}
      <style dangerouslySetInnerHTML={{ __html: editorStyles }} />
      
      <div className={`rich-text-editor ${disabled ? 'disabled' : ''}`}>
        <ReactQuill
          ref={quillRef}
          value={value}
          onChange={onChange}
          modules={quillModules}
          formats={quillFormats}
          placeholder={placeholder}
          theme="snow"
          readOnly={disabled}
        />
      </div>
    </>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

export default RichTextEditor;
