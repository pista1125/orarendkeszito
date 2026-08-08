import React, { useState } from 'react';
import { Sparkles, X, CheckCircle, AlertTriangle, RefreshCw, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TimetableProject } from '../../types/timetable';
import { generateTimetable } from '../../services/timetableSolver';
import type { SolverResult } from '../../services/timetableSolver';

interface AutoGeneratorModalProps {
  project: TimetableProject;
  setProject: React.Dispatch<React.SetStateAction<TimetableProject>>;
  isOpen: boolean;
  onClose: () => void;
}

export const AutoGeneratorModal: React.FC<AutoGeneratorModalProps> = ({
  project,
  setProject,
  isOpen,
  onClose,
}) => {
  const [preserveLocked, setPreserveLocked] = useState<boolean>(true);
  const [result, setResult] = useState<SolverResult | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRunGenerator = () => {
    setIsGenerating(true);
    setResult(null);

    setTimeout(() => {
      const solverRes = generateTimetable(project, preserveLocked);
      setResult(solverRes);
      setIsGenerating(false);

      if (solverRes.success) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }, 600);
  };

  const handleApplyResult = () => {
    if (result) {
      setProject((prev) => ({
        ...prev,
        slots: result.slots,
        updatedAt: new Date().toISOString(),
      }));
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-slate-950 shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Automatikus Órarend Generáló</h2>
              <p className="text-xs text-slate-500">
                Intelligens ütközésmentes órarend generálás a megadott feltételek alapján.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={preserveLocked}
                onChange={(e) => setPreserveLocked(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
              />
              <div className="text-sm">
                <span className="font-bold text-slate-800 flex items-center space-x-1">
                  <Lock className="w-3.5 h-3.5 text-amber-500 mr-1 inline" />
                  Zárolt órák megtartása
                </span>
                <p className="text-xs text-slate-500">
                  A kézzel zárolt (Lock ikonnal ellátott) órák nem kerülnek áthelyezésre.
                </p>
              </div>
            </label>
          </div>

          <button
            onClick={handleRunGenerator}
            disabled={isGenerating}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white font-black text-base shadow-lg shadow-indigo-500/30 flex items-center justify-center space-x-2 transition-all"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Órarend generálása folyamatban...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Órarend Generálása Indítása</span>
              </>
            )}
          </button>
        </div>

        {result && (
          <div
            className={`p-4 rounded-2xl border ${
              result.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-start space-x-3">
              {result.success ? (
                <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <h4 className="font-bold text-base">{result.success ? 'Sikeres Generálás!' : 'Részleges Generálás'}</h4>
                <p className="text-sm">{result.message}</p>
                <div className="text-xs font-semibold opacity-80 pt-1">
                  Elhelyezve: {result.placedCount} / {result.totalRequiredCount} óra
                </div>
              </div>
            </div>

            {result.unplacedCurriculum.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200 space-y-1 text-xs text-amber-900">
                <span className="font-bold">Elhelyezetlen órák:</span>
                {result.unplacedCurriculum.map((u, idx) => {
                  const cls = project.classes.find((c) => c.id === u.classId);
                  const subj = project.subjects.find((s) => s.id === u.subjectId);
                  const teacher = project.teachers.find((t) => t.id === u.teacherId);
                  return (
                    <div key={idx} className="bg-white/60 p-1.5 rounded font-mono">
                      {cls?.name} - {subj?.name} ({teacher?.shortCode}): {u.missingHours} óra hiányzik
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 text-sm hover:bg-slate-50"
          >
            Mégse
          </button>
          {result && (
            <button
              onClick={handleApplyResult}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all"
            >
              Órarend Alkalmazása
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
