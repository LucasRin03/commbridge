import { useEffect, useRef } from 'react';

/**
 * ChatPanel — Real-time message display for practice sessions
 *
 * Props:
 *   messages      - array of { id, userName, content, timestamp, isMe, isSystem, isTherapist }
 *   participants  - array of { userName, role, color }
 *   scenarioTitle - string
 */
export default function ChatPanel({ messages = [], participants = [], scenarioTitle = 'Practice Room' }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 text-sm">{scenarioTitle}</h3>
        <div className="flex -space-x-2">
          {participants.map((p, i) => (
            <div
              key={i}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white"
              style={{ background: p.color || '#028090' }}
              title={p.userName}
              aria-label={p.userName}
            >
              {p.userName?.charAt(0)}
            </div>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3" role="log" aria-live="polite" aria-label="Chat messages">
        {messages.map((msg) => {
          if (msg.isSystem) {
            return (
              <div key={msg.id} className="bg-orange-50 text-orange-700 border border-orange-200 rounded-xl px-3 py-2 text-xs text-center mx-auto max-w-sm">
                {msg.content}
              </div>
            );
          }

          if (msg.isTherapist) {
            return (
              <div key={msg.id} className="max-w-xs">
                <div className="text-xs text-slate-400 mb-1">{msg.userName}</div>
                <div className="bg-orange-50 text-orange-800 border border-orange-200 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
                  💬 {msg.content}
                </div>
              </div>
            );
          }

          if (msg.isMe) {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="max-w-xs">
                  <div className="bg-teal-600 text-white rounded-2xl rounded-br-sm px-3 py-2 text-sm">
                    {msg.content}
                  </div>
                  <div className="text-xs text-slate-400 text-right mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className="max-w-xs">
              <div className="text-xs text-slate-400 mb-1">{msg.userName}</div>
              <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Context tip */}
      <div className="px-4 py-2 bg-orange-50 border-t border-orange-100 text-xs text-orange-600 flex items-center gap-2">
        <span>💡</span>
        <span>Tap symbols on the board to build your message, then press Send.</span>
      </div>
    </div>
  );
}
