import React from 'react';
import { ClipboardList } from 'lucide-react';
import { ENABLE_OBSERVATION_NOTEBOOKS } from '../../config/features';

interface ObservationNotebookProps {
  title?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ObservationNotebook: React.FC<ObservationNotebookProps> = ({
  title = 'Observation Notebook',
  value,
  onChange,
  placeholder = 'Type your laboratory observations, findings, and notes here...',
}) => {
  if (!ENABLE_OBSERVATION_NOTEBOOKS) {
    return null;
  }

  return (
    <>
      <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
        <ClipboardList className="w-4 h-4 text-blue-600" />
        {title}
      </h3>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full flex-1 min-h-[120px] border border-slate-200 rounded p-2 text-xs outline-none focus:border-blue-500 resize-none font-sans"
      />
    </>
  );
};
