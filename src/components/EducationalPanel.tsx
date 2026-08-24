import { useState } from 'react';
import { InlineMath, BlockMath } from './Math';
import { BookOpen, AlertCircle, HelpCircle, Variable } from 'lucide-react';

export interface VariableItem {
  symbol: string;
  name: string;
  unit: string;
}

export interface EquationItem {
  latex: string;
  description: string;
}

export interface ChallengeItem {
  question: string;
  options?: string[];
  correctAnswer?: string;
  solution: string;
}

interface EducationalPanelProps {
  conceptText: string | React.ReactNode;
  equations: EquationItem[];
  variables: VariableItem[];
  observations: string[];
  challenges: ChallengeItem[];
}

export function EducationalPanel({
  conceptText,
  equations,
  variables,
  observations,
  challenges,
}: EducationalPanelProps) {
  const [activeTab, setActiveTab] = useState<'concept' | 'equations' | 'challenges'>('concept');
  const [revealedSolutions, setRevealedSolutions] = useState<Record<number, boolean>>({});

  const toggleSolution = (index: number) => {
    setRevealedSolutions((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden text-sm">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 bg-slate-50">
        <button
          onClick={() => setActiveTab('concept')}
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'concept'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Concept
        </button>
        <button
          onClick={() => setActiveTab('equations')}
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'equations'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Variable className="w-4 h-4" />
          Theory & Equations
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`flex items-center gap-2 px-4 py-3 font-medium border-b-2 text-xs uppercase tracking-wider transition-colors cursor-pointer ${
            activeTab === 'challenges'
              ? 'border-blue-600 text-blue-600 bg-white'
              : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          A/L Challenges
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
        {activeTab === 'concept' && (
          <div className="space-y-4">
            <div className="prose prose-slate max-w-none leading-relaxed text-slate-700">
              {conceptText}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="flex items-center gap-1.5 font-semibold text-slate-900 mb-2 text-xs uppercase tracking-wider">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Laboratory Observations
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                {observations.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'equations' && (
          <div className="space-y-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2 text-xs uppercase tracking-wider">Core Equations</h4>
              <div className="space-y-4 bg-slate-50 p-4 rounded-md border border-slate-100">
                {equations.map((eq, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-2 bg-white border border-slate-200 rounded">
                    <BlockMath math={eq.latex} />
                    <span className="text-xs text-slate-500 mt-1 text-center">{eq.description}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2 text-xs uppercase tracking-wider">Variables & SI Units</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-xs">
                      <th className="py-2 font-medium">Symbol</th>
                      <th className="py-2 font-medium">Quantity</th>
                      <th className="py-2 font-medium">SI Unit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {variables.map((v, idx) => (
                      <tr key={idx}>
                        <td className="py-2 font-mono font-semibold text-blue-600">
                          <InlineMath math={v.symbol} />
                        </td>
                        <td className="py-2">{v.name}</td>
                        <td className="py-2 text-slate-500 font-mono text-xs">{v.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-5">
            {challenges.map((c, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
                <div className="font-medium text-slate-900 flex gap-2">
                  <span className="text-blue-600 font-semibold font-mono">Q{idx + 1}.</span>
                  <div className="text-slate-800 leading-relaxed whitespace-pre-wrap">{c.question}</div>
                </div>

                {c.options && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                    {c.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-start gap-2 bg-white border border-slate-200 p-2 rounded text-slate-700 text-xs">
                        <span className="font-semibold font-mono text-slate-400">({oIdx + 1})</span>
                        <span>{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-col gap-2 pl-6">
                  <button
                    onClick={() => toggleSolution(idx)}
                    className="self-start text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {revealedSolutions[idx] ? 'Hide Answer & Solution' : 'Reveal Answer & Solution'}
                  </button>

                  {revealedSolutions[idx] && (
                    <div className="mt-2 p-3 bg-white border border-slate-200 rounded text-slate-700 text-xs space-y-2 leading-relaxed">
                      {c.correctAnswer && (
                        <div>
                          <strong className="text-emerald-700">Correct Answer:</strong>{' '}
                          <span className="font-medium text-slate-800">{c.correctAnswer}</span>
                        </div>
                      )}
                      <div>
                        <strong className="text-slate-900 block mb-1">Step-by-step Solution:</strong>
                        <div className="whitespace-pre-wrap">{c.solution}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
