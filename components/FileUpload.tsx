import React, { useCallback } from 'react';
import { FileUp, Loader2 } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (e.dataTransfer.files[0].type === 'application/pdf') {
            onFileSelect(e.dataTransfer.files[0]);
        } else {
            alert("Please upload a PDF file.");
        }
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="h-full flex items-center justify-center p-8 bg-slate-50">
      <div 
        className="max-w-xl w-full"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Upload Patent Application</h2>
            <p className="text-slate-500">
                Upload a PDF to begin the AI-assisted translation process. 
                Our engine will detect technical terms and cross-reference with your dictionary.
            </p>
        </div>

        <label 
            className={`
                flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-2xl cursor-pointer 
                transition-all duration-300
                ${isProcessing 
                    ? 'border-blue-300 bg-blue-50/50 cursor-wait' 
                    : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-blue-500 hover:shadow-lg'
                }
            `}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isProcessing ? (
                <>
                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-medium text-slate-700">Processing Document...</p>
                    <p className="text-sm text-slate-500 mt-2">Analyzing technical terminology & generating RAG context</p>
                </>
            ) : (
                <>
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 text-blue-600">
                        <FileUp className="w-8 h-8" />
                    </div>
                    <p className="mb-2 text-lg text-slate-700 font-medium">
                        <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-sm text-slate-500">PDF files only (max 10MB)</p>
                </>
            )}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={handleChange}
            disabled={isProcessing}
          />
        </label>
        
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-slate-800 mb-1">98%</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Avg. Accuracy</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-slate-800 mb-1">~1M</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Context Window</div>
            </div>
             <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                <div className="text-2xl font-bold text-slate-800 mb-1">RAG</div>
                <div className="text-xs text-slate-500 uppercase tracking-wide">Enabled</div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;