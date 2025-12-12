import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import FileUpload from './components/FileUpload';
import TranslationWorkspace from './components/TranslationWorkspace';
import GlossaryManager from './components/GlossaryManager';
import { AppView, GlossaryTerm, TranslationSegment } from './types';
import { translateDocument } from './services/geminiService';

const INITIAL_GLOSSARY: GlossaryTerm[] = [
  { id: '1', source: 'embodiment', target: 'Ausführungsform', addedAt: new Date().toISOString(), category: 'technical' },
  { id: '2', source: 'plurality', target: 'Mehrzahl', addedAt: new Date().toISOString(), category: 'legal' },
  { id: '3', source: 'substantially', target: 'im Wesentlichen', addedAt: new Date().toISOString(), category: 'legal' }
];

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.UPLOAD);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentDocName, setCurrentDocName] = useState<string>('');
  const [segments, setSegments] = useState<TranslationSegment[]>([]);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>(INITIAL_GLOSSARY);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setCurrentDocName(file.name);
    
    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = (reader.result as string).split(',')[1];
      try {
        const translatedSegments = await translateDocument(
          base64String,
          file.type,
          glossary,
          'German' // Hardcoded target for demo
        );
        setSegments(translatedSegments);
        setCurrentView(AppView.WORKSPACE);
      } catch (error) {
        alert("Failed to process document. Please try again. Ensure your API_KEY is set in the environment.");
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddGlossaryTerm = (term: GlossaryTerm) => {
    setGlossary(prev => [...prev, term]);
  };
  
  const handleQuickAddGlossary = (source: string, target: string) => {
      const newTerm: GlossaryTerm = {
          id: Date.now().toString(),
          source,
          target,
          addedAt: new Date().toISOString(),
          category: 'technical'
      };
      setGlossary(prev => [...prev, newTerm]);
  };

  const handleRemoveGlossaryTerm = (id: string) => {
    setGlossary(prev => prev.filter(t => t.id !== id));
  };

  const handleUpdateSegment = (id: string, newText: string) => {
    setSegments(prev => prev.map(seg => 
      seg.id === id ? { ...seg, translatedText: newText, uncertaintyScore: 0, flaggedTerms: [] } : seg
    ));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="flex-1 overflow-hidden relative">
        {currentView === AppView.UPLOAD && (
          <FileUpload onFileSelect={handleFileSelect} isProcessing={isProcessing} />
        )}

        {currentView === AppView.WORKSPACE && (
          <TranslationWorkspace 
            documentName={currentDocName || "Untitled Patent"}
            segments={segments}
            onUpdateSegment={handleUpdateSegment}
            onAddToGlossary={handleQuickAddGlossary}
          />
        )}

        {currentView === AppView.GLOSSARY && (
          <GlossaryManager 
            terms={glossary} 
            onAddTerm={handleAddGlossaryTerm} 
            onRemoveTerm={handleRemoveGlossaryTerm} 
          />
        )}
      </main>
    </div>
  );
};

export default App;