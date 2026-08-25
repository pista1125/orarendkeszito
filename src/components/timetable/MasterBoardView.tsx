import React, { useState, useMemo, useEffect } from 'react';
import {
  Lock,
  Unlock,
  Trash2,
  AlertTriangle,
  Plus,
  Filter,
  Eye,
  Sparkles,
  ChevronDown,
  BookOpen,
  Clock,
  Maximize2,
  Minimize2,
  Link2,
} from 'lucide-react';
import type {
  TimetableProject,
  TimetableSlot,
  DayOfWeek,
  Conflict,
  ClassGroup,
} from '../../types/timetable';
import { DAYS_HUNGARIAN, DEFAULT_PERIODS } from '../../types/timetable';
import type { CurriculumProgress } from '../../services/conflictChecker';
import { calculateCurriculumProgress } from '../../services/conflictChecker';
import { BellScheduleModal } from './BellScheduleModal';

interface MasterBoardViewProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
  conflicts: Conflict[];
  onOpenGenerator: () => void;
  highlightTeacherId: string;
  setHighlightTeacherId: (id: string) => void;
  highlightSubjectId: string;
  setHighlightSubjectId: (id: string) => void;
}

export const MasterBoardView: React.FC<MasterBoardViewProps> = ({
  project,
  setProject,
  conflicts,
  onOpenGenerator,
  highlightTeacherId,
  setHighlightTeacherId,
  highlightSubjectId,
  setHighlightSubjectId,
}) => {
  // Density: 'compact' | 'normal' | 'spacious'
  const [cellDensity, setCellDensity] = useState<'compact' | 'normal' | 'spacious'>('normal');

  // Max visible periods selector: 6, 7, or 8 (default 8)
  const [maxPeriodVisible, setMaxPeriodVisible] = useState<number>(8);

  // Selected classes filter (default all)
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>(() =>
    project.classes.map((c) => c.id)
  );

  const [isClassFilterOpen, setIsClassFilterOpen] = useState(false);

  // Quick slot assign modal
  const [activeSlotTarget, setActiveSlotTarget] = useState<{
    day: DayOfWeek;
    period: number;
    classId: string;
  } | null>(null);

  // Quick slot assign joint state
  const [isJointAssign, setIsJointAssign] = useState<boolean>(false);
  const [selectedJointClassIds, setSelectedJointClassIds] = useState<string[]>([]);
  const [assignTab, setAssignTab] = useState<'curriculum' | 'custom'>('curriculum');
  const [customSubjectId, setCustomSubjectId] = useState<string>('');
  const [customTeacherId, setCustomTeacherId] = useState<string>('');
  const [customRoomId, setCustomRoomId] = useState<string>('');

  // Hovered joint slot for cross-column link highlighting
  const [hoveredJointSlotId, setHoveredJointSlotId] = useState<string | null>(null);

  // Drag and drop state
  const [draggedItem, setDraggedItem] = useState<{
    type: 'pool' | 'slot';
    id: string; // curriculumId or slotId
    sourceClassId?: string;
  } | null>(null);

  const [dragOverCell, setDragOverCell] = useState<{
    day: DayOfWeek;
    period: number;
    classId: string;
  } | null>(null);

  // Quick new class modal
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassGrade, setNewClassGrade] = useState(5);
  const [newClassColor, setNewClassColor] = useState('#3b82f6');

  // Clear all slots modal
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [clearMode, setClearMode] = useState<'unlocked' | 'all'>('unlocked');

  // Bell Schedule Modal
  const [isBellScheduleOpen, setIsBellScheduleOpen] = useState(false);

  // Fullscreen Mode
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        }
      }
    };
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  const toggleFullscreen = async () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Fullscreen API may not be permitted in iframe/browser context, fallback to React state
      }
    } else {
      setIsFullscreen(false);
      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch {
        // ignore
      }
    }
  };

  const handleClearSlots = () => {
    if (clearMode === 'unlocked') {
      setProject((prev) => ({
        ...prev,
        slots: prev.slots.filter((s) => s.isLocked),
      }));
    } else {
      setProject((prev) => ({
        ...prev,
        slots: [],
      }));
    }
    setIsClearModalOpen(false);
  };

  // Curriculum progress
  const progressList: CurriculumProgress[] = useMemo(
    () => calculateCurriculumProgress(project.curriculum, project.slots),
    [project.curriculum, project.slots]
  );

  // Visible classes
  const visibleClasses = useMemo(() => {
    const active = project.classes.filter((c) => selectedClassIds.includes(c.id));
    return active.length > 0 ? active : project.classes;
  }, [project.classes, selectedClassIds]);

  // All and visible periods from project or default
  const allPeriods = project.periods && project.periods.length > 0
    ? project.periods
    : DEFAULT_PERIODS;

  const visiblePeriods = useMemo(() => {
    return allPeriods.filter((p) => p.period <= maxPeriodVisible);
  }, [allPeriods, maxPeriodVisible]);

  // Handle slot locking
  const handleToggleLock = (slotId: string) => {
    setProject((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === slotId ? { ...s, isLocked: !s.isLocked } : s)),
    }));
  };

  // Handle slot delete (removes linked joint slots as well)
  const handleRemoveSlot = (slotId: string, removeAllJoint: boolean = true) => {
    setProject((prev) => {
      const targetSlot = prev.slots.find((s) => s.id === slotId);
      if (targetSlot && targetSlot.isJoint && targetSlot.jointSlotId && removeAllJoint) {
        return {
          ...prev,
          slots: prev.slots.filter((s) => s.jointSlotId !== targetSlot.jointSlotId),
        };
      }
      return {
        ...prev,
        slots: prev.slots.filter((s) => s.id !== slotId),
      };
    });
  };

  // Assign slot (supports joint assignment across multiple classes)
  const handleAssignSlot = (
    day: DayOfWeek,
    period: number,
    classId: string,
    subjectId: string,
    teacherId: string,
    roomId?: string,
    groupName?: string,
    isJoint?: boolean,
    jointWithClassIds?: string[]
  ) => {
    const allClassIds = isJoint && jointWithClassIds && jointWithClassIds.length > 0
      ? Array.from(new Set([classId, ...jointWithClassIds]))
      : [classId];

    const isActuallyJoint = allClassIds.length > 1;
    const jointSlotId = isActuallyJoint
      ? `joint-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      : undefined;

    const newSlots: TimetableSlot[] = allClassIds.map((cId) => ({
      id: `slot-${Date.now()}-${cId}-${Math.random().toString(36).substr(2, 5)}`,
      day,
      period,
      classId: cId,
      subjectId,
      teacherId,
      roomId,
      groupName,
      isLocked: false,
      isJoint: isActuallyJoint,
      jointSlotId,
      jointClassIds: isActuallyJoint ? allClassIds : undefined,
    }));

    setProject((prev) => ({
      ...prev,
      slots: [...prev.slots, ...newSlots],
    }));

    setActiveSlotTarget(null);
    setIsJointAssign(false);
    setSelectedJointClassIds([]);
    setCustomSubjectId('');
    setCustomTeacherId('');
    setCustomRoomId('');
  };

  // Drag handlers
  const handleDragStartFromSlot = (e: React.DragEvent, slot: TimetableSlot) => {
    setDraggedItem({ type: 'slot', id: slot.id, sourceClassId: slot.classId });
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ type: 'slot', slotId: slot.id })
    );
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, day: DayOfWeek, period: number, classId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (
      !dragOverCell ||
      dragOverCell.day !== day ||
      dragOverCell.period !== period ||
      dragOverCell.classId !== classId
    ) {
      setDragOverCell({ day, period, classId });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDropOnCell = (
    e: React.DragEvent,
    day: DayOfWeek,
    period: number,
    targetClassId: string
  ) => {
    e.preventDefault();
    setDragOverCell(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json') || e.dataTransfer.getData('text/plain');
      let dragData: { type?: string; curriculumId?: string; slotId?: string } = {};

      if (dataStr) {
        try {
          dragData = JSON.parse(dataStr);
        } catch {
          // If plain string, fallback to curriculumId
          dragData = { type: 'pool', curriculumId: dataStr };
        }
      } else if (draggedItem) {
        dragData = draggedItem.type === 'pool'
          ? { type: 'pool', curriculumId: draggedItem.id }
          : { type: 'slot', slotId: draggedItem.id };
      }

      if (dragData.type === 'slot' && dragData.slotId) {
        const movingSlot = project.slots.find((s) => s.id === dragData.slotId);
        if (!movingSlot) return;

        // If it's a joint slot, move ALL linked class slots to the new day & period!
        if (movingSlot.isJoint && movingSlot.jointSlotId) {
          setProject((prev) => ({
            ...prev,
            slots: prev.slots.map((s) =>
              s.jointSlotId === movingSlot.jointSlotId
                ? { ...s, day, period }
                : s
            ),
          }));
        } else {
          // Regular single slot move
          setProject((prev) => ({
            ...prev,
            slots: prev.slots.map((s) =>
              s.id === dragData.slotId
                ? { ...s, day, period, classId: targetClassId }
                : s
            ),
          }));
        }
      } else if (dragData.curriculumId || (dragData.type === 'pool' && draggedItem?.id)) {
        const currId = dragData.curriculumId || draggedItem?.id;
        const curr = project.curriculum.find((c) => c.id === currId);
        if (curr) {
          handleAssignSlot(
            day,
            period,
            targetClassId,
            curr.subjectId,
            curr.teacherId,
            curr.roomId,
            undefined,
            curr.isJoint,
            curr.jointClassIds
          );
        }
      }
    } finally {
      setDraggedItem(null);
    }
  };

  // Get conflicts for cell
  const getSlotConflicts = (day: DayOfWeek, period: number, classId: string, slotId?: string) => {
    return conflicts.filter((c) => {
      if (c.day !== day || c.period !== period) return false;
      if (slotId) {
        return c.involvedSlotIds.includes(slotId);
      }
      const involvedSlots = project.slots.filter((s) => c.involvedSlotIds.includes(s.id));
      return involvedSlots.some((s) => s.classId === classId);
    });
  };

  // Check teacher availability status for quick assign
  const getTeacherStatus = (teacherId: string, day: DayOfWeek, period: number) => {
    const teacher = project.teachers.find((t) => t.id === teacherId);
    if (!teacher) return { available: true, message: 'Elérhető' };

    const isUnavailable = teacher.unavailableSlots?.some(
      (u) => u.day === day && u.period === period
    );
    if (isUnavailable) {
      return { available: false, message: 'Nem ér rá ekkor (Nem elérhető időpont)' };
    }

    const existingSlot = project.slots.find(
      (s) => s.teacherId === teacherId && s.day === day && s.period === period
    );
    if (existingSlot) {
      const cls = project.classes.find((c) => c.id === existingSlot.classId);
      return {
        available: false,
        message: `Foglalt! Ekkor már a(z) ${cls?.name || 'másik'} osztályban tanít.`,
      };
    }

    return { available: true, message: 'Szabad' };
  };

  // Add new class quickly
  const handleAddNewClass = () => {
    if (!newClassName.trim()) return;
    const newId = `c-${Date.now()}`;
    const newClass: ClassGroup = {
      id: newId,
      name: newClassName.trim(),
      grade: Number(newClassGrade) || 5,
      color: newClassColor,
    };

    setProject((prev) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));

    setSelectedClassIds((prev) => [...prev, newId]);
    setNewClassName('');
    setIsAddClassModalOpen(false);
  };

  // Presets for class filter
  const applyClassPreset = (preset: 'all' | '4-8' | '5-8' | '1-4') => {
    if (preset === 'all') {
      setSelectedClassIds(project.classes.map((c) => c.id));
    } else if (preset === '4-8') {
      setSelectedClassIds(
        project.classes.filter((c) => c.grade >= 4 && c.grade <= 8).map((c) => c.id)
      );
    } else if (preset === '5-8') {
      setSelectedClassIds(
        project.classes.filter((c) => c.grade >= 5 && c.grade <= 8).map((c) => c.id)
      );
    } else if (preset === '1-4') {
      setSelectedClassIds(
        project.classes.filter((c) => c.grade >= 1 && c.grade <= 4).map((c) => c.id)
      );
    }
    setIsClassFilterOpen(false);
  };

  // Density styles
  const cellHeightClass =
    cellDensity === 'compact'
      ? 'min-h-[58px] p-1'
      : cellDensity === 'spacious'
      ? 'min-h-[96px] p-2.5'
      : 'min-h-[76px] p-1.5';

  return (
    <div
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-950 p-3 sm:p-5 overflow-y-auto overflow-x-auto space-y-4 animate-in fade-in duration-150'
          : 'space-y-6'
      }
    >
      {/* Fullscreen top header banner (only in fullscreen) */}
      {isFullscreen && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-black text-base sm:text-lg text-white">
                  {project.schoolName}
                </h2>
                <span className="text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                  🌟 Teljes Képernyős Mester Mátrix
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {project.academicYear} • {project.semester || 'I. Félév'} • {project.name}
              </p>
            </div>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-400/20 transition-all cursor-pointer"
            title="Kilépés a teljes képernyős nézetből (vagy nyomj Esc-et)"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Kilépés (Esc)</span>
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Class Filters & Period Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Class Column Filter */}
          <div className="relative">
            <button
              onClick={() => setIsClassFilterOpen(!isClassFilterOpen)}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Osztály oszlopok ({visibleClasses.length}/{project.classes.length})
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {isClassFilterOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 p-3 space-y-3 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-xs text-slate-900">Megjelenített Osztályok</span>
                  <button
                    onClick={() => setIsAddClassModalOpen(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Új osztály</span>
                  </button>
                </div>

                {/* Quick Presets */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
                  <button
                    onClick={() => applyClassPreset('all')}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    ✨ Mind ({project.classes.length})
                  </button>
                  <button
                    onClick={() => applyClassPreset('4-8')}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    🏫 4–8. osztályok
                  </button>
                  <button
                    onClick={() => applyClassPreset('5-8')}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    🎓 5–8. felső tagozat
                  </button>
                  <button
                    onClick={() => applyClassPreset('1-4')}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 transition-colors text-left cursor-pointer"
                  >
                    🎒 1–4. alsó tagozat
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1 border-t border-slate-100 pt-2">
                  {project.classes.map((cls) => {
                    const isChecked = selectedClassIds.includes(cls.id);
                    return (
                      <label
                        key={cls.id}
                        className="flex items-center space-x-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClassIds((prev) => [...prev, cls.id]);
                            } else {
                              if (selectedClassIds.length > 1) {
                                setSelectedClassIds((prev) => prev.filter((id) => id !== cls.id));
                              }
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: cls.color }}
                        ></span>
                        <span className="text-slate-800 font-bold">{cls.name}</span>
                        <span className="text-slate-400 text-[11px]">({cls.grade}. évf.)</span>
                      </label>
                    );
                  })}
                </div>

                <button
                  onClick={() => setIsClassFilterOpen(false)}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Alkalmaz
                </button>
              </div>
            )}
          </div>

          {/* Max Periods Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/80 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 px-2">Óraszám:</span>
            {[6, 7, 8].map((p) => (
              <button
                key={p}
                onClick={() => setMaxPeriodVisible(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  maxPeriodVisible === p
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1–{p}. óra
              </button>
            ))}
          </div>

          {/* Bell Schedule Button */}
          <button
            onClick={() => setIsBellScheduleOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-300/80 dark:border-slate-700 shadow-xs transition-all cursor-pointer"
            title="Csengetési rend és óra kezdési/befejezési időpontok beállítása"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>Csengetési Rend</span>
          </button>

          {/* Density Toggle */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/80 dark:border-slate-700">
            <button
              onClick={() => setCellDensity('compact')}
              title="Kompakt nézet (sűrűbb, teljes hét egyben)"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cellDensity === 'compact'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Kompakt
            </button>
            <button
              onClick={() => setCellDensity('normal')}
              title="Normál nézet"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cellDensity === 'normal'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Normál
            </button>
            <button
              onClick={() => setCellDensity('spacious')}
              title="Tágas nézet"
              className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cellDensity === 'spacious'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Tágas
            </button>
          </div>
        </div>

        {/* Right: Fullscreen, Highlight & Clear/Auto buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Fullscreen toggle button */}
          <button
            onClick={toggleFullscreen}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isFullscreen
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 shadow-xs'
            }`}
            title={isFullscreen ? 'Kilépés a teljes képernyőből (Esc)' : 'Teljes képernyős mód bekapcsolása'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Kilépés (Esc)</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Teljes Képernyő</span>
              </>
            )}
          </button>

          {/* Teacher highlighter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <Eye className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tanár:</label>
            <select
              value={highlightTeacherId}
              onChange={(e) => setHighlightTeacherId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="text-slate-900">(Nincs)</option>
              {project.teachers.map((t) => (
                <option key={t.id} value={t.id} className="text-slate-900">
                  {t.name} ({t.shortCode})
                </option>
              ))}
            </select>
            {highlightTeacherId && (
              <button
                onClick={() => setHighlightTeacherId('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold ml-1 cursor-pointer"
                title="Kiemelés törlése"
              >
                ✕
              </button>
            )}
          </div>

          {/* Subject highlighter */}
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl">
            <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tantárgy:</label>
            <select
              value={highlightSubjectId}
              onChange={(e) => setHighlightSubjectId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="" className="text-slate-900">(Nincs)</option>
              {project.subjects.map((s) => (
                <option key={s.id} value={s.id} className="text-slate-900">
                  {s.shortCode || s.name}
                </option>
              ))}
            </select>
            {highlightSubjectId && (
              <button
                onClick={() => setHighlightSubjectId('')}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold ml-1 cursor-pointer"
                title="Kiemelés törlése"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsClearModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all cursor-pointer"
            title="Összes elhelyezett óra törlése az órarendből"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Összes Törlése</span>
          </button>

          <button
            onClick={onOpenGenerator}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto Elhelyezés</span>
          </button>
        </div>
      </div>

      {/* Main Board Visual Frame (Styled like the physical magnetic wall board) */}
      <div className="bg-[#e8dec8] dark:bg-slate-950 p-2 sm:p-4 rounded-3xl border-4 border-[#b89f78] dark:border-slate-800 shadow-2xl overflow-x-auto relative">
        <table className="w-full border-collapse min-w-[900px] select-none bg-[#fdfbf7] dark:bg-slate-900 rounded-2xl overflow-hidden border border-amber-900/20 shadow-inner">
          {/* Header Row: Classes */}
          <thead>
            <tr className="bg-[#dcd0b8] dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b-2 border-amber-900/30">
              {/* Top-Left: Days label */}
              <th
                colSpan={2}
                onClick={() => setIsBellScheduleOpen(true)}
                className="p-3 text-center text-xs font-black tracking-widest uppercase border-r-2 border-amber-900/30 w-36 bg-[#cfc2a5] dark:bg-slate-850 cursor-pointer group"
                title="Kattints a csengetési rend módosításához"
              >
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black tracking-widest text-slate-900 dark:text-white group-hover:text-indigo-700 transition-colors">
                    NAPOK
                  </span>
                  <div className="flex items-center space-x-1 text-[10px] font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Clock className="w-3 h-3 text-indigo-600" />
                    <span>Órák (Időpontok)</span>
                  </div>
                </div>
              </th>

              {/* Class Columns */}
              {visibleClasses.map((cls) => (
                <th
                  key={cls.id}
                  className="p-3 text-center border-r border-amber-900/20 last:border-r-0 min-w-[130px]"
                >
                  <div className="flex items-center justify-center space-x-2 py-0.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs shrink-0"
                      style={{ backgroundColor: cls.color }}
                    ></span>
                    <span className="text-xl font-black tracking-wide text-slate-950 dark:text-white">
                      {cls.name}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body: Days & Periods */}
          <tbody>
            {DAYS_HUNGARIAN.map((dayName, dayIdx) => {
              const day = dayIdx as DayOfWeek;

              return (
                <React.Fragment key={dayIdx}>
                  {visiblePeriods.map((periodConfig, pIdx) => {
                    const period = periodConfig.period;
                    const isFirstPeriodOfDay = pIdx === 0;

                    return (
                      <tr
                        key={`${day}-${period}`}
                        className={`border-b ${
                          pIdx === visiblePeriods.length - 1
                            ? 'border-b-4 border-amber-900/40'
                            : 'border-amber-900/15'
                        } hover:bg-amber-50/40 dark:hover:bg-slate-800/40 transition-colors`}
                      >
                        {/* Day Label Header (Spans all period rows for this day) */}
                        {isFirstPeriodOfDay && (
                          <td
                            rowSpan={visiblePeriods.length}
                            className="bg-[#cfc2a5] dark:bg-slate-850 border-r-2 border-amber-900/30 p-2 text-center align-middle w-24 select-none"
                          >
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-black text-base sm:text-lg tracking-widest uppercase text-slate-900 dark:text-white writing-mode-vertical sm:writing-mode-horizontal py-2">
                                {dayName}
                              </span>
                            </div>
                          </td>
                        )}

                        {/* Period Index Cell */}
                        <td className="w-12 p-1.5 text-center bg-[#eae1ce] dark:bg-slate-800/70 border-r-2 border-amber-900/30 text-slate-800 dark:text-slate-200">
                          <div className="font-black text-sm">{period}.</div>
                          <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
                            {periodConfig.startTime}
                          </div>
                        </td>

                        {/* Class Cells for this Day & Period */}
                        {visibleClasses.map((cls) => {
                          const slotsInCell = project.slots.filter(
                            (s) => s.classId === cls.id && s.day === day && s.period === period
                          );

                          const isDragTarget =
                            dragOverCell?.day === day &&
                            dragOverCell?.period === period &&
                            dragOverCell?.classId === cls.id;

                          const cellConflicts = getSlotConflicts(day, period, cls.id);
                          const hasErrorConflict = cellConflicts.some((c) => c.severity === 'ERROR');

                          return (
                            <td
                              key={cls.id}
                              onDragOver={(e) => handleDragOver(e, day, period, cls.id)}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDropOnCell(e, day, period, cls.id)}
                              className={`border-r border-amber-900/15 last:border-r-0 relative transition-all ${cellHeightClass} ${
                                isDragTarget
                                  ? 'bg-indigo-100/90 ring-2 ring-indigo-500 ring-inset'
                                  : hasErrorConflict
                                  ? 'bg-red-50/90 ring-2 ring-red-400 ring-inset'
                                  : 'bg-transparent'
                              }`}
                            >
                              {slotsInCell.length > 0 ? (
                                <div className="flex flex-col gap-1 h-full justify-center">
                                  {slotsInCell.map((slot) => {
                                    const subj = project.subjects.find(
                                      (s) => s.id === slot.subjectId
                                    );
                                    const teacher = project.teachers.find(
                                      (t) => t.id === slot.teacherId
                                    );
                                    const room = project.rooms.find((r) => r.id === slot.roomId);

                                    const isHighlightedTeacher =
                                      highlightTeacherId && slot.teacherId === highlightTeacherId;
                                    const isHighlightedSubj =
                                      highlightSubjectId && slot.subjectId === highlightSubjectId;
                                    const isDimmed =
                                      (highlightTeacherId && !isHighlightedTeacher) ||
                                      (highlightSubjectId && !isHighlightedSubj);
                                    const slotConflicts = getSlotConflicts(
                                      day,
                                      period,
                                      cls.id,
                                      slot.id
                                    );
                                    const hasSlotError = slotConflicts.some(
                                      (c) => c.severity === 'ERROR'
                                    );

                                    const isLinkedHovered = Boolean(
                                      slot.isJoint &&
                                      slot.jointSlotId &&
                                      hoveredJointSlotId === slot.jointSlotId
                                    );

                                    const otherJointClassNames =
                                      slot.isJoint && slot.jointClassIds
                                        ? slot.jointClassIds
                                            .filter((cid) => cid !== slot.classId)
                                            .map(
                                              (cid) =>
                                                project.classes.find((c) => c.id === cid)?.name ||
                                                cid
                                            )
                                        : [];

                                    return (
                                      <div
                                        key={slot.id}
                                        draggable={!slot.isLocked}
                                        onDragStart={(e) => handleDragStartFromSlot(e, slot)}
                                        onMouseEnter={() =>
                                          slot.jointSlotId && setHoveredJointSlotId(slot.jointSlotId)
                                        }
                                        onMouseLeave={() => setHoveredJointSlotId(null)}
                                        className={`rounded-lg p-1.5 flex flex-col justify-between text-white shadow-xs relative group cursor-grab active:cursor-grabbing transition-all transform hover:-translate-y-0.5 ${
                                          isDimmed ? 'opacity-35 grayscale-25 scale-98' : 'opacity-100'
                                        } ${
                                          isHighlightedTeacher
                                            ? 'ring-3 ring-amber-400 ring-offset-1 shadow-lg scale-102 z-10'
                                            : ''
                                        } ${
                                          isLinkedHovered
                                            ? 'ring-3 ring-purple-400 ring-offset-1 shadow-xl shadow-purple-500/50 scale-102 z-30'
                                            : ''
                                        } ${
                                          hasSlotError
                                            ? 'ring-2 ring-red-500 animate-pulse'
                                            : ''
                                        }`}
                                        style={{
                                          backgroundColor: subj?.color || '#3b82f6',
                                        }}
                                      >
                                        {/* Card Top: Subject Name & Actions */}
                                        <div className="flex items-center justify-between border-b border-white/20 pb-0.5 gap-1">
                                          <span
                                            className="font-black text-xs tracking-tight truncate drop-shadow-xs"
                                            title={subj?.name}
                                          >
                                            {subj?.shortCode || subj?.name}
                                          </span>

                                          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleToggleLock(slot.id);
                                              }}
                                              className="p-0.5 rounded hover:bg-black/20 text-white"
                                              title={slot.isLocked ? 'Zárolva' : 'Zárolás'}
                                            >
                                              {slot.isLocked ? (
                                                <Lock className="w-2.5 h-2.5 text-amber-300" />
                                              ) : (
                                                <Unlock className="w-2.5 h-2.5 opacity-70" />
                                              )}
                                            </button>

                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleRemoveSlot(slot.id, true);
                                              }}
                                              className="p-0.5 rounded hover:bg-black/30 text-white hover:text-red-200"
                                              title={
                                                slot.isJoint
                                                  ? 'Összevont óra eltávolítása az összes érintett osztályból'
                                                  : 'Eltávolítás az órarendből'
                                              }
                                            >
                                              <Trash2 className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Joint / Merged class indicator badge */}
                                        {slot.isJoint && (
                                          <div
                                            className="flex items-center space-x-1 text-[9px] bg-purple-950/80 text-purple-200 border border-purple-400/40 px-1 py-0.2 rounded font-black mt-0.5 shadow-xs"
                                            title={`Összevont óra más osztályokkal: ${otherJointClassNames.join(', ')}`}
                                          >
                                            <Link2 className="w-2.5 h-2.5 text-purple-300 shrink-0" />
                                            <span className="truncate">
                                              +{otherJointClassNames.join('+')}
                                            </span>
                                          </div>
                                        )}

                                        {/* Card Middle: Teacher & Room */}
                                        <div className="flex items-center justify-between mt-1 text-[11px] font-bold text-white/95">
                                          <span
                                            className="bg-black/25 px-1 py-0.2 rounded text-[10px] tracking-wide truncate max-w-[70px]"
                                            title={teacher?.name}
                                          >
                                            {teacher?.shortCode || teacher?.name}
                                          </span>

                                          {room && (
                                            <span
                                              className="text-[9px] bg-white/20 px-1 py-0.2 rounded"
                                              title={room.name}
                                            >
                                              {room.shortCode}
                                            </span>
                                          )}

                                          {slot.groupName && (
                                            <span className="text-[9px] bg-indigo-900/50 px-1 py-0.2 rounded">
                                              {slot.groupName}
                                            </span>
                                          )}
                                        </div>

                                        {/* Conflict alert indicator */}
                                        {slotConflicts.length > 0 && (
                                          <div
                                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white p-0.5 rounded-full shadow-lg animate-bounce z-20"
                                            title={slotConflicts.map((c) => c.message).join('\n')}
                                          >
                                            <AlertTriangle className="w-3 h-3" />
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setActiveSlotTarget({
                                      day,
                                      period,
                                      classId: cls.id,
                                    });
                                    setIsJointAssign(false);
                                    setSelectedJointClassIds([]);
                                    setAssignTab('curriculum');
                                    setCustomSubjectId(project.subjects[0]?.id || '');
                                    setCustomTeacherId(project.teachers[0]?.id || '');
                                    setCustomRoomId(project.rooms[0]?.id || '');
                                  }}
                                  className="w-full h-full min-h-[50px] rounded-lg border border-dashed border-amber-900/20 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 transition-all group"
                                  title="Óra elhelyezése ide"
                                >
                                  <Plus className="w-4 h-4 opacity-30 group-hover:opacity-100 group-hover:scale-125 transition-transform" />
                                </button>
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

      {/* Quick Slot Assign Modal */}
      {activeSlotTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>Óra Beosztása</span>
                  <span className="text-xs px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-full font-bold">
                    {DAYS_HUNGARIAN[activeSlotTarget.day]} {activeSlotTarget.period}. óra
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Kijelölt osztály:{' '}
                  <span className="font-black text-indigo-600 dark:text-indigo-400">
                    {project.classes.find((c) => c.id === activeSlotTarget.classId)?.name}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setActiveSlotTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Tab switcher: Curriculum vs Custom */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
              <button
                onClick={() => setAssignTab('curriculum')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  assignTab === 'curriculum'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                🎓 Óratervből választás
              </button>
              <button
                onClick={() => setAssignTab('custom')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  assignTab === 'custom'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                ✏️ Egyedi óra / Összevonás
              </button>
            </div>

            {/* 🔗 Összevont óra (Több osztály együtt) szekció */}
            <div className="bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-3.5 space-y-2.5">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isJointAssign}
                  onChange={(e) => {
                    setIsJointAssign(e.target.checked);
                    if (!e.target.checked) setSelectedJointClassIds([]);
                  }}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                />
                <div className="flex items-center space-x-1.5">
                  <Link2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-black text-purple-900 dark:text-purple-200">
                    🔗 Összevont óra (több osztály együttes órája egy tanárral)
                  </span>
                </div>
              </label>

              {isJointAssign && (
                <div className="pt-2 border-t border-purple-200/80 dark:border-purple-800/40 space-y-2 animate-in fade-in duration-100">
                  <div className="text-[11px] font-bold text-purple-800 dark:text-purple-300">
                    Válaszd ki a többi osztályt, akikkel együtt van ez az óra:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {project.classes
                      .filter((c) => c.id !== activeSlotTarget.classId)
                      .map((c) => {
                        const isSelected = selectedJointClassIds.includes(c.id);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedJointClassIds((prev) => prev.filter((id) => id !== c.id));
                              } else {
                                setSelectedJointClassIds((prev) => [...prev, c.id]);
                              }
                            }}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center space-x-1.5 ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-purple-200 dark:border-slate-700 hover:border-purple-400'
                            }`}
                          >
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: c.color }}
                            />
                            <span>{c.name}</span>
                            {isSelected && <span>✓</span>}
                          </button>
                        );
                      })}
                  </div>
                  <p className="text-[10px] text-purple-700 dark:text-purple-400 italic">
                    💡 Az óra egyszerre kerül elhelyezésre az összes kijelölt osztályhoz ({DAYS_HUNGARIAN[activeSlotTarget.day]} {activeSlotTarget.period}. óra). A tanárnál ez 1 tanítási órának számít és nem okoz ütközést!
                  </p>
                </div>
              )}
            </div>

            {/* Tab 1: Curriculum list */}
            {assignTab === 'curriculum' && (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Kattints a tantárgyra a hozzárendeléshez:
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {project.curriculum
                    .filter((c) => c.classId === activeSlotTarget.classId)
                    .map((curr) => {
                      const subj = project.subjects.find((s) => s.id === curr.subjectId);
                      const teacher = project.teachers.find((t) => t.id === curr.teacherId);
                      const room = project.rooms.find((r) => r.id === curr.roomId);

                      const progress = progressList.find((p) => p.curriculumId === curr.id);
                      const assigned = progress?.assignedHours || 0;
                      const required = curr.weeklyHours;

                      const teacherStatus = getTeacherStatus(
                        curr.teacherId,
                        activeSlotTarget.day,
                        activeSlotTarget.period
                      );

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
                              curr.roomId,
                              undefined,
                              isJointAssign,
                              selectedJointClassIds
                            )
                          }
                          className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                            !teacherStatus.available
                              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 hover:border-amber-500'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:bg-indigo-50/40 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shadow-xs"
                              style={{ backgroundColor: subj?.color || '#3b82f6' }}
                            >
                              {subj?.shortCode}
                            </div>
                            <div>
                              <div className="font-black text-slate-900 dark:text-white text-sm">
                                {subj?.name}
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-2 mt-0.5">
                                <span>
                                  {teacher?.name} ({teacher?.shortCode})
                                </span>
                                {room && (
                                   <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded font-mono text-slate-500 dark:text-slate-300">
                                     {room.shortCode}
                                   </span>
                                )}
                                {!teacherStatus.available && (
                                  <span className="text-[11px] font-bold text-amber-700 bg-amber-100 dark:bg-amber-950/80 px-1.5 py-0.2 rounded">
                                    ⚠️ {teacherStatus.message}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
            )}

            {/* Tab 2: Custom / Direct Assignment */}
            {assignTab === 'custom' && (
              <div className="space-y-3.5 animate-in fade-in duration-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tantárgy:
                  </label>
                  <select
                    value={customSubjectId}
                    onChange={(e) => setCustomSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {project.subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.shortCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Oktató Tanár:
                  </label>
                  <select
                    value={customTeacherId}
                    onChange={(e) => setCustomTeacherId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {project.teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name} ({t.shortCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Terem (opcionális):
                  </label>
                  <select
                    value={customRoomId}
                    onChange={(e) => setCustomRoomId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">(Nincs terem hozzárendelve)</option>
                    {project.rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.shortCode})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!customSubjectId || !customTeacherId) return;
                    handleAssignSlot(
                      activeSlotTarget.day,
                      activeSlotTarget.period,
                      activeSlotTarget.classId,
                      customSubjectId,
                      customTeacherId,
                      customRoomId || undefined,
                      undefined,
                      isJointAssign,
                      selectedJointClassIds
                    );
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isJointAssign && selectedJointClassIds.length > 0
                      ? `Összevont Óra Elhelyezése (${1 + selectedJointClassIds.length} osztály)`
                      : 'Óra Elhelyezése az Órarendbe'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Add Class Modal */}
      {isAddClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Új Osztály Oszlop Hozzáadása</h3>
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Osztály megnevezése (pl. 1.o, 4.o, 5.a):
                </label>
                <input
                  type="text"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="pl. 1.o vagy 5.a"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Évfolyam (1–12):</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={newClassGrade}
                  onChange={(e) => setNewClassGrade(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Szín:</label>
                <input
                  type="color"
                  value={newClassColor}
                  onChange={(e) => setNewClassColor(e.target.value)}
                  className="w-full h-9 rounded-xl cursor-pointer border border-slate-300"
                />
              </div>
            </div>

            <div className="flex space-x-2 pt-2">
              <button
                onClick={() => setIsAddClassModalOpen(false)}
                className="w-1/2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Mégse
              </button>
              <button
                onClick={handleAddNewClass}
                disabled={!newClassName.trim()}
                className="w-1/2 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/30 disabled:opacity-50 cursor-pointer"
              >
                Hozzáadás
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Slots Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl text-slate-900 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-lg text-slate-900 leading-tight">
                    Órarend Kiürítése
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jelenleg {project.slots.length} óra van elhelyezve a táblán
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">Válassz törlési módot:</label>

              <div className="space-y-2">
                <label
                  onClick={() => setClearMode('unlocked')}
                  className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    clearMode === 'unlocked'
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearMode"
                    checked={clearMode === 'unlocked'}
                    onChange={() => setClearMode('unlocked')}
                    className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      Csak a nem zárolt órák törlése
                    </div>
                    <div className="text-[11px] text-slate-500">
                      A 🔒 lakattal rögzített órák a helyükön maradnak ({project.slots.filter((s) => s.isLocked).length} db zárolt óra).
                    </div>
                  </div>
                </label>

                <label
                  onClick={() => setClearMode('all')}
                  className={`flex items-start space-x-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    clearMode === 'all'
                      ? 'border-rose-600 bg-rose-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearMode"
                    checked={clearMode === 'all'}
                    onChange={() => setClearMode('all')}
                    className="mt-0.5 text-rose-600 focus:ring-rose-500"
                  />
                  <div>
                    <div className="text-xs font-black text-rose-700">
                      Minden óra törlése a tábláról (Teljes kiürítés)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Az összes ({project.slots.length} db) óra visszakerül a kiosztatlan órák tárába.
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Mégse
              </button>
              <button
                type="button"
                onClick={handleClearSlots}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 cursor-pointer transition-colors"
              >
                Órák törlése
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bell Schedule Modal */}
      <BellScheduleModal
        project={project}
        setProject={setProject}
        isOpen={isBellScheduleOpen}
        onClose={() => setIsBellScheduleOpen(false)}
      />
    </div>
  );
};
