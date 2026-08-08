import React, { useState } from 'react';
import {
  User,
  GraduationCap,
  Grid,
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';
import type {
  TimetableProject,
  TimetableSlot,
  DayOfWeek,
  Conflict,
} from '../../types/timetable';
import { DAYS_HUNGARIAN, DEFAULT_PERIODS } from '../../types/timetable';
import type { CurriculumProgress } from '../../services/conflictChecker';
import { calculateCurriculumProgress } from '../../services/conflictChecker';

interface TimetableEditorProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
  conflicts: Conflict[];
  onOpenGenerator: () => void;
}

export const TimetableEditor: React.FC<TimetableEditorProps> = ({
  project,
  setProject,
  conflicts,
  onOpenGenerator,
}) => {
  const [viewMode, setViewMode] = useState<'class' | 'teacher' | 'master'>('class');
  const [selectedClassId, setSelectedClassId] = useState<string>(project.classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(project.teachers[0]?.id || '');

  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    day: DayOfWeek;
    period: number;
    classId: string;
  } | null>(null);

  const [draggedCurriculumId, setDraggedCurriculumId] = useState<string | null>(null);

  const progressList: CurriculumProgress[] = calculateCurriculumProgress(
    project.curriculum,
    project.slots
  );

  const handleToggleLock = (slotId: string) => {
    setProject((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === slotId ? { ...s, isLocked: !s.isLocked } : s)),
    }));
  };

  const handleRemoveSlot = (slotId: string) => {
    setProject((prev) => ({
      ...prev,
      slots: prev.slots.filter((s) => s.id !== slotId),
    }));
  };

  const handleAssignSlot = (
    day: DayOfWeek,
    period: number,
    classId: string,
    subjectId: string,
    teacherId: string,
    roomId?: string
  ) => {
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      day,
      period,
      classId,
      subjectId,
      teacherId,
      roomId,
      isLocked: false,
    };

    setProject((prev) => ({
      ...prev,
      slots: [...prev.slots.filter((s) => !(s.classId === classId && s.day === day && s.period === period)), newSlot],
    }));

    setActiveSlotTarget(null);
  };

  const handleDragStart = (e: React.DragEvent, curriculumId: string) => {
    setDraggedCurriculumId(curriculumId);
    e.dataTransfer.setData('text/plain', curriculumId);
  };

  const handleDropOnCell = (e: React.DragEvent, day: DayOfWeek, period: number, targetClassId: string) => {
    e.preventDefault();
    const currId = e.dataTransfer.getData('text/plain') || draggedCurriculumId;
    if (!currId) return;

    const curr = project.curriculum.find((c) => c.id === currId);
    if (curr) {
      handleAssignSlot(day, period, targetClassId || curr.classId, curr.subjectId, curr.teacherId, curr.roomId);
    }
    setDraggedCurriculumId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getSlotConflicts = (day: DayOfWeek, period: number, classId?: string, teacherId?: string) => {
    return conflicts.filter((c) => {
      if (c.day !== day || c.period !== period) return false;
      if (classId) {
        const involvedSlots = project.slots.filter((s) => c.involvedSlotIds.includes(s.id));
        if (involvedSlots.some((s) => s.classId === classId)) return true;
      }
      if (teacherId) {
        const involvedSlots = project.slots.filter((s) => c.involvedSlotIds.includes(s.id));
        if (involvedSlots.some((s) => s.teacherId === teacherId)) return true;
      }
      return false;
    });
  };

  const currentViewProgress = progressList.filter((p) => {
    if (viewMode === 'class') return p.classId === selectedClassId;
    if (viewMode === 'teacher') return p.teacherId === selectedTeacherId;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('class')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'class'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Osztály Nézet</span>
          </button>

          <button
            onClick={() => setViewMode('teacher')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'teacher'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Tanár Nézet</span>
          </button>

          <button
            onClick={() => setViewMode('master')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'master'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Összesített Mátrix</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          {viewMode === 'class' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-slate-700">Kiválasztott osztály:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {project.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade}. évfolyam)
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'teacher' && (
            <div className="flex items-center space-x-2">
              <label className="text-sm font-semibold text-slate-700">Kiválasztott tanár:</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {project.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenGenerator}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Automatikus Elhelyezés</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-x-auto p-4">
        {viewMode === 'class' && (
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-3 bg-slate-900 text-white rounded-tl-xl w-28 text-left text-xs font-bold">
                  Óra / Idő
                </th>
                {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                  <th
                    key={dayIdx}
                    className="p-3 bg-slate-900 text-white text-center text-sm font-bold border-l border-slate-800"
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DEFAULT_PERIODS.map((periodConfig) => (
                <tr key={periodConfig.period} className="hover:bg-slate-50/50">
                  <td className="p-3 bg-slate-50 border-r border-slate-200 text-slate-800">
                    <div className="font-bold text-sm">{periodConfig.period}. óra</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {periodConfig.startTime} - {periodConfig.endTime}
                    </div>
                  </td>

                  {DAYS_HUNGARIAN.map((_, dayIdx) => {
                    const day = dayIdx as DayOfWeek;
                    const slot = project.slots.find(
                      (s) => s.classId === selectedClassId && s.day === day && s.period === periodConfig.period
                    );

                    const subj = slot ? project.subjects.find((s) => s.id === slot.subjectId) : null;
                    const teacher = slot ? project.teachers.find((t) => t.id === slot.teacherId) : null;
                    const room = slot ? project.rooms.find((r) => r.id === slot.roomId) : null;

                    const cellConflicts = getSlotConflicts(day, periodConfig.period, selectedClassId);

                    return (
                      <td
                        key={dayIdx}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnCell(e, day, periodConfig.period, selectedClassId)}
                        className={`p-2 border border-slate-200 h-24 min-w-[140px] relative transition-all ${
                          cellConflicts.length > 0
                            ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400 ring-inset'
                            : slot
                            ? 'bg-slate-50/70 hover:bg-slate-100/80'
                            : 'hover:bg-indigo-50/30 cursor-pointer border-dashed'
                        }`}
                      >
                        {slot ? (
                          <div
                            className="h-full rounded-xl p-2.5 flex flex-col justify-between text-white shadow-md relative group transition-transform transform hover:-translate-y-0.5"
                            style={{ backgroundColor: subj?.color || '#3b82f6' }}
                          >
                            <div className="flex items-center justify-between border-b border-white/20 pb-1">
                              <span className="font-black text-xs tracking-wider">{subj?.shortCode || 'ÓRA'}</span>
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleToggleLock(slot.id)}
                                  className="p-0.5 rounded hover:bg-black/20 text-white/80 hover:text-white"
                                  title={slot.isLocked ? 'Zárolt óra' : 'Óra zárolása'}
                                >
                                  {slot.isLocked ? <Lock className="w-3 h-3 text-amber-300" /> : <Unlock className="w-3 h-3 opacity-60" />}
                                </button>

                                <button
                                  onClick={() => handleRemoveSlot(slot.id)}
                                  className="p-0.5 rounded hover:bg-black/30 text-white/80 hover:text-red-200"
                                  title="Törlés"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            <div className="my-1">
                              <div className="font-bold text-xs truncate leading-tight" title={subj?.name}>
                                {subj?.name}
                              </div>
                              <div className="flex items-center justify-between text-[11px] text-white/90 mt-1">
                                <span className="font-medium bg-black/20 px-1.5 py-0.5 rounded" title={teacher?.name}>
                                  {teacher?.shortCode || teacher?.name}
                                </span>
                                {room && <span className="text-[10px] opacity-80">{room.shortCode}</span>}
                              </div>
                            </div>

                            {cellConflicts.length > 0 && (
                              <div
                                className="absolute -top-2 -right-2 bg-red-600 text-white p-1 rounded-full shadow-lg animate-bounce"
                                title={cellConflicts.map((c) => c.message).join('\n')}
                              >
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div
                            onClick={() =>
                              setActiveSlotTarget({
                                day,
                                period: periodConfig.period,
                                classId: selectedClassId,
                              })
                            }
                            className="h-full rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-600 transition-colors group"
                          >
                            <Plus className="w-5 h-5 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-semibold mt-1 opacity-60">Húzz vagy kattints</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {viewMode === 'teacher' && (
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr>
                <th className="p-3 bg-slate-900 text-white rounded-tl-xl w-28 text-left text-xs font-bold">
                  Óra / Idő
                </th>
                {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                  <th
                    key={dayIdx}
                    className="p-3 bg-slate-900 text-white text-center text-sm font-bold border-l border-slate-800"
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {DEFAULT_PERIODS.map((periodConfig) => (
                <tr key={periodConfig.period} className="hover:bg-slate-50/50">
                  <td className="p-3 bg-slate-50 border-r border-slate-200 text-slate-800">
                    <div className="font-bold text-sm">{periodConfig.period}. óra</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {periodConfig.startTime} - {periodConfig.endTime}
                    </div>
                  </td>

                  {DAYS_HUNGARIAN.map((_, dayIdx) => {
                    const day = dayIdx as DayOfWeek;
                    const slotsForTeacher = project.slots.filter(
                      (s) => s.teacherId === selectedTeacherId && s.day === day && s.period === periodConfig.period
                    );

                    const teacherObj = project.teachers.find((t) => t.id === selectedTeacherId);
                    const isUnavailable = teacherObj?.unavailableSlots.some(
                      (u) => u.day === day && u.period === periodConfig.period
                    );

                    const cellConflicts = getSlotConflicts(day, periodConfig.period, undefined, selectedTeacherId);

                    return (
                      <td
                        key={dayIdx}
                        className={`p-2 border border-slate-200 h-24 min-w-[140px] relative ${
                          isUnavailable
                            ? 'bg-slate-200/60 pattern-diagonal-lines text-slate-500'
                            : cellConflicts.length > 0
                            ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400 ring-inset'
                            : 'bg-white'
                        }`}
                      >
                        {isUnavailable && slotsForTeacher.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-slate-400 text-xs font-semibold italic">
                            Nem elérhető
                          </div>
                        ) : slotsForTeacher.length > 0 ? (
                          <div className="space-y-1 h-full flex flex-col justify-center">
                            {slotsForTeacher.map((slot) => {
                              const cls = project.classes.find((c) => c.id === slot.classId);
                              const subj = project.subjects.find((s) => s.id === slot.subjectId);

                              return (
                                <div
                                  key={slot.id}
                                  className="rounded-lg p-2 text-white shadow-sm flex flex-col justify-between"
                                  style={{ backgroundColor: cls?.color || subj?.color || '#3b82f6' }}
                                >
                                  <div className="flex justify-between items-center text-xs font-bold">
                                    <span>{cls?.name}</span>
                                    <span className="text-[10px] bg-black/20 px-1 rounded">{subj?.shortCode}</span>
                                  </div>
                                  <div className="text-[11px] opacity-90 truncate mt-0.5">{subj?.name}</div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-300 text-xs italic">
                            Szabad
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {viewMode === 'master' && (
          <div className="space-y-8">
            {project.classes.map((cls) => (
              <div key={cls.id} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-slate-900 text-white px-4 py-2 font-bold text-sm flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cls.color }}></div>
                  <span>{cls.name} Osztály Órarendje</span>
                </div>
                <table className="w-full text-xs text-center border-collapse">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2 border">Nap</th>
                      {DEFAULT_PERIODS.map((p) => (
                        <th key={p.period} className="p-2 border">
                          {p.period}. óra
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                      <tr key={dayIdx} className="hover:bg-slate-50">
                        <td className="p-2 border font-bold text-slate-800 bg-slate-50">{dayName}</td>
                        {DEFAULT_PERIODS.map((p) => {
                          const slot = project.slots.find(
                            (s) => s.classId === cls.id && s.day === dayIdx && s.period === p.period
                          );
                          const subj = slot ? project.subjects.find((sub) => sub.id === slot.subjectId) : null;
                          const teacher = slot ? project.teachers.find((t) => t.id === slot.teacherId) : null;

                          return (
                            <td key={p.period} className="p-1 border h-12 min-w-[80px]">
                              {slot ? (
                                <div
                                  className="h-full rounded p-1 text-white font-bold flex flex-col justify-center"
                                  style={{ backgroundColor: subj?.color || '#3b82f6' }}
                                >
                                  <div>{subj?.shortCode}</div>
                                  <div className="text-[9px] opacity-80">{teacher?.shortCode}</div>
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
            ))}
          </div>
        )}
      </div>

      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Info className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base">
              Kiosztatlan Órák Kerete (Óra-pool)
              {viewMode === 'class'
                ? ` - ${project.classes.find((c) => c.id === selectedClassId)?.name}`
                : viewMode === 'teacher'
                ? ` - ${project.teachers.find((t) => t.id === selectedTeacherId)?.name}`
                : ''}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Húzd a tárgyat a fenti órarend cellájára az elhelyezéshez!
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {currentViewProgress.map((p) => {
            const cls = project.classes.find((c) => c.id === p.classId);
            const subj = project.subjects.find((s) => s.id === p.subjectId);
            const teacher = project.teachers.find((t) => t.id === p.teacherId);

            const percent = Math.min(100, Math.round((p.assignedHours / p.requiredHours) * 100));

            return (
              <div
                key={p.curriculumId}
                draggable={p.remainingHours > 0}
                onDragStart={(e) => handleDragStart(e, p.curriculumId)}
                className={`bg-slate-800/90 p-3 rounded-xl border transition-all ${
                  p.remainingHours > 0
                    ? 'border-slate-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing hover:bg-slate-800'
                    : 'border-emerald-500/30 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subj?.color || '#3b82f6' }}
                    ></span>
                    <span className="font-bold text-sm text-white">{subj?.name}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-300">
                    {p.assignedHours} / {p.requiredHours} óra
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span>Osztály: {cls?.name}</span>
                  <span>Tanár: {teacher?.shortCode}</span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      p.isComplete
                        ? 'bg-emerald-400'
                        : p.isExceeded
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-indigo-500 to-blue-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {activeSlotTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">
                Óra Beosztása: {DAYS_HUNGARIAN[activeSlotTarget.day]} {activeSlotTarget.period}. óra
              </h3>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">Válassz a rendelkezésre álló óraterv követelményekből:</p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {project.curriculum
                .filter((c) => c.classId === activeSlotTarget.classId)
                .map((curr) => {
                  const subj = project.subjects.find((s) => s.id === curr.subjectId);
                  const teacher = project.teachers.find((t) => t.id === curr.teacherId);
                  const room = project.rooms.find((r) => r.id === curr.roomId);

                  return (
                    <button
                      key={curr.id}
                      onClick={() =>
                        handleAssignSlot(
                          activeSlotTarget.day,
                          activeSlotTarget.period,
                          activeSlotTarget.classId,
                          curr.subjectId,
                          curr.teacherId,
                          curr.roomId
                        )
                      }
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/50 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: subj?.color || '#3b82f6' }}
                        >
                          {subj?.shortCode}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{subj?.name}</div>
                          <div className="text-xs text-slate-500">{teacher?.name} ({teacher?.shortCode})</div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">{room?.shortCode}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
