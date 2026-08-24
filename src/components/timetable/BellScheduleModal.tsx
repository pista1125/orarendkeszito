import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Check,
} from 'lucide-react';
import type { TimetableProject, TimeSlotConfig } from '../../types/timetable';
import { DEFAULT_PERIODS } from '../../types/timetable';

interface BellScheduleModalProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
  isOpen: boolean;
  onClose: () => void;
}

export const BellScheduleModal: React.FC<BellScheduleModalProps> = ({
  project,
  setProject,
  isOpen,
  onClose,
}) => {
  const currentPeriods = project.periods && project.periods.length > 0
    ? project.periods
    : DEFAULT_PERIODS;

  const [periods, setPeriods] = useState<TimeSlotConfig[]>(currentPeriods);

  // Auto-calculator generator state
  const [firstStartTime, setFirstStartTime] = useState('08:00');
  const [lessonDuration, setLessonDuration] = useState(45);
  const [shortBreakDuration, setShortBreakDuration] = useState(10);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [longBreakAfterPeriod, setLongBreakAfterPeriod] = useState(2);
  const [periodCount, setPeriodCount] = useState(8);

  if (!isOpen) return null;

  const handlePeriodChange = (
    index: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setPeriods((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const handleAddPeriod = () => {
    const nextPeriodNum = periods.length + 1;
    let start = '15:15';
    let end = '16:00';

    if (periods.length > 0) {
      const last = periods[periods.length - 1];
      const [lastEndH, lastEndM] = last.endTime.split(':').map(Number);
      const startMinutes = lastEndH * 60 + lastEndM + 10;
      const endMinutes = startMinutes + 45;

      const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60) % 24;
        const m = mins % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      };

      start = formatTime(startMinutes);
      end = formatTime(endMinutes);
    }

    setPeriods((prev) => [
      ...prev,
      { period: nextPeriodNum, startTime: start, endTime: end },
    ]);
  };

  const handleRemovePeriod = (index: number) => {
    if (periods.length <= 1) return;
    setPeriods((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((p, idx) => ({ ...p, period: idx + 1 }))
    );
  };

  const handleAutoCalculate = () => {
    const [startH, startM] = firstStartTime.split(':').map(Number);
    let currentMinute = (startH || 8) * 60 + (startM || 0);

    const generated: TimeSlotConfig[] = [];

    const formatTime = (mins: number) => {
      const h = Math.floor(mins / 60) % 24;
      const m = mins % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    for (let i = 1; i <= periodCount; i++) {
      const startStr = formatTime(currentMinute);
      const endMinute = currentMinute + lessonDuration;
      const endStr = formatTime(endMinute);

      generated.push({
        period: i,
        startTime: startStr,
        endTime: endStr,
      });

      // Add break for next lesson
      const isLongBreak = i === longBreakAfterPeriod;
      const breakMins = isLongBreak ? longBreakDuration : shortBreakDuration;
      currentMinute = endMinute + breakMins;
    }

    setPeriods(generated);
  };

  const handleResetToDefault = () => {
    setPeriods(DEFAULT_PERIODS);
  };

  const handleSave = () => {
    setProject((prev) => ({
      ...prev,
      periods,
    }));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl shadow-2xl text-slate-900 space-y-6 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 leading-tight">
                Csengetési Rend Beállítása
              </h2>
              <p className="text-xs text-slate-500">
                Az órák kezdeti és befejezési időpontjainak, valamint szüneteinek konfigurálása
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Auto Calculator Wizard Box */}
        <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-black text-indigo-900">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Automatikus Csengetési Rend Generáló</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Gyors kiszámítás órahossz és szünetek alapján
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                1. óra kezdete:
              </label>
              <input
                type="time"
                value={firstStartTime}
                onChange={(e) => setFirstStartTime(e.target.value)}
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
                  value={lessonDuration}
                  onChange={(e) => setLessonDuration(Number(e.target.value))}
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
                  value={shortBreakDuration}
                  onChange={(e) => setShortBreakDuration(Number(e.target.value))}
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
                  value={longBreakDuration}
                  onChange={(e) => setLongBreakDuration(Number(e.target.value))}
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
                value={longBreakAfterPeriod}
                onChange={(e) => setLongBreakAfterPeriod(Number(e.target.value))}
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
                value={periodCount}
                onChange={(e) => setPeriodCount(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleAutoCalculate}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Időpontok újraszámolása</span>
            </button>
          </div>
        </div>

        {/* Periods List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Órák és Idősávok ({periods.length} óra)
            </span>

            <button
              onClick={handleAddPeriod}
              className="flex items-center space-x-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-600" />
              <span>+ Új óra hozzáadása</span>
            </button>
          </div>

          <div className="space-y-2">
            {periods.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-300 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    {p.period}.
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {p.period}. óra
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-semibold text-slate-500">Kezdés:</label>
                    <input
                      type="time"
                      value={p.startTime}
                      onChange={(e) =>
                        handlePeriodChange(idx, 'startTime', e.target.value)
                      }
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <span className="text-slate-400 font-bold">-</span>

                  <div className="flex items-center space-x-1.5">
                    <label className="text-xs font-semibold text-slate-500">Vége:</label>
                    <input
                      type="time"
                      value={p.endTime}
                      onChange={(e) =>
                        handlePeriodChange(idx, 'endTime', e.target.value)
                      }
                      className="px-2.5 py-1 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-900 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => handleRemovePeriod(idx)}
                    disabled={periods.length <= 1}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-30 cursor-pointer"
                    title="Óra törlése"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-4 gap-3">
          <button
            onClick={handleResetToDefault}
            className="flex items-center space-x-1.5 px-3 py-2 text-slate-500 hover:text-slate-800 font-bold text-xs cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Alapértelmezett visszaállítása</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              Mégse
            </button>
            <button
              onClick={handleSave}
              className="w-1/2 sm:w-auto flex items-center justify-center space-x-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/30 cursor-pointer transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Csengetési Rend Mentése</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
