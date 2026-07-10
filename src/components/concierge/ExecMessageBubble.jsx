import React from "react";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";

const markdownComponents = {
  a: ({ href, children }) => {
    if (href?.startsWith("/")) {
      return (
        <Link to={href} className="text-amber-500 hover:text-amber-600 underline font-medium">
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-600 underline font-medium">
        {children}
      </a>
    );
  },
};

export default function ExecMessageBubble({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
          <Sparkles size={16} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted border border-border text-foreground rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        ) : (
          <ReactMarkdown
            components={markdownComponents}
            className="text-sm prose prose-sm max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5 [&_strong]:font-semibold"
          >
            {message.content}
          </ReactMarkdown>
        )}
      </div>
    </div>
  );
}