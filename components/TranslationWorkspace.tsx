import React, { useState, useMemo } from 'react';
import { TranslationSegment, GlossaryTerm } from '../types';
import { AlertCircle, Check, CheckCircle2, ChevronRight, Download, Edit2, Sparkles, ArrowUpDown, List } from 'lucide-react';

interface TranslationWorkspaceProps {
  documentName: string;
  segments: TranslationSegment[];
  onUpdateSegment: (segmentId: string, newText: string) => void;
  onAddToGlossary: (term: string, translation: string) => void;
}

const TranslationWorkspace: React.FC<TranslationWorkspaceProps> = ({
  documentName,
  segments,
  onUpdateSegment,
  onAddToGlossary,
}) => {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isReviewMode, setIsReviewMode] = useState(false);
  
  // Stats
  const uncertainCount = segments.filter(s => s.uncertaintyScore > 0.3 || s.flaggedTerms.length > 0).length;
  const progress = segments.length > 0 ? Math.round(((segments.length - uncertainCount) / segments.length) * 100) : 0;

  // Sorting Logic
  const displaySegments = useMemo(() => {
    if (!isReviewMode) return segments;
    
    return [...segments].sort((a, b) => {
        // Calculate a risk score based on uncertainty and flagged terms
        const scoreA = a.uncertaintyScore + (a.flaggedTerms.length * 0.5);
        const scoreB = b.uncertaintyScore + (b.flaggedTerms.length * 0.5);
        return scoreB - scoreA; // Descending order
    });
  }, [segments, isReviewMode]);

  const handleEditClick = (segment: TranslationSegment) => {
    setEditingId(segment.id);
    setEditText(segment.translatedText);
    setActiveSegmentId(segment.id);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateSegment(id, editText);
    setEditingId(null);
  };

  const handleExport = () => {
    // Always export in original order, not sorted order
    const text = segments.map(s => s.translatedText).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translated_${documentName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      {/* Workspace Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            {documentName}
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              English → German
            </span>
          </h2>
          <div className="flex items-center gap-4 mt-1">
             <div className="text-xs text-slate-500">
               <span className="font-semibold text-slate-700">{segments.length}</span> Segments
             </div>
             <div className="text-xs text-slate-500">
               <span className="font-semibold text-amber-600">{uncertainCount}</span> Uncertain
             </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200">
                <button
                    onClick={() => setIsReviewMode(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${!isReviewMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <List className="w-3.5 h-3.5" />
                    Original Order
                </button>
                <button
                    onClick={() => setIsReviewMode(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${isReviewMode ? 'bg-white text-amber-700 shadow-sm ring-1 ring-amber-100' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                    Prioritize Review
                </button>
            </div>

            <div className="h-6 w-px bg-slate-200"></div>

            <div className="flex flex-col items-end">
                <span className="text-xs font-medium text-slate-500 mb-1">Confidence Score</span>
                <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${progress > 80 ? 'bg-green-500' : 'bg-amber-500'}`} 
                        style={{ width: `${progress}%`}}
                    />
                </div>
            </div>
            
            <button 
                onClick={handleExport}
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                Export
            </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {displaySegments.map((segment) => {
            const hasIssues = segment.uncertaintyScore > 0.4 || segment.flaggedTerms.length > 0;
            const isActive = activeSegmentId === segment.id;
            const isEditing = editingId === segment.id;

            return (
              <div 
                key={segment.id}
                id={segment.id}
                onClick={() => !isEditing && setActiveSegmentId(segment.id)}
                className={`
                  group grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border transition-all duration-200 cursor-default
                  ${isActive ? 'ring-2 ring-blue-500 shadow-md bg-white border-transparent' : 'bg-white border-slate-200 hover:border-blue-300'}
                `}
              >
                {/* Source Text */}
                <div className="font-serif text-slate-600 leading-relaxed text-lg border-r border-slate-100 pr-6 whitespace-pre-wrap">
                  {segment.sourceText}
                </div>

                {/* Target Text */}
                <div className="relative">
                  {/* Status Indicator */}
                  {hasIssues && !isEditing && (
                    <div className="absolute -top-3 right-0 bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-full border border-amber-200 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      Review Needed
                    </div>
                  )}

                  {isEditing ? (
                    <div className="h-full flex flex-col gap-3">
                        <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full h-full min-h-[120px] p-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-lg leading-relaxed text-slate-900 font-sans"
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                             <button 
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleSaveEdit(segment.id)}
                                className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Confirm
                            </button>
                        </div>
                    </div>
                  ) : (
                    <div className="group/target relative h-full">
                         <div className="text-slate-800 text-lg leading-relaxed font-sans whitespace-pre-wrap">
                            {segment.translatedText}
                        </div>
                        
                        {/* Flagged Terms Analysis */}
                        {segment.flaggedTerms.length > 0 && isActive && (
                            <div className="mt-4 bg-amber-50/50 rounded-lg border border-amber-100 p-3 space-y-2 animate-in fade-in slide-in-from-top-2">
                                <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Sparkles className="w-3 h-3" /> AI Analysis
                                </h4>
                                {segment.flaggedTerms.map((flag, idx) => (
                                    <div key={idx} className="text-sm bg-white p-2 rounded border border-amber-100 shadow-sm flex items-start gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-900 bg-slate-100 px-1.5 rounded">{flag.term}</span>
                                                <ChevronRight className="w-3 h-3 text-slate-400" />
                                                <span className="font-medium text-blue-700">{flag.suggestion}</span>
                                            </div>
                                            <p className="text-slate-500 text-xs mt-1">{flag.reason}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAddToGlossary(flag.term, flag.suggestion);
                                            }}
                                            className="text-xs bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-2 py-1 rounded border border-slate-200 transition-colors whitespace-nowrap"
                                        >
                                            Add to Dictionary
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEditClick(segment);
                            }}
                            className="absolute top-0 right-0 opacity-0 group-hover/target:opacity-100 p-1.5 bg-white border border-slate-200 rounded shadow-sm hover:text-blue-600 text-slate-400 transition-all"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {segments.length === 0 && (
             <div className="text-center py-20 text-slate-400">
                No segments to display.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationWorkspace;