import React, { useState, useRef } from 'react';
import { 
  Heading1, 
  Heading2, 
  Bold, 
  Italic, 
  List, 
  Code, 
  Link as LinkIcon, 
  Quote, 
  Image as ImageIcon,
  Eye,
  Edit2
} from 'lucide-react';

// Custom lightweight regex-based Markdown to HTML Parser
const parseMarkdown = (markdown) => {
  if (!markdown) return '';
  
  let html = markdown;

  // 1. Escaping script elements for XSS safety
  html = html
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '');

  // 2. Code blocks (```lang code ```)
  html = html.replace(/```([\s\S]*?)```/g, (match, code) => {
    return `<pre class="bg-surface dark:bg-dark-surface p-4 rounded-xl text-xs font-mono overflow-x-auto text-text dark:text-dark-text my-4 border border-border dark:border-dark-border"><code>${code.trim()}</code></pre>`;
  });

  // 3. Inline code (`code`)
  html = html.replace(/`([^`\n]+)`/g, '<code class="bg-surface dark:bg-dark-surface px-1.5 py-0.5 rounded text-sm font-mono text-primary dark:text-dark-primary">$1</code>');

  // 4. Headings (### Title)
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-lg font-bold text-text dark:text-dark-text mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-xl font-bold text-text dark:text-dark-text mt-6 mb-3">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-extrabold text-text dark:text-dark-text mt-8 mb-4">$1</h1>');

  // 5. Blockquotes (> quote)
  html = html.replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-primary pl-4 py-1 italic bg-primary/10 dark:bg-primary/5 text-text dark:text-dark-text my-4">$1</blockquote>');

  // 6. Image Insertions (![alt](url))
  html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded-2xl border border-border dark:border-dark-border shadow-md my-6 mx-auto hover:opacity-95 transition-opacity" />');

  // 7. Links ([text](url))
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary dark:text-dark-primary font-semibold underline hover:text-secondary transition-colors">$1</a>');

  // 8. Lists (- list item or * list item)
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="ml-6 list-disc text-text dark:text-dark-text mb-1">$1</li>');

  // 9. Bold (**text** or __text__)
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-extrabold text-text dark:text-dark-text">$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong class="font-extrabold text-text dark:text-dark-text">$1</strong>');

  // 10. Italic (*text* or _text_)
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/_([^_]+)_/g, '<em class="italic">$1</em>');

  // 11. Paragraph line breaks
  html = html.replace(/^(?!<[a-z]+)/gm, '<p class="mb-4 text-text dark:text-dark-text leading-relaxed">$1</p>');

  // Cleanup lists
  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul class="my-4 space-y-1">$1</ul>');

  return html;
};

const RichTextEditor = ({ value, onChange, placeholder = 'Write your blog post in markdown...' }) => {
  const [activeTab, setActiveTab] = useState('write'); // 'write' | 'preview'
  const textareaRef = useRef(null);

  // Helper to insert formatting tags at selected cursor range
  const insertText = (before, after = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(startPos, endPos);

    const replacement = before + (selectedText || after || '') + (selectedText ? after : '');
    const newValue = text.substring(0, startPos) + replacement + text.substring(endPos);

    onChange(newValue);
    
    // Reset focus & cursor selection position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = startPos + before.length + (selectedText || after || '').length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 50);
  };

  return (
    <div className="w-full border border-border dark:border-dark-border rounded-2xl overflow-hidden bg-surface dark:bg-dark-surface transition-all">
      {/* Editor Tabs and Toolbars */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border dark:border-dark-border bg-background dark:bg-dark-background">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'write' ? 'bg-surface dark:bg-dark-surface text-primary dark:text-dark-primary shadow-sm' : 'text-muted hover:text-text dark:hover:text-dark-text'}`}
          >
            <Edit2 className="w-3.5 h-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${activeTab === 'preview' ? 'bg-surface dark:bg-dark-surface text-primary dark:text-dark-primary shadow-sm' : 'text-muted hover:text-text dark:hover:text-dark-text'}`}
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </button>
        </div>

        {/* Action Toolbar buttons (only visible when in Write mode) */}
        {activeTab === 'write' && (
          <div className="flex items-center space-x-1 border-l border-border dark:border-dark-border pl-3">
            <button
              type="button"
              onClick={() => insertText('## ', '\n')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Heading 2"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('### ', '\n')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Heading 3"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('**', '**')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('*', '*')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('- ', '\n')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('```\n', '\n```')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Code Block"
            >
              <Code className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('> ', '\n')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Blockquote"
            >
              <Quote className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('[text](', ')')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertText('![alt](', ')')}
              className="p-1.5 rounded hover:bg-surface dark:hover:bg-dark-surface text-muted hover:text-text dark:hover:text-dark-text"
              title="Image URL"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Editor Content Area */}
      <div className="bg-surface dark:bg-dark-surface min-h-[350px]">
        {activeTab === 'write' ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full min-h-[350px] p-5 font-mono text-sm border-0 focus:ring-0 focus:outline-none bg-transparent text-text dark:text-dark-text resize-y"
          />
        ) : (
          <div 
            className="prose dark:prose-invert max-w-none p-6 text-text dark:text-dark-text overflow-y-auto min-h-[350px]"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(value) || '<p class="text-muted italic">Nothing to preview yet. Start typing...</p>' }}
          />
        )}
      </div>
    </div>
  );
};

export { parseMarkdown };
export default RichTextEditor;
