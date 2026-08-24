import React, { useState } from 'react';
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
  Edit3,
  CalendarRange,
} from 'lucide-react';
import type { TimetableProject, Conflict } from '../types/timetable';

interface NavbarProps {
  activeTab: 'timetable' | 'data' | 'export';
  setActiveTab: (tab: 'timetable' | 'data' | 'export') => void;
  onOpenGenerator: () => void;
  onExportJson: () => void;
  onImportJson: (e: React.ChangeEvent<HTMLInputElement>) => void;
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
  conflicts: Conflict[];
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenGenerator,
  onExportJson,
  onImportJson,
  project,
  setProject,
  conflicts,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const errorConflicts = conflicts.filter((c) => c.severity === 'ERROR');

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempSchoolName, setTempSchoolName] = useState(project.schoolName);
  const [tempProjectName, setTempProjectName] = useState(project.name);
  const [tempAcademicYear, setTempAcademicYear] = useState(project.academicYear);
  const [tempSemester, setTempSemester] = useState(project.semester || 'I. Félév');

  const handleOpenSettings = () => {
    setTempSchoolName(project.schoolName);
    setTempProjectName(project.name);
    setTempAcademicYear(project.academicYear);
    setTempSemester(project.semester || 'I. Félév');
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setProject((prev) => ({
      ...prev,
      schoolName: tempSchoolName.trim() || 'Iskola',
      name: tempProjectName.trim() || 'Órarend',
      academicYear: tempAcademicYear.trim() || '2026/2027',
      semester: tempSemester.trim() || 'I. Félév',
    }));
    setIsSettingsModalOpen(false);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white relative shadow-xl">
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & School / Project Info (Clickable to edit!) */}
          <div
            onClick={handleOpenSettings}
            className="flex items-center space-x-3 cursor-pointer group p-1.5 -ml-1.5 rounded-2xl hover:bg-slate-800/80 transition-all shrink-0 max-w-[280px] sm:max-w-md"
            title="Kattints az iskola nevének, tanévének és félévének szerkesztéséhez!"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform shrink-0">
              <School className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-1.5">
                <h1 className="font-black text-sm sm:text-base leading-tight text-white group-hover:text-indigo-300 transition-colors truncate">
                  {project.schoolName}
                </h1>
                <Edit3 className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
              <div className="flex items-center text-xs text-slate-400 space-x-1.5">
                <span className="text-slate-300 font-semibold shrink-0">{project.academicYear}</span>
                <span>•</span>
                <span className="text-indigo-300 font-bold bg-indigo-950/80 px-1.5 py-0.2 rounded border border-indigo-800/50 shrink-0">
                  {project.semester || 'I. Félév'}
                </span>
                <span>•</span>
                <span className="text-slate-400 truncate">
                  {project.name}
                </span>
              </div>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden md:flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 shadow-inner shrink-0 whitespace-nowrap gap-1">
            <button
              onClick={() => setActiveTab('timetable')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'timetable'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />
              <span>Órarend Mátrix</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'data'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Adatok & Szabályok</span>
            </button>

            <button
              onClick={() => setActiveTab('export')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'export'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/40'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Printer className="w-4 h-4 shrink-0" />
              <span>Export & PDF</span>
            </button>
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2.5 shrink-0 whitespace-nowrap">
            {/* Conflict counter */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border whitespace-nowrap shrink-0 ${
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
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{errorConflicts.length} ütközés</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Rendben</span>
                </>
              )}
            </div>

            {/* Auto generate button */}
            <button
              onClick={onOpenGenerator}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Auto Generálás</span>
            </button>

            {/* Save / Load JSON */}
            <div className="flex items-center border-l border-slate-700 pl-2.5 space-x-1.5 shrink-0">
              <button
                onClick={onExportJson}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
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
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Projekt betöltése (.json)"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden pb-3 pt-1 justify-center space-x-2">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              activeTab === 'timetable' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Órarend
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              activeTab === 'data' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Adatok
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
              activeTab === 'export' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
            }`}
          >
            Export
          </button>
        </div>
      </div>

      {/* School & Project Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">
                    Intézmény & Órarend Adatai
                  </h3>
                  <p className="text-xs text-slate-500">Iskola neve, tanév, félév és megnevezés</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Iskola neve:
                </label>
                <input
                  type="text"
                  value={tempSchoolName}
                  onChange={(e) => setTempSchoolName(e.target.value)}
                  placeholder="pl. Kossuth Lajos Általános Iskola"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tanév:
                  </label>
                  <input
                    type="text"
                    value={tempAcademicYear}
                    onChange={(e) => setTempAcademicYear(e.target.value)}
                    placeholder="pl. 2026/2027"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Félév / Időszak:
                  </label>
                  <select
                    value={tempSemester}
                    onChange={(e) => setTempSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <option value="I. Félév">I. Félév</option>
                    <option value="II. Félév">II. Félév</option>
                    <option value="Egész tanév">Egész tanév</option>
                    <option value="Tervezet">Tervezet</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Órarend megnevezése / leírása:
                </label>
                <input
                  type="text"
                  value={tempProjectName}
                  onChange={(e) => setTempProjectName(e.target.value)}
                  placeholder="pl. Fő Órarend, Végleges verzió"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex space-x-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer transition-colors"
                >
                  Mentés
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
