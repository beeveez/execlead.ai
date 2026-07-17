import React from "react";
import ReactMarkdown from "react-markdown";
import ToolCallDisplay from "./ToolCallDisplay";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "bg-indigo-500/10 border-indigo-500/20" : "bg-white/[0.03] border-white/5"} border rounded-2xl px-4 py-3`}>
        {message.content && (
          isUser
            ? <p className="text-sm text-white/90 whitespace-pre-wrap">{message.content}</p>
            : <ReactMarkdown skipHtml className="text-sm text-white/80 prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">{message.content}</ReactMarkdown>
        )}
        {message.tool_calls?.map((tc, i) => <ToolCallDisplay key={i} toolCall={tc} />)}
      </div>
    </div>
  );
}