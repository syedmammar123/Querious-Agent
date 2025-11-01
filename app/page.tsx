'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  User, 
  Bot, 
  Send, 
  Loader2, 
  Database, 
  Code, 
  ChevronDown, 
  ChevronUp,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface ToolCallPart {
  type: string;
  toolCallId?: string;
  state?: string;
  input?: any;
  output?: any;
}

export default function Chat() {
  const [input, setInput] = useState('');
  const [expandedToolCalls, setExpandedToolCalls] = useState<Set<string>>(new Set());
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, sendMessage, isLoading } = useChat();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 128)}px`;
    }
  }, [input]);

  const toggleToolCall = (toolCallId: string) => {
    setExpandedToolCalls(prev => {
      const next = new Set(prev);
      if (next.has(toolCallId)) {
        next.delete(toolCallId);
      } else {
        next.add(toolCallId);
      }
      return next;
    });
  };

  const formatToolOutput = (output: any, toolType: string) => {
    if (toolType === 'tool-dbCallTool' && output?.rows) {
      return {
        columns: output.columns || [],
        rows: output.rows || [],
        rowCount: output.rows.length,
        rowsAffected: output.rowsAffected || 0,
      };
    }
    if (toolType === 'tool-dbSchemaTool' && typeof output === 'string') {
      return output;
    }
    return output;
  };

  const renderToolCall = (part: ToolCallPart, index: number) => {
    const toolCallId = part.toolCallId || `tool-${index}`;
    const isExpanded = expandedToolCalls.has(toolCallId);
    const toolType = part.type as string;
    const state = part.state || 'pending';
    const output = formatToolOutput(part.output, toolType);
    
    const isSchemaTool = toolType === 'tool-dbSchemaTool';
    const isDbCallTool = toolType === 'tool-dbCallTool';
    
    const getStateIcon = () => {
      switch (state) {
        case 'output-available':
        case 'done':
          return <CheckCircle2 className="w-4 h-4 text-green-500" />;
        case 'loading':
          return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
        default:
          return <Clock className="w-4 h-4 text-gray-500" />;
      }
    };

    const getStateText = () => {
      switch (state) {
        case 'output-available':
        case 'done':
          return 'Completed';
        case 'loading':
          return 'Running...';
        default:
          return 'Pending';
      }
    };

    return (
      <div key={toolCallId} className="mb-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => toggleToolCall(toolCallId)}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            {isSchemaTool ? (
              <Database className="w-4 h-4 text-purple-500" />
            ) : (
              <Code className="w-4 h-4 text-blue-500" />
            )}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {isSchemaTool ? 'Schema Query' : 'Database Query'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
              {getStateText()}
            </span>
            {getStateIcon()}
          </div>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
            {part.input && Object.keys(part.input).length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Input
                </h4>
                {isDbCallTool && part.input.query ? (
                  <div className="bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto">
                    <code>{part.input.query}</code>
                  </div>
                ) : (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(part.input, null, 2)}
                  </pre>
                )}
              </div>
            )}
            
            {output && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">
                  Output
                </h4>
                {isDbCallTool && output.rows ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-200 dark:bg-gray-800">
                          {output.columns.map((col: string, idx: number) => (
                            <th
                              key={idx}
                              className="px-3 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-300 dark:border-gray-700"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {output.rows.map((row: any[], rowIdx: number) => (
                          <tr
                            key={rowIdx}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            {row.map((cell: any, cellIdx: number) => (
                              <td
                                key={cellIdx}
                                className="px-3 py-2 text-gray-700 dark:text-gray-300"
                              >
                                {cell !== null && cell !== undefined ? String(cell) : 'NULL'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {output.rowCount !== undefined && (
                      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        {output.rowCount} row{output.rowCount !== 1 ? 's' : ''} returned
                      </div>
                    )}
                  </div>
                ) : isSchemaTool && typeof output === 'string' ? (
                  <div className="bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded-md font-mono text-xs overflow-x-auto whitespace-pre-wrap">
                    <code>{output}</code>
                  </div>
                ) : (
                  <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(output, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '48px';
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              SQL Agent
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI-powered database assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to SQL Agent
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Ask me anything about your database. I can help you query data, understand schemas, and analyze your information.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user';
            const textParts = message.parts.filter((p: any) => p.type === 'text');
            const toolParts = message.parts.filter((p: any) => 
              p.type?.startsWith('tool-')
            );
            const hasContent = textParts.length > 0 || toolParts.length > 0;

            if (!hasContent) return null;

            return (
              <div
                key={message.id}
                className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}

                <div
                  className={`flex flex-col gap-2 max-w-[80%] ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {/* Tool Calls */}
                  {toolParts.length > 0 && !isUser && (
                    <div className="w-full space-y-2">
                      {toolParts.map((part: any, idx: number) =>
                        renderToolCall(part, idx)
                      )}
                    </div>
                  )}

                  {/* Text Messages */}
                  {textParts.map((part: any, idx: number) => {
                    const isStreaming = part.state !== 'done' && !isUser;
                    const text = part.text || '';

                    if (!text && !isStreaming) return null;

                    return (
                      <div
                        key={`${message.id}-text-${idx}`}
                        className={`rounded-2xl px-4 py-3 ${
                          isUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {isUser ? (
                          <div className="whitespace-pre-wrap break-words">
                            {text}
                          </div>
                        ) : (
                          <div className="max-w-none">
                            {isStreaming ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                <span className="text-gray-500 dark:text-gray-400">
                                  Thinking...
                                </span>
                              </div>
                            ) : (
                              <ReactMarkdown
                                components={{
                                  code: ({ node, inline, className, children, ...props }: any) => {
                                    return inline ? (
                                      <code
                                        className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    ) : (
                                      <code
                                        className="block bg-gray-900 dark:bg-gray-950 text-green-400 p-3 rounded-md font-mono text-sm overflow-x-auto my-2"
                                        {...props}
                                      >
                                        {children}
                                      </code>
                                    );
                                  },
                                  p: ({ children }: any) => (
                                    <p className="mb-2 last:mb-0">{children}</p>
                                  ),
                                  ul: ({ children }: any) => (
                                    <ul className="list-disc list-inside mb-2 space-y-1">
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ children }: any) => (
                                    <ol className="list-decimal list-inside mb-2 space-y-1">
                                      {children}
                                    </ol>
                                  ),
                                  strong: ({ children }: any) => (
                                    <strong className="font-semibold">{children}</strong>
                                  ),
                                }}
                              >
                                {text}
                              </ReactMarkdown>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && messages.length > 0 && (
            <div className="flex gap-4 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Processing your request...
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (input.trim() && !isLoading) {
                    handleSubmit(e);
                  }
                }
              }}
              placeholder="Ask a question about your database..."
              disabled={isLoading}
              rows={1}
              className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[48px] max-h-32 overflow-y-auto"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </form>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
