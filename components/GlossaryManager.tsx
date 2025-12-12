import React, { useState } from 'react';
import { GlossaryTerm } from '../types';
import { Plus, Search, Trash2 } from 'lucide-react';

interface GlossaryManagerProps {
  terms: GlossaryTerm[];
  onAddTerm: (term: GlossaryTerm) => void;
  onRemoveTerm: (id: string) => void;
}

const GlossaryManager: React.FC<GlossaryManagerProps> = ({ terms, onAddTerm, onRemoveTerm }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newSource, setNewSource] = useState('');
  const [newTarget, setNewTarget] = useState('');

  const filteredTerms = terms.filter(
    (t) =>
      t.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    if (!newSource || !newTarget) return;
    onAddTerm({
      id: Date.now().toString(),
      source: newSource,
      target: newTarget,
      addedAt: new Date().toISOString(),
      category: 'technical',
    });
    setNewSource('');
    setNewTarget('');
    setIsAdding(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Term Dictionary</h2>
          <p className="text-slate-500">Manage approved translations for technical consistency.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Term
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm mb-6 animate-in fade-in slide-in-from-top-4">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">New Dictionary Entry</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Source Term</label>
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. embodiment"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Approved Translation</label>
              <input
                type="text"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Ausführungsform"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setIsAdding(false)}
              className="px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Term
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search glossary..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-600 placeholder:text-slate-400"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Target</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Added</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTerms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No terms found. Add some terms to guide the AI.
                  </td>
                </tr>
              ) : (
                filteredTerms.map((term) => (
                  <tr key={term.id} className="hover:bg-slate-50 group transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">{term.source}</td>
                    <td className="px-6 py-4 text-slate-700">{term.target}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {term.category || 'General'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 text-xs">
                      {new Date(term.addedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onRemoveTerm(term.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlossaryManager;