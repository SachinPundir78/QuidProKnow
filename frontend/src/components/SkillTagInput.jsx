import { useState } from 'react';

/** Reusable controlled skill-tag form field. */
export default function SkillTagInput({ label, skills, onAdd, onRemove, type, placeholder }) {
  const [input, setInput] = useState('');
  const isOffer = type === 'OFFER';

  const handleKey = (event) => {
    if ((event.key === 'Enter' || event.key === ',') && input.trim()) {
      event.preventDefault();
      onAdd(input.trim(), type);
      setInput('');
    }
  };

  return (
    <div className="mb-5 last:mb-0 font-display">
      {label && <label className={`mb-2 flex items-center gap-2 text-md font-bold font-sach ${isOffer ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}><span className={`h-2 w-2 rounded-full ${isOffer ? 'bg-emerald-500' : 'bg-red-700'}`} />{label}</label>}
      <div className={`flex min-h-[46px] flex-wrap gap-1.5 rounded-xl border p-2.5 ${isOffer ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/25 dark:bg-emerald-500/5' : 'border-red-200 bg-red-50/40 dark:border-red-500/25 dark:bg-red-500/5'}`}>
        {skills.map((skill, index) => (
          <span key={`${skill}-${index}`} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.82rem] font-medium ${isOffer ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-100 dark:text-emerald-700 border-green-800' : 'bg-red-100 text-red-800 dark:bg-red-100 dark:text-red-700'}`}>
            {skill}
            <button type="button" onClick={() => onRemove(index, type)} className="p-0 text-base leading-none opacity-70 transition hover:opacity-100" aria-label={`Remove ${skill}`}>×</button>
          </span>
        ))}
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          onKeyDown={handleKey}
          placeholder={skills.length === 0 ? (placeholder || 'Type and press Enter…') : ''}
          className="min-w-[100px] flex-1 border-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 dark:text-zinc-100 dark:placeholder:text-zinc-600"
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-zinc-500">Press Enter after each skill to add it.</p>
    </div>
  );
}
