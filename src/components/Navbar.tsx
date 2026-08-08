import React from 'react';
import {
  Calendar,
  Database,
  Sparkles,
  Printer,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  School,
} from 'lucide-react';
import type { Conflict } from '../types/timetable';

interface NavbarProps {
  activeTab: 'timetable' | 'data' | 'export';
  setActiveTab: (tab: 'timetable' | 'data' | 'export') => void;
  onOpenGenerator: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  projectName: string;
  schoolName: string;
  conflicts: Conflict[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGenerator,
  onExportJson,
  onImportJson,
  projectName,
  schoolName,
  conflicts,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const errorConflicts = conflicts.filter((c) => c.severity === 'ERROR');

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                ÓrarendKészítő Pro
              </h1>
              <div className="flex items-center text-xs text-slate-400 space-x-2">
                <span>{schoolName}</span>
                <span>•</span>
                <span className="text-slate-300 font-medium">{projectName}</span>
              </div>
            </div>
          </div>

          <nav className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Órarend Mátrix</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'data'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Adatok & Szabályok</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'export'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>Export & PDF</span>
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                errorConflicts.length > 0
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
              title={
                errorConflicts.length > 0
                  ? `${errorConflicts.length} ütközés található az órarendben!`
                  : 'Az órarend teljesen ütközésmentes'
              }
            >
              {errorConflicts.length > 0 ? (
                <>
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorConflicts.length} ütközés</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rendben</span>
                </>
              )}
            </div>

            <button
              onClick={onOpenGenerator}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Auto Generálás</span>
            </button>

            <div className="flex items-center border-l border-slate-700 pl-3 space-x-2">
              <button
                onClick={onExportJson}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Projekt mentése (.json)"
              >
                <Download className="w-4 h-4" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportJson}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                title="Projekt betöltése (.json)"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
