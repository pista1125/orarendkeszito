import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TimetableEditor } from './components/timetable/TimetableEditor';
import { DataManagement } from './components/data/DataManagement';
import { ExportManager } from './components/export/ExportManager';
import { AutoGeneratorModal } from './components/generator/AutoGeneratorModal';
import { INITIAL_MOCK_PROJECT } from './services/mockData';
import type { TimetableProject, Conflict } from './types/timetable';
import { detectConflicts } from './services/conflictChecker';
import { exportProjectToJson, importProjectFromJson } from './services/exportService';

export function App() {
  const [project, setProject] = useState<TimetableProject>(INITIAL_MOCK_PROJECT);
  const [activeTab, setActiveTab] = useState<'timetable' | 'data' | 'export'>('timetable');
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);

  const conflicts: Conflict[] = useMemo(() => {
    return detectConflicts(
      project.slots,
      project.teachers,
      project.classes,
      project.subjects,
      project.constraints
    );
  }, [project.slots, project.teachers, project.classes, project.subjects, project.constraints]);

  const handleExportJson = () => {
    exportProjectToJson(project);
  };

  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importProjectFromJson(file);
        setProject(imported);
        alert('Projekt sikeresen betöltve!');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Hiba a projekt fájl beolvasásakor');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        projectName={project.name}
        schoolName={project.schoolName}
        conflicts={conflicts}
      />

      <main className="flex-grow">
        {activeTab === 'timetable' && (
          <TimetableEditor
            project={project}
            setProject={setProject}
            conflicts={conflicts}
            onOpenGenerator={() => setIsGeneratorOpen(true)}
          />
        )}

        {activeTab === 'data' && <DataManagement project={project} setProject={setProject} />}

        {activeTab === 'export' && <ExportManager project={project} setProject={setProject} />}
      </main>

      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-4 px-6 text-center print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span className="font-bold text-slate-200">{project.schoolName}</span> • Órarendkészítő Rendszer
          </div>
          <div>Évfolyamok: {project.classes.map((c) => c.name).join(', ')}</div>
        </div>
      </footer>

      <AutoGeneratorModal
        project={project}
        setProject={setProject}
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
      />
    </div>
  );
}

export default App;
