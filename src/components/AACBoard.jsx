import { useState } from 'react';

const DEFAULT_SYMBOLS = [
  { id: 1, icon: '👋', word: 'Hello' },
  { id: 2, icon: '😊', word: 'Please' },
  { id: 3, icon: '🙏', word: 'Thank you' },
  { id: 4, icon: '🍜', word: 'Noodles' },
  { id: 5, icon: '🍚', word: 'Rice' },
  { id: 6, icon: '🍗', word: 'Chicken' },
  { id: 7, icon: '💵', word: 'How much?' },
  { id: 8, icon: '1️⃣', word: 'One' },
  { id: 9, icon: '2️⃣', word: 'Two' },
  { id: 10, icon: '✅', word: 'Yes' },
  { id: 11, icon: '❌', word: 'No' },
  { id: 12, icon: '🛑', word: 'Stop' },
  { id: 13, icon: '🌶️', word: 'No spicy' },
  { id: 14, icon: '🥤', word: 'Drink' },
  { id: 15, icon: '🆘', word: 'Help' },
  { id: 16, icon: '🔁', word: 'Repeat' },
  { id: 17, icon: '⏰', word: 'Wait' },
  { id: 18, icon: '🧾', word: 'Bill' },
];

/**
 * AACBoard — Tap-to-compose symbol communication board
 * 
 * Props:
 *   symbols     - array of { id, icon, word } (defaults to DEFAULT_SYMBOLS)
 *   onSend      - callback(message: string, symbols: string[]) when user sends
 *   columns     - grid columns (default 3)
 *   scanMode    - enable switch-access scanning (default false)
 *   scanDelay   - ms between scan highlights (default 1500)
 */
export default function AACBoard({
  symbols = DEFAULT_SYMBOLS,
  onSend,
  columns = 3,
  scanMode = false,
  scanDelay = 1500,
}) {
  const [composed, setComposed] = useState([]);
  const [scanIndex, setScanIndex] = useState(null);

  const addWord = (word) => setComposed(prev => [...prev, word]);
  const removeWord = (index) => setComposed(prev => prev.filter((_, i) => i !== index));
  const clear = () => setComposed([]);

  const send = () => {
    if (composed.length === 0) return;
    const message = composed.join(' · ');
    onSend?.(message, composed);
    clear();
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-2">
        <h4 className="text-white font-bold text-sm">AAC Board</h4>
        <p className="text-slate-400 text-xs">Tap to build your message</p>
      </div>

      {/* Compose area */}
      <div className="min-h-12 p-2 bg-blue-50 border-b border-slate-200 flex flex-wrap gap-1 items-center">
        {composed.length === 0 ? (
          <span className="text-slate-400 text-sm">Your message appears here...</span>
        ) : (
          composed.map((word, i) => (
            <button
              key={i}
              onClick={() => removeWord(i)}
              className="bg-teal-600 text-white px-2 py-1 rounded-xl text-xs font-semibold hover:bg-red-500 transition-colors"
              aria-label={`Remove ${word}`}
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Symbol grid */}
      <div
        className="flex-1 p-2 overflow-y-auto"
        style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: '0.4rem' }}
        role="grid"
        aria-label="AAC symbol board"
      >
        {symbols.map((sym, i) => (
          <button
            key={sym.id}
            onClick={() => addWord(sym.word)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-xl border-2 text-center
              transition-all duration-150 hover:bg-teal-500 hover:border-teal-500 hover:text-white
              focus:outline-none focus:ring-2 focus:ring-teal-400
              ${scanIndex === i ? 'bg-yellow-300 border-yellow-500' : 'bg-slate-50 border-slate-200'}
            `}
            aria-label={sym.word}
            role="gridcell"
          >
            <span className="text-2xl mb-1" aria-hidden="true">{sym.icon}</span>
            <span className="text-xs font-semibold leading-tight">{sym.word}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-slate-200 flex gap-2">
        <button
          onClick={clear}
          className="px-3 py-2 bg-red-100 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-200 transition-colors"
          aria-label="Clear message"
        >
          ✕ Clear
        </button>
        <button
          onClick={send}
          disabled={composed.length === 0}
          className="flex-1 py-2 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          Send ↑
        </button>
      </div>
    </div>
  );
}
