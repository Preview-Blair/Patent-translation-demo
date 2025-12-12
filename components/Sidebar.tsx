import React from 'react';
import { Book, FileText, Settings, UploadCloud, ShieldCheck } from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (view: AppView) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
      currentView === view
        ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`;

  return (
    <div className="w-64 bg-white border-r border-slate-200 h-screen flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-slate-100 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <ShieldCheck className="text-white w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">PatentFlow</h1>
          <p className="text-xs text-slate-500">AI Translation Suite</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <div
          className={navItemClass(AppView.UPLOAD)}
          onClick={() => onChangeView(AppView.UPLOAD)}
        >
          <UploadCloud className="w-5 h-5" />
          <span>New Project</span>
        </div>

        <div
          className={navItemClass(AppView.WORKSPACE)}
          onClick={() => onChangeView(AppView.WORKSPACE)}
        >
          <FileText className="w-5 h-5" />
          <span>Workspace</span>
        </div>

        <div
          className={navItemClass(AppView.GLOSSARY)}
          onClick={() => onChangeView(AppView.GLOSSARY)}
        >
          <Book className="w-5 h-5" />
          <span>Term Dictionary</span>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-400 hover:text-slate-600 cursor-pointer">
          <Settings className="w-5 h-5" />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;