import React, { useState } from 'react';
import { Printer, Download, Upload, Users, GraduationCap } from 'lucide-react';
import type { TimetableProject, DayOfWeek } from '../../types/timetable';
import { DAYS_HUNGARIAN, DEFAULT_PERIODS } from '../../types/timetable';
import { exportElementToPdf, exportProjectToJson, importProjectFromJson } from '../../services/exportService';

interface ExportManagerProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
}

export const ExportManager: React.FC<ExportManagerProps> = ({ project, setProject }) => {
  const [exportTab, setExportTab] = useState<'classes' | 'teachers'>('classes');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('ALL');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDownloadPdf = async (elementId: string, title: string) => {
    try {
      await exportElementToPdf(elementId, `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_oraresz.pdf`);
    } catch (err) {
      alert('Hiba történt a PDF generálása során!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const imported = await importProjectFromJson(file);
        setProject(imported);
        alert('Projekt sikeresen betöltve!');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Hiba a betöltéskor');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2">
            <Printer className="w-7 h-7 text-indigo-600" />
            <span>Órarendek Exportálása & Nyomtatása</span>
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Nyomtass külön-külön órarendet minden osztálynak és tanárnak, vagy töltsd le PDF / JSON formátumban.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Nyomtatás (Print)</span>
          </button>

          <button
            onClick={() => exportProjectToJson(project)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm border border-indigo-200 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Projekt Mentése (.json)</span>
          </button>

          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Projekt Betöltése</span>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex space-x-4">
          <button
            onClick={() => {
              setExportTab('classes');
              setSelectedTargetId('ALL');
            }}
            className={`flex items-center space-x-2 pb-2 font-bold text-sm border-b-2 transition-all ${
              exportTab === 'classes'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Osztályok Órarendjei ({project.classes.length})</span>
          </button>

          <button
            onClick={() => {
              setExportTab('teachers');
              setSelectedTargetId('ALL');
            }}
            className={`flex items-center space-x-2 pb-2 font-bold text-sm border-b-2 transition-all ${
              exportTab === 'teachers'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tanárok Órarendjei ({project.teachers.length})</span>
          </button>
        </div>

        <select
          value={selectedTargetId}
          onChange={(e) => setSelectedTargetId(e.target.value)}
          className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-sm text-slate-800"
        >
          <option value="ALL">Összes nézése (Mind kinyomtatható)</option>
          {exportTab === 'classes'
            ? project.classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} Osztály
                </option>
              ))
            : project.teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.shortCode})
                </option>
              ))}
        </select>
      </div>

      <div className="space-y-8 print:space-y-12">
        {exportTab === 'classes' &&
          project.classes
            .filter((c) => selectedTargetId === 'ALL' || c.id === selectedTargetId)
            .map((cls) => {
              const elementId = `print-class-${cls.id}`;
              return (
                <div key={cls.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4 print:shadow-none print:border-none print:p-0 print:break-after-page">
                  <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cls.color }}></div>
                      <h3 className="text-xl font-bold text-slate-900">{cls.name} Osztály Órarendje</h3>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(elementId, `orarend_${cls.name}`)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Letöltés</span>
                    </button>
                  </div>

                  <div id={elementId} className="bg-white p-6 rounded-xl border border-slate-200 font-sans">
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{project.schoolName}</h2>
                        <p className="text-sm font-semibold text-slate-600">
                          {project.academicYear} Tanév • {cls.name} OSZTÁLY ÓRARENDJE
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm rounded-lg">
                          {cls.name}
                        </span>
                      </div>
                    </div>

                    <table className="w-full border-collapse border-2 border-slate-900 text-center">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-xs uppercase">
                          <th className="p-2 border-2 border-slate-900 w-24">Óra / Idő</th>
                          {DAYS_HUNGARIAN.map((dayName, idx) => (
                            <th key={idx} className="p-2 border-2 border-slate-900">
                              {dayName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DEFAULT_PERIODS.map((periodConfig) => (
                          <tr key={periodConfig.period} className="border-b border-slate-300">
                            <td className="p-2 border-2 border-slate-900 bg-slate-100 font-bold text-xs">
                              <div>{periodConfig.period}. óra</div>
                              <div className="text-[10px] text-slate-500">{periodConfig.startTime}-{periodConfig.endTime}</div>
                            </td>

                            {DAYS_HUNGARIAN.map((_, dayIdx) => {
                              const day = dayIdx as DayOfWeek;
                              const slot = project.slots.find(
                                (s) => s.classId === cls.id && s.day === day && s.period === periodConfig.period
                              );
                              const subj = slot ? project.subjects.find((s) => s.id === slot.subjectId) : null;
                              const teacher = slot ? project.teachers.find((t) => t.id === slot.teacherId) : null;
                              const room = slot ? project.rooms.find((r) => r.id === slot.roomId) : null;

                              return (
                                <td key={dayIdx} className="p-2 border-2 border-slate-900 h-16 min-w-[100px] align-middle">
                                  {slot ? (
                                    <div className="flex flex-col justify-center items-center h-full">
                                      <div className="font-black text-sm text-slate-900">{subj?.name}</div>
                                      <div className="text-xs text-slate-600 font-semibold mt-0.5">
                                        {teacher?.name} ({teacher?.shortCode})
                                      </div>
                                      {room && <div className="text-[10px] text-slate-400 font-mono">{room.name}</div>}
                                    </div>
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

        {exportTab === 'teachers' &&
          project.teachers
            .filter((t) => selectedTargetId === 'ALL' || t.id === selectedTargetId)
            .map((teacher) => {
              const elementId = `print-teacher-${teacher.id}`;
              return (
                <div key={teacher.id} className="bg-white rounded-2xl border border-slate-200 shadow-lg p-6 space-y-4 print:shadow-none print:border-none print:p-0 print:break-after-page">
                  <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: teacher.color }}></div>
                      <h3 className="text-xl font-bold text-slate-900">{teacher.name} Órarendje</h3>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(elementId, `tanar_${teacher.shortCode}`)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Letöltés</span>
                    </button>
                  </div>

                  <div id={elementId} className="bg-white p-6 rounded-xl border border-slate-200 font-sans">
                    <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">{project.schoolName}</h2>
                        <p className="text-sm font-semibold text-slate-600">
                          {project.academicYear} Tanév • OKTATÓI ÓRAREND
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 bg-slate-900 text-white font-bold text-sm rounded-lg">
                          {teacher.name} ({teacher.shortCode})
                        </span>
                      </div>
                    </div>

                    <table className="w-full border-collapse border-2 border-slate-900 text-center">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-xs uppercase">
                          <th className="p-2 border-2 border-slate-900 w-24">Óra / Idő</th>
                          {DAYS_HUNGARIAN.map((dayName, idx) => (
                            <th key={idx} className="p-2 border-2 border-slate-900">
                              {dayName}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {DEFAULT_PERIODS.map((periodConfig) => (
                          <tr key={periodConfig.period} className="border-b border-slate-300">
                            <td className="p-2 border-2 border-slate-900 bg-slate-100 font-bold text-xs">
                              <div>{periodConfig.period}. óra</div>
                              <div className="text-[10px] text-slate-500">{periodConfig.startTime}-{periodConfig.endTime}</div>
                            </td>

                            {DAYS_HUNGARIAN.map((_, dayIdx) => {
                              const day = dayIdx as DayOfWeek;
                              const slotsForTeacher = project.slots.filter(
                                (s) => s.teacherId === teacher.id && s.day === day && s.period === periodConfig.period
                              );

                              return (
                                <td key={dayIdx} className="p-2 border-2 border-slate-900 h-16 min-w-[100px] align-middle">
                                  {slotsForTeacher.length > 0 ? (
                                    slotsForTeacher.map((slot) => {
                                      const cls = project.classes.find((c) => c.id === slot.classId);
                                      const subj = project.subjects.find((s) => s.id === slot.subjectId);
                                      return (
                                        <div key={slot.id} className="flex flex-col justify-center items-center h-full">
                                          <div className="font-black text-sm text-slate-900">{cls?.name} Osztály</div>
                                          <div className="text-xs text-indigo-700 font-bold mt-0.5">{subj?.name}</div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <span className="text-slate-300">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
