// ============================================
// ChatMessage.jsx - Single Chat Message Bubble
// ============================================
// Displays user or assistant message with proper
// alignment and optional "Apply to resume" button.
// ============================================

import { HiSparkles, HiCheckCircle } from 'react-icons/hi2';

const parseInlineMarkdown = (text) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <strong key={index}>{part.slice(1, -1)}</strong>;
    }
    return part;
  });
};

export const parseMarkdown = (content) => {
  const lines = String(content || '').split(/\r?\n/);
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    elements.push(
      <ul key={`list-${elements.length}`} className="chat-markdown-list">
        {listItems}
      </ul>
    );
    listItems = [];
  };

  lines.forEach((line, index) => {
    const listMatch = line.match(/^\s*[*-]\s+(.+)$/);
    if (listMatch) {
      listItems.push(<li key={`item-${index}`}>{parseInlineMarkdown(listMatch[1])}</li>);
      return;
    }

    flushList();
    if (line) {
      elements.push(<span key={`line-${index}`}>{parseInlineMarkdown(line)}</span>);
    }
    if (index < lines.length - 1) {
      elements.push(<br key={`break-${index}`} />);
    }
  });

  flushList();
  return elements;
};

function ChatMessage({ role, content, timestamp, extractedData, onApply }) {
  const isUser = role === 'user';

  const formatTime = (ts) => {
    if (!ts) return '';
    return new Date(ts).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
  };

  return (
    <div className={`flex-row ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`chat-bubble ${isUser ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}>
        {!isUser && (
          <div className="flex-row items-center gap-xs mb-sm">
            <HiSparkles className="text-xs text-purple" />
            <span className="text-xs font-semibold text-purple">AI Assistant</span>
          </div>
        )}

        <div className="text-sm">
          {parseMarkdown(content)}
        </div>

        <div className={`flex-row items-center gap-sm mt-sm ${isUser ? 'justify-end' : 'flex-between'}`}>
          <span className="chat-timestamp">
            {formatTime(timestamp)}
          </span>

          {extractedData && !isUser && (
            <button
              onClick={() => onApply(extractedData)}
              className="btn btn-outline btn-xs flex-row items-center gap-xs"
            >
              <HiCheckCircle className="text-xs" />
              Apply to resume
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
