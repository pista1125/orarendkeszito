import React, { useState } from 'react';
import {
  Printer,
  Download,
  Upload,
  Users,
  GraduationCap,
  Grid,
} from 'lucide-react';
import type { TimetableProject, DayOfWeek } from '../../types/timetable';
import { DAYS_HUNGARIAN, DEFAULT_PERIODS } from '../../types/timetable';
import {
  exportElementToPdf,
  exportProjectToJson,
  importProjectFromJson,
} from '../../services/exportService';

interface ExportManagerProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
}

export const ExportManager: React.FC<ExportManagerProps> = ({ project, setProject }) => {
  const [exportTab, setExportTab] = useState<'master' | 'classes' | 'teachers'>('master');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('ALL');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const periods = project.periods && project.periods.length > 0
    ? project.periods
    : DEFAULT_PERIODS;

  const handleDownloadPdf = async (elementId: string, title: string) => {
    try {
      await exportElementToPdf(
        elementId,
        `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_orarend.pdf`
      );
    } catch {
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
            Nyomtasd ki a teljes Nagy Fali Mátrixot, vagy külön-külön minden osztály és tanár órarendjét PDF / Print formátumban.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Nyomtatás (Print)</span>
          </button>

          <button
            onClick={() => exportProjectToJson(project)}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-sm border border-indigo-200 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Projekt Mentése (.json)</span>
          </button>

          <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-all cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Projekt Betöltése</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setExportTab('master');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              exportTab === 'master'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>🌟 Teljes Mester Mátrix</span>
          </button>

          <button
            onClick={() => {
              setExportTab('classes');
              setSelectedTargetId('ALL');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              exportTab === 'classes'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Osztályok ({project.classes.length})</span>
          </button>

          <button
            onClick={() => {
              setExportTab('teachers');
              setSelectedTargetId('ALL');
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer ${
              exportTab === 'teachers'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tanárok ({project.teachers.length})</span>
          </button>
        </div>

        {exportTab !== 'master' && (
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="ALL">Összes mutatása (Mind kinyomtatható)</option>
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
        )}
      </div>

      <div className="space-y-8 print:space-y-12">
        {/* 1. MASTER BOARD EXPORT */}
        {exportTab === 'master' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 space-y-4 print:shadow-none print:border-none print:p-0">
            <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Teljes Mester Órarend Mátrix (Fali Tábla)
                </h3>
                <p className="text-xs text-slate-500">
                  Az összes osztály és nap egybefüggő nyomtatható nézete.
                </p>
              </div>
              <button
                onClick={() => handleDownloadPdf('print-master-board', 'mester_orarend')}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Mester PDF Letöltés</span>
              </button>
            </div>

            <div id="print-master-board" className="bg-white p-6 rounded-2xl border border-slate-300 font-sans overflow-x-auto">
              <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {project.schoolName}
                  </h2>
                  <p className="text-sm font-bold text-slate-600">
                    {project.academicYear} Tanév • ÖSSZESÍTETT FŐ ÓRAREND MÁTRIX
                  </p>
                </div>
                <div className="text-right text-xs font-bold text-slate-500">
                  Generálva: {new Date().toLocaleDateString('hu-HU')}
                </div>
              </div>

              <table className="w-full border-collapse border-2 border-slate-900 text-center text-xs">
                <thead>
                  <tr className="bg-slate-900 text-white font-black uppercase">
                    <th colSpan={2} className="p-2 border-2 border-slate-900 w-28">
                      Nap / Óra
                    </th>
                    {project.classes.map((cls) => (
                      <th key={cls.id} className="p-2 border-2 border-slate-900 text-center">
                        <div className="text-sm font-black">{cls.name}</div>
                        <div className="text-[10px] text-slate-300 font-normal">{cls.grade}.o</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS_HUNGARIAN.map((dayName, dayIdx) => {
                    const day = dayIdx as DayOfWeek;
                    return (
                      <React.Fragment key={dayIdx}>
                        {periods.map((periodConfig, pIdx) => {
                          const period = periodConfig.period;
                          const isFirst = pIdx === 0;

                          return (
                            <tr key={`${day}-${period}`} className="border-b border-slate-300">
                              {isFirst && (
                                <td
                                  rowSpan={periods.length}
                                  className="p-2 border-2 border-slate-900 bg-slate-200 font-black text-sm uppercase align-middle w-20"
                                >
                                  {dayName}
                                </td>
                              )}

                              <td className="p-1 border-2 border-slate-900 bg-slate-100 font-bold text-xs w-10">
                                {period}.
                              </td>

                              {project.classes.map((cls) => {
                                const slots = project.slots.filter(
                                  (s) => s.classId === cls.id && s.day === day && s.period === period
                                );

                                return (
                                  <td
                                    key={cls.id}
                                    className="p-1.5 border-2 border-slate-900 min-w-[90px] h-12 align-middle"
                                  >
                                    {slots.length > 0 ? (
                                      <div className="space-y-1">
                                        {slots.map((slot) => {
                                          const subj = project.subjects.find(
                                            (s) => s.id === slot.subjectId
                                          );
                                          const teacher = project.teachers.find(
                                            (t) => t.id === slot.teacherId
                                          );
                                          const room = project.rooms.find(
                                            (r) => r.id === slot.roomId
                                          );

                                          return (
                                            <div
                                              key={slot.id}
                                              className="p-1 rounded bg-slate-50 border border-slate-200 font-bold"
                                            >
                                              <div className="text-slate-900 text-xs truncate">
                                                {subj?.shortCode || subj?.name}
                                              </div>
                                              <div className="text-[10px] text-indigo-700 flex justify-between px-0.5">
                                                <span>{teacher?.shortCode}</span>
                                                {room && (
                                                  <span className="text-slate-400">
                                                    {room.shortCode}
                                                  </span>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <span className="text-slate-300">-</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 2. CLASS TIMETABLES EXPORT */}
        {exportTab === 'classes' &&
          project.classes
            .filter((c) => selectedTargetId === 'ALL' || c.id === selectedTargetId)
            .map((cls) => {
              const elementId = `print-class-${cls.id}`;
              return (
                <div
                  key={cls.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4 print:shadow-none print:border-none print:p-0 print:break-after-page"
                >
                  <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cls.color }}></div>
                      <h3 className="text-xl font-bold text-slate-900">{cls.name} Osztály Órarendje</h3>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(elementId, `orarend_${cls.name}`)}
                      className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Letöltés</span>
                    </button>
                  </div>

                  <div id={elementId} className="bg-white p-6 rounded-2xl border border-slate-200 font-sans">
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
                        {periods.map((periodConfig) => (
                          <tr key={periodConfig.period} className="border-b border-slate-300">
                            <td className="p-2 border-2 border-slate-900 bg-slate-100 font-bold text-xs">
                              <div>{periodConfig.period}. óra</div>
                              <div className="text-[10px] text-slate-500">
                                {periodConfig.startTime}-{periodConfig.endTime}
                              </div>
                            </td>

                            {DAYS_HUNGARIAN.map((_, dayIdx) => {
                              const day = dayIdx as DayOfWeek;
                              const slots = project.slots.filter(
                                (s) =>
                                  s.classId === cls.id &&
                                  s.day === day &&
                                  s.period === periodConfig.period
                              );

                              return (
                                <td
                                  key={dayIdx}
                                  className="p-2 border-2 border-slate-900 h-16 min-w-[100px] align-middle"
                                >
                                  {slots.length > 0 ? (
                                    <div className="space-y-1">
                                      {slots.map((slot) => {
                                        const subj = project.subjects.find(
                                          (s) => s.id === slot.subjectId
                                        );
                                        const teacher = project.teachers.find(
                                          (t) => t.id === slot.teacherId
                                        );
                                        const room = project.rooms.find(
                                          (r) => r.id === slot.roomId
                                        );

                                        return (
                                          <div key={slot.id} className="flex flex-col justify-center items-center h-full">
                                            <div className="font-black text-sm text-slate-900">{subj?.name}</div>
                                            <div className="text-xs text-slate-600 font-semibold mt-0.5">
                                              {teacher?.name} ({teacher?.shortCode})
                                            </div>
                                            {room && (
                                              <div className="text-[10px] text-slate-400 font-mono">
                                                {room.name}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
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

        {/* 3. TEACHER TIMETABLES EXPORT */}
        {exportTab === 'teachers' &&
          project.teachers
            .filter((t) => selectedTargetId === 'ALL' || t.id === selectedTargetId)
            .map((teacher) => {
              const elementId = `print-teacher-${teacher.id}`;
              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4 print:shadow-none print:border-none print:p-0 print:break-after-page"
                >
                  <div className="flex justify-between items-center print:hidden border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: teacher.color }}></div>
                      <h3 className="text-xl font-bold text-slate-900">{teacher.name} Órarendje</h3>
                    </div>
                    <button
                      onClick={() => handleDownloadPdf(elementId, `tanar_${teacher.shortCode}`)}
                      className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF Letöltés</span>
                    </button>
                  </div>

                  <div id={elementId} className="bg-white p-6 rounded-2xl border border-slate-200 font-sans">
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
                        {periods.map((periodConfig) => (
                          <tr key={periodConfig.period} className="border-b border-slate-300">
                            <td className="p-2 border-2 border-slate-900 bg-slate-100 font-bold text-xs">
                              <div>{periodConfig.period}. óra</div>
                              <div className="text-[10px] text-slate-500">
                                {periodConfig.startTime}-{periodConfig.endTime}
                              </div>
                            </td>

                            {DAYS_HUNGARIAN.map((_, dayIdx) => {
                              const day = dayIdx as DayOfWeek;
                              const slotsForTeacher = project.slots.filter(
                                (s) =>
                                  s.teacherId === teacher.id &&
                                  s.day === day &&
                                  s.period === periodConfig.period
                              );

                              return (
                                <td
                                  key={dayIdx}
                                  className="p-2 border-2 border-slate-900 h-16 min-w-[100px] align-middle"
                                >
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
