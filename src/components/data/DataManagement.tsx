import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  X,
  School,
  Clock,
  Sparkles,
  RotateCcw,
  Link2,
} from 'lucide-react';
import type {
  TimetableProject,
  Teacher,
  ClassGroup,
  Subject,
  CurriculumRequirement,
  Constraint,
  TimeSlotConfig,
} from '../../types/timetable';
import { DAYS_HUNGARIAN, DEFAULT_PERIODS } from '../../types/timetable';

interface DataManagementProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
}

export const DataManagement: React.FC<DataManagementProps> = ({ project, setProject }) => {
  const [subTab, setSubTab] = useState<
    'school' | 'bell_schedule' | 'teachers' | 'classes' | 'subjects' | 'curriculum' | 'constraints'
  >('school');

  // Bell schedule generator state in DataManagement
  const [calcStart, setCalcStart] = useState('08:00');
  const [calcDuration, setCalcDuration] = useState(45);
  const [calcShortBreak, setCalcShortBreak] = useState(10);
  const [calcLongBreak, setCalcLongBreak] = useState(15);
  const [calcLongBreakAfter, setCalcLongBreakAfter] = useState(2);
  const [calcPeriodCount, setCalcPeriodCount] = useState(8);

  const [editingTeacher, setEditingTeacher] = useState<Partial<Teacher> | null>(null);
  const [editingClass, setEditingClass] = useState<Partial<ClassGroup> | null>(null);
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);
  const [editingCurr, setEditingCurr] = useState<Partial<CurriculumRequirement> | null>(null);
  const [editingConstraint, setEditingConstraint] = useState<Partial<Constraint> | null>(null);

  const handleSaveTeacher = (teacher: Partial<Teacher>) => {
    if (!teacher.name || !teacher.shortCode) return;
    const isNew = !teacher.id;
    const newId = teacher.id || `t-${Date.now()}`;
    const fullTeacher: Teacher = {
      id: newId,
      name: teacher.name,
      shortCode: teacher.shortCode,
      color: teacher.color || '#3b82f6',
      maxDailyHours: teacher.maxDailyHours || 6,
      unavailableSlots: teacher.unavailableSlots || [],
    };

    setProject((prev) => ({
      ...prev,
      teachers: isNew
        ? [...prev.teachers, fullTeacher]
        : prev.teachers.map((t) => (t.id === newId ? fullTeacher : t)),
    }));
    setEditingTeacher(null);
  };

  const handleDeleteTeacher = (id: string) => {
    setProject((prev) => ({
      ...prev,
      teachers: prev.teachers.filter((t) => t.id !== id),
      curriculum: prev.curriculum.filter((c) => c.teacherId !== id),
      slots: prev.slots.filter((s) => s.teacherId !== id),
    }));
  };

  const handleSaveClass = (cls: Partial<ClassGroup>) => {
    if (!cls.name) return;
    const isNew = !cls.id;
    const newId = cls.id || `c-${Date.now()}`;
    const fullClass: ClassGroup = {
      id: newId,
      name: cls.name,
      grade: cls.grade || 5,
      color: cls.color || '#06b6d4',
    };

    setProject((prev) => ({
      ...prev,
      classes: isNew
        ? [...prev.classes, fullClass]
        : prev.classes.map((c) => (c.id === newId ? fullClass : c)),
    }));
    setEditingClass(null);
  };

  const handleDeleteClass = (id: string) => {
    setProject((prev) => ({
      ...prev,
      classes: prev.classes.filter((c) => c.id !== id),
      curriculum: prev.curriculum.filter((c) => c.classId !== id),
      slots: prev.slots.filter((s) => s.classId !== id),
    }));
  };

  const handleSaveSubject = (subj: Partial<Subject>) => {
    if (!subj.name || !subj.shortCode) return;
    const isNew = !subj.id;
    const newId = subj.id || `s-${Date.now()}`;
    const fullSubject: Subject = {
      id: newId,
      name: subj.name,
      shortCode: subj.shortCode,
      color: subj.color || '#10b981',
    };

    setProject((prev) => ({
      ...prev,
      subjects: isNew
        ? [...prev.subjects, fullSubject]
        : prev.subjects.map((s) => (s.id === newId ? fullSubject : s)),
    }));
    setEditingSubject(null);
  };

  const handleDeleteSubject = (id: string) => {
    setProject((prev) => ({
      ...prev,
      subjects: prev.subjects.filter((s) => s.id !== id),
      curriculum: prev.curriculum.filter((c) => c.subjectId !== id),
      slots: prev.slots.filter((s) => s.subjectId !== id),
    }));
  };

  const handleSaveCurriculum = (curr: Partial<CurriculumRequirement>) => {
    if (!curr.classId || !curr.subjectId || !curr.teacherId || !curr.weeklyHours) return;
    const isNew = !curr.id;
    const newId = curr.id || `curr-${Date.now()}`;
    const fullCurr: CurriculumRequirement = {
      id: newId,
      classId: curr.classId,
      subjectId: curr.subjectId,
      teacherId: curr.teacherId,
      roomId: curr.roomId,
      weeklyHours: curr.weeklyHours,
      isJoint: curr.isJoint,
      jointClassIds: curr.jointClassIds,
    };

    setProject((prev) => ({
      ...prev,
      curriculum: isNew
        ? [...prev.curriculum, fullCurr]
        : prev.curriculum.map((c) => (c.id === newId ? fullCurr : c)),
    }));
    setEditingCurr(null);
  };

  const handleDeleteCurriculum = (id: string) => {
    setProject((prev) => ({
      ...prev,
      curriculum: prev.curriculum.filter((c) => c.id !== id),
    }));
  };

  const handleSaveConstraint = (c: Partial<Constraint>) => {
    if (!c.title || !c.type) return;
    const isNew = !c.id;
    const newId = c.id || `const-${Date.now()}`;
    const fullConstraint: Constraint = {
      id: newId,
      title: c.title,
      type: c.type || 'NO_SUBJECT_PERIOD',
      classId: c.classId,
      subjectId: c.subjectId,
      teacherId: c.teacherId,
      day: c.day,
      period: c.period,
      priority: c.priority || 'HARD',
    };

    setProject((prev) => ({
      ...prev,
      constraints: isNew
        ? [...prev.constraints, fullConstraint]
        : prev.constraints.map((item) => (item.id === newId ? fullConstraint : item)),
    }));
    setEditingConstraint(null);
  };

  const handleDeleteConstraint = (id: string) => {
    setProject((prev) => ({
      ...prev,
      constraints: prev.constraints.filter((c) => c.id !== id),
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex border-b border-slate-200 mb-8 space-x-4">
        <button
          onClick={() => setSubTab('school')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'school'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <School className="w-4 h-4" />
          <span>Intézmény & Tanév</span>
        </button>

        <button
          onClick={() => setSubTab('bell_schedule')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'bell_schedule'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Csengetési Rend ({(project.periods || DEFAULT_PERIODS).length} óra)</span>
        </button>

        <button
          onClick={() => setSubTab('teachers')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'teachers'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Tanárok ({project.teachers.length})</span>
        </button>

        <button
          onClick={() => setSubTab('classes')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'classes'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Osztályok ({project.classes.length})</span>
        </button>

        <button
          onClick={() => setSubTab('subjects')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'subjects'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Tantárgyak ({project.subjects.length})</span>
        </button>

        <button
          onClick={() => setSubTab('curriculum')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'curriculum'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4" />
          <span>Óraterv & Beosztás ({project.curriculum.length})</span>
        </button>

        <button
          onClick={() => setSubTab('constraints')}
          className={`flex items-center space-x-2 pb-3 font-semibold text-sm border-b-2 transition-all cursor-pointer ${
            subTab === 'constraints'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Kötöttségek ({project.constraints.length})</span>
        </button>
      </div>

      {subTab === 'school' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 max-w-2xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
              <School className="w-7 h-7 text-indigo-600" />
              <span>Intézmény & Tanév Alapadatok</span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Állítsd be az iskola nevét, az aktuális tanévet, az időszakot (félév/tanév) és az órarend nevét.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Iskola / Intézmény neve:
              </label>
              <input
                type="text"
                value={project.schoolName}
                onChange={(e) =>
                  setProject((prev) => ({ ...prev, schoolName: e.target.value }))
                }
                placeholder="pl. Kossuth Lajos Általános Iskola"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tanév:
                </label>
                <input
                  type="text"
                  value={project.academicYear}
                  onChange={(e) =>
                    setProject((prev) => ({ ...prev, academicYear: e.target.value }))
                  }
                  placeholder="pl. 2026/2027"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Időszak / Félév:
                </label>
                <select
                  value={project.semester || 'I. Félév'}
                  onChange={(e) =>
                    setProject((prev) => ({ ...prev, semester: e.target.value }))
                  }
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none cursor-pointer"
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
                Órarend elnevezése / verzió:
              </label>
              <input
                type="text"
                value={project.name}
                onChange={(e) =>
                  setProject((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="pl. 2026/2027 I. Félév Fő Órarend"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-bold text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {subTab === 'bell_schedule' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900 flex items-center space-x-2.5">
                <Clock className="w-7 h-7 text-indigo-600" />
                <span>Csengetési Rend Kezelése</span>
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Állítsd be az egyes tanórák kezdeti és befejezési időpontjait és a szüneteket.
              </p>
            </div>

            <button
              onClick={() => {
                const current = project.periods && project.periods.length > 0 ? project.periods : DEFAULT_PERIODS;
                const nextNum = current.length + 1;
                let start = '15:15';
                let end = '16:00';
                if (current.length > 0) {
                  const last = current[current.length - 1];
                  const [lh, lm] = last.endTime.split(':').map(Number);
                  const startMins = (lh || 15) * 60 + (lm || 0) + 10;
                  const endMins = startMins + 45;
                  const formatTime = (mins: number) => {
                    const h = Math.floor(mins / 60) % 24;
                    const m = mins % 60;
                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                  };
                  start = formatTime(startMins);
                  end = formatTime(endMins);
                }
                setProject((prev) => ({
                  ...prev,
                  periods: [...(prev.periods || DEFAULT_PERIODS), { period: nextNum, startTime: start, endTime: end }],
                }));
              }}
              className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/30 cursor-pointer transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>+ Új óra hozzáadása</span>
            </button>
          </div>

          {/* Quick Auto Calculator Wizard */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-xs font-black text-indigo-900">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Automatikus Csengetési Rend Kalkulátor</span>
              </div>
              <span className="text-[11px] text-slate-500">
                Generálás megadott órahossz és szünetek szerint
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  1. óra kezdete:
                </label>
                <input
                  type="time"
                  value={calcStart}
                  onChange={(e) => setCalcStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Óra hossza:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={20}
                    max={90}
                    value={calcDuration}
                    onChange={(e) => setCalcDuration(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="ml-1 text-slate-500 text-[10px]">perc</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Kis szünet:
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={5}
                    max={30}
                    value={calcShortBreak}
                    onChange={(e) => setCalcShortBreak(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="ml-1 text-slate-500 text-[10px]">perc</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nagy szünet (perc):
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min={5}
                    max={45}
                    value={calcLongBreak}
                    onChange={(e) => setCalcLongBreak(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="ml-1 text-slate-500 text-[10px]">perc</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Nagy szünet helye:
                </label>
                <select
                  value={calcLongBreakAfter}
                  onChange={(e) => setCalcLongBreakAfter(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value={2}>2. óra után</option>
                  <option value={3}>3. óra után</option>
                  <option value={4}>4. óra után</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Generálandó óraszám:
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={calcPeriodCount}
                  onChange={(e) => setCalcPeriodCount(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => {
                  const [startH, startM] = calcStart.split(':').map(Number);
                  let currentMinute = (startH || 8) * 60 + (startM || 0);
                  const generated: TimeSlotConfig[] = [];
                  const formatTime = (mins: number) => {
                    const h = Math.floor(mins / 60) % 24;
                    const m = mins % 60;
                    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
                  };

                  for (let i = 1; i <= calcPeriodCount; i++) {
                    const startStr = formatTime(currentMinute);
                    const endMinute = currentMinute + calcDuration;
                    const endStr = formatTime(endMinute);
                    generated.push({ period: i, startTime: startStr, endTime: endStr });
                    const isLongBreak = i === calcLongBreakAfter;
                    const breakMins = isLongBreak ? calcLongBreak : calcShortBreak;
                    currentMinute = endMinute + breakMins;
                  }
                  setProject((prev) => ({ ...prev, periods: generated }));
                }}
                className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Időpontok újraszámolása és alkalmazása</span>
              </button>
            </div>
          </div>

          {/* Periods Table */}
          <div className="space-y-2.5">
            {(project.periods && project.periods.length > 0
              ? project.periods
              : DEFAULT_PERIODS
            ).map((p, idx, arr) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {p.period}.
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {p.period}. tanóra
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-semibold text-slate-500">Kezdés:</label>
                    <input
                      type="time"
                      value={p.startTime}
                      onChange={(e) => {
                        const newPeriods = arr.map((item, i) =>
                          i === idx ? { ...item, startTime: e.target.value } : item
                        );
                        setProject((prev) => ({ ...prev, periods: newPeriods }));
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <span className="text-slate-400 font-bold">-</span>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-semibold text-slate-500">Vége:</label>
                    <input
                      type="time"
                      value={p.endTime}
                      onChange={(e) => {
                        const newPeriods = arr.map((item, i) =>
                          i === idx ? { ...item, endTime: e.target.value } : item
                        );
                        setProject((prev) => ({ ...prev, periods: newPeriods }));
                      }}
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (arr.length <= 1) return;
                      const filtered = arr
                        .filter((_, i) => i !== idx)
                        .map((item, i) => ({ ...item, period: i + 1 }));
                      setProject((prev) => ({ ...prev, periods: filtered }));
                    }}
                    disabled={arr.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Óra törlése"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center border-t border-slate-100 pt-4">
            <button
              onClick={() => {
                setProject((prev) => ({ ...prev, periods: DEFAULT_PERIODS }));
              }}
              className="flex items-center space-x-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Alapértelmezett csengetési rend visszaállítása</span>
            </button>

            <span className="text-xs text-emerald-600 font-bold">
              ✓ Automatikusan mentve a projektbe
            </span>
          </div>
        </div>
      )}

      {subTab === 'teachers' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tanárok kezelése</h2>
              <p className="text-slate-500 text-sm">Állítsd be a tantestület tagjait, óraszám korlátaikat és elérhetőségüket.</p>
            </div>
            <button
              onClick={() => setEditingTeacher({ name: '', shortCode: '', color: '#3b82f6', maxDailyHours: 6 })}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Új tanár hozzáadása</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: teacher.color }}
                    >
                      {teacher.shortCode}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{teacher.name}</h3>
                      <p className="text-xs text-slate-500">Max {teacher.maxDailyHours} óra/nap</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingTeacher(teacher)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTeacher(teacher.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {teacher.unavailableSlots && teacher.unavailableSlots.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Nem elérhető: </span>
                    {teacher.unavailableSlots.map((u, idx) => (
                      <span key={idx} className="inline-block bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded mr-1 mb-1">
                        {DAYS_HUNGARIAN[u.day]} {u.period}. óra
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'classes' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Osztályok kezelése</h2>
              <p className="text-slate-500 text-sm">Vegyél fel új osztályokat és határozd meg évfolyamaikat.</p>
            </div>
            <button
              onClick={() => setEditingClass({ name: '', grade: 5, color: '#06b6d4' })}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Új osztály</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {project.classes.map((cls) => (
              <div key={cls.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                    style={{ backgroundColor: cls.color }}
                  >
                    {cls.name}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{cls.name}</h3>
                    <p className="text-xs text-slate-500">{cls.grade}. évfolyam</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingClass(cls)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'subjects' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Tantárgyak kezelése</h2>
              <p className="text-slate-500 text-sm">Hozz létre tantárgyakat és rendelj hozzájuk színeket.</p>
            </div>
            <button
              onClick={() => setEditingSubject({ name: '', shortCode: '', color: '#10b981' })}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Új tantárgy</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {project.subjects.map((subj) => (
              <div key={subj.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm"
                    style={{ backgroundColor: subj.color }}
                  >
                    {subj.shortCode}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{subj.name}</h3>
                    <p className="text-xs text-slate-500">Rövidítés: {subj.shortCode}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setEditingSubject(subj)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subj.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subTab === 'curriculum' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Óraterv és Tanár beosztás</h2>
              <p className="text-slate-500 text-sm">Állítsd be, hogy melyik osztálynak miből hány heti órája van, és ki a tanára.</p>
            </div>
            <button
              onClick={() =>
                setEditingCurr({
                  classId: project.classes[0]?.id || '',
                  subjectId: project.subjects[0]?.id || '',
                  teacherId: project.teachers[0]?.id || '',
                  weeklyHours: 4,
                })
              }
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Új tantárgy beosztás</span>
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-slate-700 font-semibold">
                <tr>
                  <th className="px-6 py-3.5 text-left">Osztály</th>
                  <th className="px-6 py-3.5 text-left">Tantárgy</th>
                  <th className="px-6 py-3.5 text-left">Oktató</th>
                  <th className="px-6 py-3.5 text-center">Heti óraszám</th>
                  <th className="px-6 py-3.5 text-right">Műveletek</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {project.curriculum.map((curr) => {
                  const cls = project.classes.find((c) => c.id === curr.classId);
                  const subj = project.subjects.find((s) => s.id === curr.subjectId);
                  const teacher = project.teachers.find((t) => t.id === curr.teacherId);

                  return (
                    <tr key={curr.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3 font-bold text-slate-900">
                        <div className="flex items-center space-x-1.5">
                          <span>{cls?.name || curr.classId}</span>
                          {curr.isJoint && curr.jointClassIds && curr.jointClassIds.length > 0 && (
                            <span
                              className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded-full border border-purple-200 flex items-center space-x-1"
                              title={`Összevont óra a következő osztályokkal: ${curr.jointClassIds
                                .map((cid) => project.classes.find((c) => c.id === cid)?.name || cid)
                                .join(', ')}`}
                            >
                              <Link2 className="w-2.5 h-2.5" />
                              <span>
                                +
                                {curr.jointClassIds
                                  .map((cid) => project.classes.find((c) => c.id === cid)?.name || cid)
                                  .join(', ')}
                              </span>
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subj?.color || '#ccc' }}
                          ></span>
                          <span className="font-medium text-slate-800">{subj?.name || curr.subjectId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{ backgroundColor: teacher?.color || '#999' }}
                          >
                            {teacher?.shortCode}
                          </span>
                          <span className="text-slate-700">{teacher?.name || curr.teacherId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-center font-bold text-indigo-600">{curr.weeklyHours} óra</td>
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setEditingCurr(curr)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCurriculum(curr.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'constraints' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Egyedi Kötöttségek és Szabályok</h2>
              <p className="text-slate-500 text-sm">Állíts be specifikus tiltásokat (pl. ne legyen matek az 1. órában egy adott osztálynak).</p>
            </div>
            <button
              onClick={() =>
                setEditingConstraint({
                  title: '',
                  type: 'NO_SUBJECT_PERIOD',
                  priority: 'HARD',
                })
              }
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm shadow transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Új szabály hozzáadása</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.constraints.map((c) => {
              const cls = project.classes.find((item) => item.id === c.classId);
              const subj = project.subjects.find((item) => item.id === c.subjectId);

              return (
                <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span
                        className={`text-xs px-2 py-0.5 font-bold rounded ${
                          c.priority === 'HARD' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {c.priority === 'HARD' ? 'Kötelező Korlát' : 'Ajánlás'}
                      </span>
                      <h3 className="font-bold text-slate-900">{c.title}</h3>
                    </div>
                    <p className="text-xs text-slate-500">
                      Feltétel: {cls ? `${cls.name} osztály ` : ''}
                      {subj ? `${subj.name} ` : ''}
                      {c.period ? `${c.period}. óra` : ''}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setEditingConstraint(c)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteConstraint(c.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-slate-100 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Teacher Edit Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingTeacher.id ? 'Oktató szerkesztése' : 'Új oktató felvitele'}
              </h3>
              <button onClick={() => setEditingTeacher(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Oktató Teljes Neve</label>
                <input
                  type="text"
                  value={editingTeacher.name || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, name: e.target.value })}
                  placeholder="pl. Kovács János"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Monogram / Rövidítés</label>
                <input
                  type="text"
                  value={editingTeacher.shortCode || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, shortCode: e.target.value })}
                  placeholder="pl. KJ"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Oktató Színe</label>
                <input
                  type="color"
                  value={editingTeacher.color || '#3b82f6'}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, color: e.target.value })}
                  className="w-full h-10 p-1 border border-slate-300 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Max Napi Óraszám</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={editingTeacher.maxDailyHours || 6}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, maxDailyHours: parseInt(e.target.value, 10) || 6 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingTeacher(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={() => handleSaveTeacher(editingTeacher)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow cursor-pointer"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Edit Modal */}
      {editingClass && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingClass.id ? 'Osztály szerkesztése' : 'Új osztály felvitele'}
              </h3>
              <button onClick={() => setEditingClass(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Osztály Megnevezése</label>
                <input
                  type="text"
                  value={editingClass.name || ''}
                  onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                  placeholder="pl. 1.o, 4.o vagy 5.a"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Évfolyam (1-12)</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={editingClass.grade || 5}
                  onChange={(e) => setEditingClass({ ...editingClass, grade: parseInt(e.target.value, 10) || 5 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Osztály Színe</label>
                <input
                  type="color"
                  value={editingClass.color || '#06b6d4'}
                  onChange={(e) => setEditingClass({ ...editingClass, color: e.target.value })}
                  className="w-full h-10 p-1 border border-slate-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingClass(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={() => handleSaveClass(editingClass)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow cursor-pointer"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Edit Modal */}
      {editingSubject && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingSubject.id ? 'Tantárgy szerkesztése' : 'Új tantárgy felvitele'}
              </h3>
              <button onClick={() => setEditingSubject(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tantárgy neve</label>
                <input
                  type="text"
                  value={editingSubject.name || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, name: e.target.value })}
                  placeholder="pl. Matematika"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Rövidítés</label>
                <input
                  type="text"
                  value={editingSubject.shortCode || ''}
                  onChange={(e) => setEditingSubject({ ...editingSubject, shortCode: e.target.value })}
                  placeholder="pl. MAT"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tantárgy Színe</label>
                <input
                  type="color"
                  value={editingSubject.color || '#10b981'}
                  onChange={(e) => setEditingSubject({ ...editingSubject, color: e.target.value })}
                  className="w-full h-10 p-1 border border-slate-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingSubject(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={() => handleSaveSubject(editingSubject)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow cursor-pointer"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Curriculum Edit Modal */}
      {editingCurr && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Tantárgyi Óraszám Beosztás</h3>
              <button onClick={() => setEditingCurr(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fő Osztály</label>
                <select
                  value={editingCurr.classId || ''}
                  onChange={(e) => setEditingCurr({ ...editingCurr, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {project.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tantárgy</label>
                <select
                  value={editingCurr.subjectId || ''}
                  onChange={(e) => setEditingCurr({ ...editingCurr, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {project.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Oktató Tanár</label>
                <select
                  value={editingCurr.teacherId || ''}
                  onChange={(e) => setEditingCurr({ ...editingCurr, teacherId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  {project.teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.shortCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Heti Óraszám</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={editingCurr.weeklyHours || 4}
                  onChange={(e) => setEditingCurr({ ...editingCurr, weeklyHours: parseInt(e.target.value, 10) || 1 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 🔗 Összevont óra kapcsoló a tantervben */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingCurr.isJoint || false}
                    onChange={(e) => {
                      setEditingCurr({
                        ...editingCurr,
                        isJoint: e.target.checked,
                        jointClassIds: e.target.checked ? (editingCurr.jointClassIds || []) : [],
                      });
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-purple-900 flex items-center space-x-1">
                    <Link2 className="w-3.5 h-3.5 text-purple-600" />
                    <span>Összevont óra (más osztállyal közös)</span>
                  </span>
                </label>

                {editingCurr.isJoint && (
                  <div className="pt-2 border-t border-purple-200 space-y-1.5">
                    <div className="text-[11px] font-bold text-purple-800">
                      Válaszd ki a többi közös osztályt:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {project.classes
                        .filter((c) => c.id !== editingCurr.classId)
                        .map((c) => {
                          const currentJoint = editingCurr.jointClassIds || [];
                          const isSelected = currentJoint.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                const next = isSelected
                                  ? currentJoint.filter((id) => id !== c.id)
                                  : [...currentJoint, c.id];
                                setEditingCurr({ ...editingCurr, jointClassIds: next });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1 ${
                                isSelected
                                  ? 'bg-purple-600 text-white border-purple-600'
                                  : 'bg-white text-slate-700 border-purple-200 hover:border-purple-400'
                              }`}
                            >
                              <span>{c.name}</span>
                              {isSelected && <span>✓</span>}
                            </button>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingCurr(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={() => handleSaveCurriculum(editingCurr)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow cursor-pointer"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Constraint Edit Modal */}
      {editingConstraint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingConstraint.id ? 'Kötöttség szerkesztése' : 'Új kötöttség felvitele'}
              </h3>
              <button onClick={() => setEditingConstraint(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Szabály leírása</label>
                <input
                  type="text"
                  value={editingConstraint.title || ''}
                  onChange={(e) => setEditingConstraint({ ...editingConstraint, title: e.target.value })}
                  placeholder="pl. 5.A-ban az 1. órában ne legyen Matematika"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Érintett Osztály</label>
                <select
                  value={editingConstraint.classId || ''}
                  onChange={(e) => setEditingConstraint({ ...editingConstraint, classId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Mindegyik osztály</option>
                  {project.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Érintett Tantárgy</label>
                <select
                  value={editingConstraint.subjectId || ''}
                  onChange={(e) => setEditingConstraint({ ...editingConstraint, subjectId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Mindegyik tantárgy</option>
                  {project.subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tiltott Óra száma</label>
                <input
                  type="number"
                  min={1}
                  max={8}
                  value={editingConstraint.period || 1}
                  onChange={(e) =>
                    setEditingConstraint({ ...editingConstraint, period: parseInt(e.target.value, 10) || 1 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingConstraint(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Mégse
              </button>
              <button
                onClick={() => handleSaveConstraint(editingConstraint)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow"
              >
                Mentés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
