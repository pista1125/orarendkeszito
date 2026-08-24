import React, { useState, useMemo } from 'react';
import {
  User,
  GraduationCap,
  Grid,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Sparkles,
  DoorOpen,
  Users,
  Search,
  Filter,
  Layers,
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
import { MasterBoardView } from './MasterBoardView';

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
  const [viewMode, setViewMode] = useState<
    'master' | 'class' | 'teacher' | 'room' | 'teacher_matrix'
  >('master');

  const [selectedClassId, setSelectedClassId] = useState<string>(project.classes[0]?.id || '');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(project.teachers[0]?.id || '');
  const [selectedRoomId, setSelectedRoomId] = useState<string>(project.rooms[0]?.id || '');

  const [highlightTeacherId, setHighlightTeacherId] = useState<string>('');
  const [highlightSubjectId, setHighlightSubjectId] = useState<string>('');

  const [poolFilterClass, setPoolFilterClass] = useState<string>('ALL');
  const [poolSearchText, setPoolSearchText] = useState<string>('');

  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    day: DayOfWeek;
    period: number;
    classId: string;
  } | null>(null);

  const [draggedCurriculumId, setDraggedCurriculumId] = useState<string | null>(null);

  const activePeriods = project.periods && project.periods.length > 0
    ? project.periods
    : DEFAULT_PERIODS;

  const progressList: CurriculumProgress[] = useMemo(
    () => calculateCurriculumProgress(project.curriculum, project.slots),
    [project.curriculum, project.slots]
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
    roomId?: string,
    groupName?: string
  ) => {
    const newSlot: TimetableSlot = {
      id: `slot-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      day,
      period,
      classId,
      subjectId,
      teacherId,
      roomId,
      groupName,
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
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'pool', curriculumId })
    );
  };

  const handleDropOnCell = (
    e: React.DragEvent,
    day: DayOfWeek,
    period: number,
    targetClassId: string
  ) => {
    e.preventDefault();
    const currId = e.dataTransfer.getData('text/plain') || draggedCurriculumId;
    if (!currId) return;

    const curr = project.curriculum.find((c) => c.id === currId);
    if (curr) {
      handleAssignSlot(
        day,
        period,
        targetClassId || curr.classId,
        curr.subjectId,
        curr.teacherId,
        curr.roomId
      );
    }
    setDraggedCurriculumId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getSlotConflicts = (day: DayOfWeek, period: number, classId?: string, teacherId?: string, roomId?: string) => {
    return conflicts.filter((c) => {
      if (c.day !== day || c.period !== period) return false;
      const involvedSlots = project.slots.filter((s) => c.involvedSlotIds.includes(s.id));
      if (classId && involvedSlots.some((s) => s.classId === classId)) return true;
      if (teacherId && involvedSlots.some((s) => s.teacherId === teacherId)) return true;
      if (roomId && involvedSlots.some((s) => s.roomId === roomId)) return true;
      return false;
    });
  };

  // Filtered pool items
  const filteredPoolItems = useMemo(() => {
    return progressList.filter((p) => {
      if (poolFilterClass !== 'ALL' && p.classId !== poolFilterClass) return false;
      if (poolSearchText.trim()) {
        const subj = project.subjects.find((s) => s.id === p.subjectId)?.name.toLowerCase() || '';
        const teacher = project.teachers.find((t) => t.id === p.teacherId)?.name.toLowerCase() || '';
        const cls = project.classes.find((c) => c.id === p.classId)?.name.toLowerCase() || '';
        const query = poolSearchText.toLowerCase();
        if (!subj.includes(query) && !teacher.includes(query) && !cls.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [progressList, poolFilterClass, poolSearchText, project.subjects, project.teachers, project.classes]);

  // Selected teacher stats for teacher view
  const teacherStats = useMemo(() => {
    if (!selectedTeacherId) return null;
    const teacher = project.teachers.find((t) => t.id === selectedTeacherId);
    const teacherSlots = project.slots.filter((s) => s.teacherId === selectedTeacherId);
    const totalWeeklyHours = teacherSlots.length;

    // Daily breakdown & free periods (lyukasórák)
    const dailyHours = [0, 1, 2, 3, 4].map((dayIdx) => {
      const daySlots = teacherSlots.filter((s) => s.day === dayIdx);
      const periods = daySlots.map((s) => s.period).sort((a, b) => a - b);
      let holes = 0;
      if (periods.length > 1) {
        const minP = periods[0];
        const maxP = periods[periods.length - 1];
        holes = maxP - minP + 1 - periods.length;
      }
      return {
        dayName: DAYS_HUNGARIAN[dayIdx],
        count: daySlots.length,
        holes,
      };
    });

    return {
      teacher,
      totalWeeklyHours,
      dailyHours,
      totalHoles: dailyHours.reduce((sum, d) => sum + d.holes, 0),
    };
  }, [selectedTeacherId, project.slots, project.teachers]);

  return (
    <div className="max-w-[1680px] mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top View Selector Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1.5 rounded-2xl gap-1 w-full lg:w-auto overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setViewMode('master')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'master'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Grid className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>🌟 Fő Mester Tábla</span>
          </button>

          <button
            onClick={() => setViewMode('class')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'class'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-cyan-600 shrink-0" />
            <span>Osztály Nézet</span>
          </button>

          <button
            onClick={() => setViewMode('teacher')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'teacher'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tanár Nézet</span>
          </button>

          <button
            onClick={() => setViewMode('room')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'room'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <DoorOpen className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Terem Nézet</span>
          </button>

          <button
            onClick={() => setViewMode('teacher_matrix')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              viewMode === 'teacher_matrix'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-pink-600 shrink-0" />
            <span>Tanári Mátrix</span>
          </button>
        </div>

        {/* Dynamic Context Selector */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          {viewMode === 'class' && (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700">Osztály:</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
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
              <label className="text-xs font-bold text-slate-700">Tanár:</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {project.teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.shortCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'room' && (
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-700">Terem:</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              >
                {project.rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.shortCode})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenGenerator}
            className="flex items-center space-x-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Auto Generálás</span>
          </button>
        </div>
      </div>

      {/* 1. MASTER BOARD VIEW */}
      {viewMode === 'master' && (
        <MasterBoardView
          project={project}
          setProject={setProject}
          conflicts={conflicts}
          onOpenGenerator={onOpenGenerator}
          highlightTeacherId={highlightTeacherId}
          setHighlightTeacherId={setHighlightTeacherId}
          highlightSubjectId={highlightSubjectId}
          setHighlightSubjectId={setHighlightSubjectId}
        />
      )}

      {/* 2. CLASS VIEW */}
      {viewMode === 'class' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <span
                className="w-4 h-4 rounded-full"
                style={{
                  backgroundColor:
                    project.classes.find((c) => c.id === selectedClassId)?.color || '#3b82f6',
                }}
              ></span>
              <h2 className="text-xl font-black text-slate-900">
                {project.classes.find((c) => c.id === selectedClassId)?.name} Osztály Órarendje
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Összes óraszám: {project.slots.filter((s) => s.classId === selectedClassId).length} óra / hét
            </span>
          </div>

          <table className="w-full border-collapse min-w-[750px]">
            <thead>
              <tr>
                <th className="p-3 bg-slate-900 text-white rounded-tl-2xl w-28 text-left text-xs font-black">
                  Óra / Idő
                </th>
                {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                  <th
                    key={dayIdx}
                    className="p-3 bg-slate-900 text-white text-center text-sm font-black border-l border-slate-800"
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activePeriods.map((periodConfig) => (
                <tr key={periodConfig.period} className="hover:bg-slate-50/50">
                  <td className="p-3 bg-slate-50 border-r border-slate-200 text-slate-800">
                    <div className="font-black text-sm">{periodConfig.period}. óra</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {periodConfig.startTime} - {periodConfig.endTime}
                    </div>
                  </td>

                  {DAYS_HUNGARIAN.map((_, dayIdx) => {
                    const day = dayIdx as DayOfWeek;
                    const slots = project.slots.filter(
                      (s) =>
                        s.classId === selectedClassId &&
                        s.day === day &&
                        s.period === periodConfig.period
                    );

                    const cellConflicts = getSlotConflicts(day, periodConfig.period, selectedClassId);

                    return (
                      <td
                        key={dayIdx}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnCell(e, day, periodConfig.period, selectedClassId)}
                        className={`p-2 border border-slate-200 h-24 min-w-[140px] relative transition-all ${
                          cellConflicts.length > 0
                            ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400 ring-inset'
                            : slots.length > 0
                            ? 'bg-slate-50/70 hover:bg-slate-100/80'
                            : 'hover:bg-indigo-50/30 cursor-pointer border-dashed'
                        }`}
                      >
                        {slots.length > 0 ? (
                          <div className="flex flex-col gap-1.5 h-full justify-center">
                            {slots.map((slot) => {
                              const subj = project.subjects.find((s) => s.id === slot.subjectId);
                              const teacher = project.teachers.find((t) => t.id === slot.teacherId);
                              const room = project.rooms.find((r) => r.id === slot.roomId);

                              return (
                                <div
                                  key={slot.id}
                                  className="h-full rounded-xl p-2 flex flex-col justify-between text-white shadow-md relative group transition-transform transform hover:-translate-y-0.5"
                                  style={{ backgroundColor: subj?.color || '#3b82f6' }}
                                >
                                  <div className="flex items-center justify-between border-b border-white/20 pb-0.5">
                                    <span className="font-black text-xs tracking-wider">
                                      {subj?.shortCode || subj?.name}
                                    </span>
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => handleToggleLock(slot.id)}
                                        className="p-0.5 rounded hover:bg-black/20 text-white/80 hover:text-white"
                                        title={slot.isLocked ? 'Zárolt óra' : 'Óra zárolása'}
                                      >
                                        {slot.isLocked ? (
                                          <Lock className="w-3 h-3 text-amber-300" />
                                        ) : (
                                          <Unlock className="w-3 h-3 opacity-60" />
                                        )}
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

                                  <div className="my-0.5">
                                    <div className="flex items-center justify-between text-[11px] text-white/90">
                                      <span
                                        className="font-bold bg-black/20 px-1.5 py-0.5 rounded"
                                        title={teacher?.name}
                                      >
                                        {teacher?.shortCode || teacher?.name}
                                      </span>
                                      {room && (
                                        <span className="text-[10px] opacity-80">{room.shortCode}</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
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
                            <span className="text-[10px] font-semibold mt-1 opacity-60">
                              Húzz vagy kattints
                            </span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. TEACHER VIEW */}
      {viewMode === 'teacher' && teacherStats && (
        <div className="space-y-6">
          {/* Teacher Summary Info Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-base shadow-md"
                style={{ backgroundColor: teacherStats.teacher?.color || '#3b82f6' }}
              >
                {teacherStats.teacher?.shortCode}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{teacherStats.teacher?.name}</h2>
                <div className="text-xs text-slate-500 flex items-center space-x-3 mt-0.5">
                  <span>Heti óraszám: <strong className="text-indigo-600">{teacherStats.totalWeeklyHours} óra</strong></span>
                  <span>•</span>
                  <span>Lyukasórák: <strong className="text-amber-600">{teacherStats.totalHoles} óra</strong></span>
                  <span>•</span>
                  <span>Max napi óra: {teacherStats.teacher?.maxDailyHours} óra</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {teacherStats.dailyHours.map((d, i) => (
                <div
                  key={i}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-2 text-center min-w-[65px]"
                >
                  <div className="text-[10px] font-bold text-slate-500">{d.dayName}</div>
                  <div className="text-sm font-black text-slate-800">{d.count} óra</div>
                  {d.holes > 0 && (
                    <div className="text-[10px] text-amber-600 font-semibold">{d.holes} lyukas</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6">
            <table className="w-full border-collapse min-w-[750px]">
              <thead>
                <tr>
                  <th className="p-3 bg-slate-900 text-white rounded-tl-2xl w-28 text-left text-xs font-black">
                    Óra / Idő
                  </th>
                  {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                    <th
                      key={dayIdx}
                      className="p-3 bg-slate-900 text-white text-center text-sm font-black border-l border-slate-800"
                    >
                      {dayName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {activePeriods.map((periodConfig) => (
                  <tr key={periodConfig.period} className="hover:bg-slate-50/50">
                    <td className="p-3 bg-slate-50 border-r border-slate-200 text-slate-800">
                      <div className="font-black text-sm">{periodConfig.period}. óra</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {periodConfig.startTime} - {periodConfig.endTime}
                      </div>
                    </td>

                    {DAYS_HUNGARIAN.map((_, dayIdx) => {
                      const day = dayIdx as DayOfWeek;
                      const slotsForTeacher = project.slots.filter(
                        (s) =>
                          s.teacherId === selectedTeacherId &&
                          s.day === day &&
                          s.period === periodConfig.period
                      );

                      const teacherObj = project.teachers.find((t) => t.id === selectedTeacherId);
                      const isUnavailable = teacherObj?.unavailableSlots.some(
                        (u) => u.day === day && u.period === periodConfig.period
                      );

                      const cellConflicts = getSlotConflicts(
                        day,
                        periodConfig.period,
                        undefined,
                        selectedTeacherId
                      );

                      return (
                        <td
                          key={dayIdx}
                          className={`p-2 border border-slate-200 h-24 min-w-[140px] relative ${
                            isUnavailable
                              ? 'bg-slate-200/60 text-slate-500'
                              : cellConflicts.length > 0
                              ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400 ring-inset'
                              : 'bg-white'
                          }`}
                        >
                          {isUnavailable && slotsForTeacher.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-slate-400 text-xs font-bold italic">
                              Nem elérhető
                            </div>
                          ) : slotsForTeacher.length > 0 ? (
                            <div className="space-y-1 h-full flex flex-col justify-center">
                              {slotsForTeacher.map((slot) => {
                                const cls = project.classes.find((c) => c.id === slot.classId);
                                const subj = project.subjects.find((s) => s.id === slot.subjectId);
                                const room = project.rooms.find((r) => r.id === slot.roomId);

                                return (
                                  <div
                                    key={slot.id}
                                    className="rounded-xl p-2 text-white shadow-sm flex flex-col justify-between"
                                    style={{
                                      backgroundColor: cls?.color || subj?.color || '#3b82f6',
                                    }}
                                  >
                                    <div className="flex justify-between items-center text-xs font-black">
                                      <span>{cls?.name}</span>
                                      <span className="text-[10px] bg-black/25 px-1 py-0.2 rounded">
                                        {subj?.shortCode || subj?.name}
                                      </span>
                                    </div>
                                    <div className="text-[11px] opacity-90 truncate mt-0.5 flex justify-between">
                                      <span>{subj?.name}</span>
                                      {room && <span className="text-[9px] opacity-80">{room.shortCode}</span>}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-slate-300 text-xs font-semibold italic">
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
          </div>
        </div>
      )}

      {/* 4. ROOM VIEW */}
      {viewMode === 'room' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <DoorOpen className="w-6 h-6 text-indigo-600" />
              <h2 className="text-xl font-black text-slate-900">
                {project.rooms.find((r) => r.id === selectedRoomId)?.name} Foglaltsági Órarendje
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Foglalt órák: {project.slots.filter((s) => s.roomId === selectedRoomId).length} óra / hét
            </span>
          </div>

          <table className="w-full border-collapse min-w-[750px]">
            <thead>
              <tr>
                <th className="p-3 bg-slate-900 text-white rounded-tl-2xl w-28 text-left text-xs font-black">
                  Óra / Idő
                </th>
                {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                  <th
                    key={dayIdx}
                    className="p-3 bg-slate-900 text-white text-center text-sm font-black border-l border-slate-800"
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {activePeriods.map((periodConfig) => (
                <tr key={periodConfig.period} className="hover:bg-slate-50/50">
                  <td className="p-3 bg-slate-50 border-r border-slate-200 text-slate-800">
                    <div className="font-black text-sm">{periodConfig.period}. óra</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {periodConfig.startTime} - {periodConfig.endTime}
                    </div>
                  </td>

                  {DAYS_HUNGARIAN.map((_, dayIdx) => {
                    const day = dayIdx as DayOfWeek;
                    const slotsInRoom = project.slots.filter(
                      (s) =>
                        s.roomId === selectedRoomId &&
                        s.day === day &&
                        s.period === periodConfig.period
                    );

                    const cellConflicts = getSlotConflicts(
                      day,
                      periodConfig.period,
                      undefined,
                      undefined,
                      selectedRoomId
                    );

                    return (
                      <td
                        key={dayIdx}
                        className={`p-2 border border-slate-200 h-24 min-w-[140px] relative ${
                          cellConflicts.length > 0
                            ? 'bg-red-50/90 border-red-300 ring-2 ring-red-400 ring-inset'
                            : slotsInRoom.length > 0
                            ? 'bg-slate-50'
                            : 'bg-white'
                        }`}
                      >
                        {slotsInRoom.length > 0 ? (
                          <div className="space-y-1 h-full flex flex-col justify-center">
                            {slotsInRoom.map((slot) => {
                              const cls = project.classes.find((c) => c.id === slot.classId);
                              const subj = project.subjects.find((s) => s.id === slot.subjectId);
                              const teacher = project.teachers.find((t) => t.id === slot.teacherId);

                              return (
                                <div
                                  key={slot.id}
                                  className="rounded-xl p-2 text-white shadow-sm flex flex-col justify-between"
                                  style={{
                                    backgroundColor: cls?.color || '#3b82f6',
                                  }}
                                >
                                  <div className="flex justify-between items-center text-xs font-black">
                                    <span>{cls?.name}</span>
                                    <span className="text-[10px] bg-black/25 px-1 py-0.2 rounded">
                                      {subj?.shortCode}
                                    </span>
                                  </div>
                                  <div className="text-[11px] opacity-90 truncate mt-0.5">
                                    {teacher?.name} ({teacher?.shortCode})
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center text-slate-300 text-xs italic font-semibold">
                            Szabad terem
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. TEACHER MATRIX VIEW */}
      {viewMode === 'teacher_matrix' && (
        <div className="space-y-8">
          {project.teachers.map((teacher) => {
            const teacherSlots = project.slots.filter((s) => s.teacherId === teacher.id);
            return (
              <div
                key={teacher.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden"
              >
                <div className="bg-slate-900 text-white px-5 py-3 font-bold text-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: teacher.color }}
                    ></span>
                    <span className="text-base font-black">{teacher.name} ({teacher.shortCode})</span>
                  </div>
                  <span className="text-xs text-slate-300 font-normal">
                    {teacherSlots.length} óra / hét
                  </span>
                </div>

                <div className="overflow-x-auto p-4">
                  <table className="w-full text-xs text-center border-collapse min-w-[700px]">
                    <thead className="bg-slate-100 font-bold text-slate-700">
                      <tr>
                        <th className="p-2 border">Nap</th>
                        {activePeriods.map((p) => (
                          <th key={p.period} className="p-2 border">
                            {p.period}. óra
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {DAYS_HUNGARIAN.map((dayName, dayIdx) => (
                        <tr key={dayIdx} className="hover:bg-slate-50">
                          <td className="p-2 border font-black text-slate-800 bg-slate-50 w-24">
                            {dayName}
                          </td>
                          {activePeriods.map((p) => {
                            const slot = project.slots.find(
                              (s) =>
                                s.teacherId === teacher.id &&
                                s.day === dayIdx &&
                                s.period === p.period
                            );
                            const cls = slot
                              ? project.classes.find((c) => c.id === slot.classId)
                              : null;
                            const subj = slot
                              ? project.subjects.find((sub) => sub.id === slot.subjectId)
                              : null;

                            return (
                              <td key={p.period} className="p-1 border h-11 min-w-[75px]">
                                {slot ? (
                                  <div
                                    className="h-full rounded-lg p-1 text-white font-bold flex flex-col justify-center shadow-xs"
                                    style={{
                                      backgroundColor: cls?.color || subj?.color || '#3b82f6',
                                    }}
                                  >
                                    <div className="font-black text-xs">{cls?.name}</div>
                                    <div className="text-[10px] opacity-90">{subj?.shortCode}</div>
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
        </div>
      )}

      {/* Curriculum Pool Drawer / Dock (Óra-pool) */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-3 gap-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/30 flex items-center justify-center border border-indigo-500/30">
              <Layers className="w-4 h-4 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-black text-base leading-tight">
                Kiosztatlan Órák Kerete (Mágneses Óra-Pool)
              </h3>
              <p className="text-xs text-slate-400">
                Húzd a színes tantárgykártyákat közvetlenül a felső órarendtábla celláira!
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by class */}
            <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl">
              <Filter className="w-3 h-3 text-slate-400" />
              <select
                value={poolFilterClass}
                onChange={(e) => setPoolFilterClass(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="ALL" className="bg-slate-900 text-white">Minden osztály órái</option>
                {project.classes.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.name} ({c.grade}.o)
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="flex items-center space-x-1.5 bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-xl">
              <Search className="w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Keresés tárgyra/tanárra..."
                value={poolSearchText}
                onChange={(e) => setPoolSearchText(e.target.value)}
                className="bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none w-36"
              />
            </div>
          </div>
        </div>

        {/* Draggable Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredPoolItems.map((p) => {
            const cls = project.classes.find((c) => c.id === p.classId);
            const subj = project.subjects.find((s) => s.id === p.subjectId);
            const teacher = project.teachers.find((t) => t.id === p.teacherId);

            const percent = Math.min(100, Math.round((p.assignedHours / p.requiredHours) * 100));

            return (
              <div
                key={p.curriculumId}
                draggable={p.remainingHours > 0}
                onDragStart={(e) => handleDragStart(e, p.curriculumId)}
                className={`bg-slate-800/90 p-3 rounded-2xl border transition-all ${
                  p.remainingHours > 0
                    ? 'border-slate-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing hover:bg-slate-800 hover:shadow-lg'
                    : 'border-emerald-500/30 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: subj?.color || '#3b82f6' }}
                    ></span>
                    <span className="font-black text-sm text-white">{subj?.name}</span>
                  </div>
                  <span
                    className={`text-xs font-bold ${
                      p.isComplete
                        ? 'text-emerald-400'
                        : p.isExceeded
                        ? 'text-red-400'
                        : 'text-indigo-300'
                    }`}
                  >
                    {p.assignedHours} / {p.requiredHours} óra
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">Osztály: {cls?.name}</span>
                  <span className="bg-slate-700/70 px-1.5 py-0.2 rounded text-[11px] text-slate-200">
                    {teacher?.name} ({teacher?.shortCode})
                  </span>
                </div>

                <div className="w-full bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      p.isComplete
                        ? 'bg-emerald-400'
                        : p.isExceeded
                        ? 'bg-red-500'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                    }`}
                    style={{ width: `${percent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Slot Assign Modal for Class View */}
      {activeSlotTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Óra Beosztása: {DAYS_HUNGARIAN[activeSlotTarget.day]}{' '}
                  {activeSlotTarget.period}. óra
                </h3>
                <p className="text-xs text-slate-500">
                  Osztály:{' '}
                  <span className="font-bold text-indigo-600">
                    {project.classes.find((c) => c.id === activeSlotTarget.classId)?.name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-700">
                Válassz a tantárgyi követelményekből:
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {project.curriculum
                  .filter((c) => c.classId === activeSlotTarget.classId)
                  .map((curr) => {
                    const subj = project.subjects.find((s) => s.id === curr.subjectId);
                    const teacher = project.teachers.find((t) => t.id === curr.teacherId);
                    const room = project.rooms.find((r) => r.id === curr.roomId);

                    const progress = progressList.find((p) => p.curriculumId === curr.id);
                    const assigned = progress?.assignedHours || 0;
                    const required = curr.weeklyHours;

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
                        className="w-full text-left p-3 rounded-2xl border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/40 shadow-xs transition-all flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
                            style={{ backgroundColor: subj?.color || '#3b82f6' }}
                          >
                            {subj?.shortCode}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-sm">{subj?.name}</div>
                            <div className="text-xs text-slate-600 flex items-center space-x-2 mt-0.5">
                              <span>
                                {teacher?.name} ({teacher?.shortCode})
                              </span>
                              {room && (
                                <span className="text-[10px] bg-slate-100 px-1 py-0.2 rounded font-mono text-slate-500">
                                  {room.shortCode}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xs font-bold text-indigo-600">
                            {assigned} / {required} óra
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {required - assigned > 0
                              ? `${required - assigned} óra hiányzik`
                              : 'Kész'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
