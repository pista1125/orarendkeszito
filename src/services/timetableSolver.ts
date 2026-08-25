import type {
  TimetableProject,
  TimetableSlot,
  DayOfWeek,
} from '../types/timetable';

export interface SolverResult {
  success: boolean;
  slots: TimetableSlot[];
  placedCount: number;
  totalRequiredCount: number;
  unplacedCurriculum: {
    curriculumId: string;
    classId: string;
    subjectId: string;
    teacherId: string;
    missingHours: number;
  }[];
  message: string;
}

interface UnplacedLessonUnit {
  curriculumId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  unitIndex: number;
  isJoint?: boolean;
  jointClassIds?: string[];
}

export function generateTimetable(
  project: TimetableProject,
  preserveLocked: boolean = true
): SolverResult {
  const { teachers, curriculum, constraints, slots: existingSlots } = project;

  const lockedSlots = preserveLocked ? existingSlots.filter((s) => s.isLocked) : [];

  const lessonUnitsToPlace: UnplacedLessonUnit[] = [];

  curriculum.forEach((req) => {
    const lockedCount = lockedSlots.filter(
      (s) => s.classId === req.classId && s.subjectId === req.subjectId && s.teacherId === req.teacherId
    ).length;

    const remainingNeeded = Math.max(0, req.weeklyHours - lockedCount);
    for (let i = 0; i < remainingNeeded; i++) {
      lessonUnitsToPlace.push({
        curriculumId: req.id,
        classId: req.classId,
        subjectId: req.subjectId,
        teacherId: req.teacherId,
        roomId: req.roomId,
        unitIndex: i,
        isJoint: req.isJoint,
        jointClassIds: req.jointClassIds,
      });
    }
  });

  const totalRequiredCount = curriculum.reduce((sum, r) => sum + r.weeklyHours, 0);

  const teacherHourDemandMap = new Map<string, number>();
  lessonUnitsToPlace.forEach((unit) => {
    teacherHourDemandMap.set(unit.teacherId, (teacherHourDemandMap.get(unit.teacherId) || 0) + 1);
  });

  lessonUnitsToPlace.sort((a, b) => {
    const demandA = teacherHourDemandMap.get(a.teacherId) || 0;
    const demandB = teacherHourDemandMap.get(b.teacherId) || 0;
    return demandB - demandA;
  });

  const currentSlots: TimetableSlot[] = [...lockedSlots];

  const teacherOccupied = new Set<string>();
  const classOccupied = new Set<string>();
  const classDaySubjectCount = new Map<string, number>();
  const teacherDailyHours = new Map<string, number>();

  lockedSlots.forEach((slot) => {
    teacherOccupied.add(`${slot.day}-${slot.period}-${slot.teacherId}`);
    classOccupied.add(`${slot.day}-${slot.period}-${slot.classId}`);

    const classDaySubjKey = `${slot.classId}-${slot.day}-${slot.subjectId}`;
    classDaySubjectCount.set(classDaySubjKey, (classDaySubjectCount.get(classDaySubjKey) || 0) + 1);

    const teacherDayKey = `${slot.teacherId}-${slot.day}`;
    teacherDailyHours.set(teacherDayKey, (teacherDailyHours.get(teacherDayKey) || 0) + 1);
  });

  function isValidPlacement(
    unit: UnplacedLessonUnit,
    day: DayOfWeek,
    period: number
  ): { valid: boolean; penalty: number } {
    const allUnitClasses = unit.isJoint && unit.jointClassIds && unit.jointClassIds.length > 0
      ? Array.from(new Set([unit.classId, ...unit.jointClassIds]))
      : [unit.classId];

    if (teacherOccupied.has(`${day}-${period}-${unit.teacherId}`)) {
      return { valid: false, penalty: Infinity };
    }

    for (const cId of allUnitClasses) {
      if (classOccupied.has(`${day}-${period}-${cId}`)) {
        return { valid: false, penalty: Infinity };
      }
    }

    const teacher = teachers.find((t) => t.id === unit.teacherId);
    if (teacher?.unavailableSlots) {
      const isUnavail = teacher.unavailableSlots.some((u) => u.day === day && u.period === period);
      if (isUnavail) return { valid: false, penalty: Infinity };
    }

    for (const c of constraints) {
      if (c.type === 'NO_SUBJECT_PERIOD' && c.priority === 'HARD') {
        const matchClass = !c.classId || allUnitClasses.includes(c.classId);
        const matchSubject = !c.subjectId || c.subjectId === unit.subjectId;
        const matchDay = c.day === undefined || c.day === day;
        const matchPeriod = c.period === undefined || c.period === period;
        if (matchClass && matchSubject && matchDay && matchPeriod) {
          return { valid: false, penalty: Infinity };
        }
      }
    }

    if (teacher) {
      const dailyCount = teacherDailyHours.get(`${unit.teacherId}-${day}`) || 0;
      if (dailyCount >= teacher.maxDailyHours) {
        return { valid: false, penalty: Infinity };
      }
    }

    let penalty = 0;
    const sameDaySubjectCount = classDaySubjectCount.get(`${unit.classId}-${day}-${unit.subjectId}`) || 0;
    if (sameDaySubjectCount >= 1) penalty += 20;
    if (sameDaySubjectCount >= 2) penalty += 100;

    if (period >= 7) penalty += 15;
    if (period >= 8) penalty += 30;

    return { valid: true, penalty };
  }

  const unplacedUnits: UnplacedLessonUnit[] = [];

  for (const unit of lessonUnitsToPlace) {
    let bestPlacement: { day: DayOfWeek; period: number; penalty: number } | null = null;

    for (let day = 0; day < 5; day++) {
      const d = day as DayOfWeek;
      for (let period = 1; period <= 8; period++) {
        const { valid, penalty } = isValidPlacement(unit, d, period);
        if (valid) {
          if (!bestPlacement || penalty < bestPlacement.penalty) {
            bestPlacement = { day: d, period, penalty };
          }
        }
      }
    }

    if (bestPlacement) {
      const allUnitClasses = unit.isJoint && unit.jointClassIds && unit.jointClassIds.length > 0
        ? Array.from(new Set([unit.classId, ...unit.jointClassIds]))
        : [unit.classId];

      const jointSlotId = allUnitClasses.length > 1 ? `joint-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` : undefined;

      allUnitClasses.forEach((cId) => {
        const newSlot: TimetableSlot = {
          id: `slot-auto-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          day: bestPlacement!.day,
          period: bestPlacement!.period,
          classId: cId,
          subjectId: unit.subjectId,
          teacherId: unit.teacherId,
          roomId: unit.roomId,
          isLocked: false,
          isJoint: allUnitClasses.length > 1,
          jointSlotId,
          jointClassIds: allUnitClasses.length > 1 ? allUnitClasses : undefined,
        };

        currentSlots.push(newSlot);
        classOccupied.add(`${bestPlacement!.day}-${bestPlacement!.period}-${cId}`);

        const classDaySubjKey = `${cId}-${bestPlacement!.day}-${unit.subjectId}`;
        classDaySubjectCount.set(classDaySubjKey, (classDaySubjectCount.get(classDaySubjKey) || 0) + 1);
      });

      teacherOccupied.add(`${bestPlacement.day}-${bestPlacement.period}-${unit.teacherId}`);
      const teacherDayKey = `${unit.teacherId}-${bestPlacement.day}`;
      teacherDailyHours.set(teacherDayKey, (teacherDailyHours.get(teacherDayKey) || 0) + 1);
    } else {
      unplacedUnits.push(unit);
    }
  }

  const unplacedMap = new Map<string, { curriculumId: string; classId: string; subjectId: string; teacherId: string; count: number }>();
  unplacedUnits.forEach((u) => {
    const key = u.curriculumId;
    if (!unplacedMap.has(key)) {
      unplacedMap.set(key, {
        curriculumId: u.curriculumId,
        classId: u.classId,
        subjectId: u.subjectId,
        teacherId: u.teacherId,
        count: 0,
      });
    }
    unplacedMap.get(key)!.count += 1;
  });

  const unplacedCurriculum = Array.from(unplacedMap.values()).map((v) => ({
    curriculumId: v.curriculumId,
    classId: v.classId,
    subjectId: v.subjectId,
    teacherId: v.teacherId,
    missingHours: v.count,
  }));

  const placedCount = currentSlots.length;
  const isFullSuccess = unplacedUnits.length === 0;

  return {
    success: isFullSuccess,
    slots: currentSlots,
    placedCount,
    totalRequiredCount,
    unplacedCurriculum,
    message: isFullSuccess
      ? `Sikeres órarend generálás! Mind a ${placedCount} óra sikeresen elhelyezésre került ütközésmentesen.`
      : `Az órarend generálás elkészült (${placedCount}/${totalRequiredCount} óra elhelyezve). ${unplacedUnits.length} órához nem található ütközésmentes hely a jelenlegi korlátok mellett.`,
  };
}
