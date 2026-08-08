import type {
  TimetableSlot,
  Teacher,
  ClassGroup,
  Subject,
  Constraint,
  Conflict,
  DayOfWeek,
  CurriculumRequirement,
} from '../types/timetable';

export interface CurriculumProgress {
  curriculumId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  requiredHours: number;
  assignedHours: number;
  remainingHours: number;
  isComplete: boolean;
  isExceeded: boolean;
}

export function detectConflicts(
  slots: TimetableSlot[],
  teachers: Teacher[],
  classes: ClassGroup[],
  subjects: Subject[],
  constraints: Constraint[]
): Conflict[] {
  const conflicts: Conflict[] = [];

  const slotMap = new Map<string, TimetableSlot[]>();
  for (const slot of slots) {
    const key = `${slot.day}-${slot.period}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, []);
    }
    slotMap.get(key)!.push(slot);
  }

  slotMap.forEach((timeSlots, key) => {
    const [dayStr, periodStr] = key.split('-');
    const day = parseInt(dayStr, 10) as DayOfWeek;
    const period = parseInt(periodStr, 10);

    const teacherSlotsMap = new Map<string, TimetableSlot[]>();
    timeSlots.forEach((slot) => {
      if (!teacherSlotsMap.has(slot.teacherId)) {
        teacherSlotsMap.set(slot.teacherId, []);
      }
      teacherSlotsMap.get(slot.teacherId)!.push(slot);
    });

    teacherSlotsMap.forEach((tSlots, teacherId) => {
      if (tSlots.length > 1) {
        const teacher = teachers.find((t) => t.id === teacherId);
        const tName = teacher ? teacher.name : 'Ismeretlen tanár';
        const classNames = tSlots
          .map((s) => classes.find((c) => c.id === s.classId)?.name || s.classId)
          .join(', ');

        conflicts.push({
          id: `conflict-t-${teacherId}-${day}-${period}`,
          type: 'TEACHER_OVERLAP',
          severity: 'ERROR',
          message: `Tanári ütközés: ${tName} egyszerre van beosztva több osztályhoz (${classNames}) a ${day + 1}. nap ${period}. órájában.`,
          day,
          period,
          involvedSlotIds: tSlots.map((s) => s.id),
        });
      }
    });

    const classSlotsMap = new Map<string, TimetableSlot[]>();
    timeSlots.forEach((slot) => {
      if (!classSlotsMap.has(slot.classId)) {
        classSlotsMap.set(slot.classId, []);
      }
      classSlotsMap.get(slot.classId)!.push(slot);
    });

    classSlotsMap.forEach((cSlots, classId) => {
      if (cSlots.length > 1) {
        const cls = classes.find((c) => c.id === classId);
        const cName = cls ? cls.name : 'Ismeretlen osztály';
        const subjNames = cSlots
          .map((s) => subjects.find((subj) => subj.id === s.subjectId)?.shortCode || s.subjectId)
          .join(', ');

        conflicts.push({
          id: `conflict-c-${classId}-${day}-${period}`,
          type: 'CLASS_OVERLAP',
          severity: 'ERROR',
          message: `Osztály ütközés: A ${cName} osztálynak egyszerre több órája van (${subjNames}) a ${day + 1}. nap ${period}. órájában.`,
          day,
          period,
          involvedSlotIds: cSlots.map((s) => s.id),
        });
      }
    });

    timeSlots.forEach((slot) => {
      const teacher = teachers.find((t) => t.id === slot.teacherId);
      if (teacher && teacher.unavailableSlots) {
        const isUnavailable = teacher.unavailableSlots.some(
          (u) => u.day === slot.day && u.period === slot.period
        );
        if (isUnavailable) {
          const cls = classes.find((c) => c.id === slot.classId);
          conflicts.push({
            id: `conflict-unavail-${slot.id}`,
            type: 'UNAVAILABLE_TEACHER',
            severity: 'ERROR',
            message: `${teacher.name} nem elérhető ekkor (${slot.period}. óra), mégis órája van a(z) ${cls?.name || ''} szemben!`,
            day,
            period,
            involvedSlotIds: [slot.id],
          });
        }
      }
    });
  });

  constraints.forEach((constraint) => {
    if (constraint.type === 'NO_SUBJECT_PERIOD') {
      slots.forEach((slot) => {
        const matchClass = !constraint.classId || constraint.classId === slot.classId;
        const matchSubject = !constraint.subjectId || constraint.subjectId === slot.subjectId;
        const matchDay = constraint.day === undefined || constraint.day === slot.day;
        const matchPeriod = constraint.period === undefined || constraint.period === slot.period;

        if (matchClass && matchSubject && matchDay && matchPeriod) {
          const cls = classes.find((c) => c.id === slot.classId);
          const subj = subjects.find((s) => s.id === slot.subjectId);
          conflicts.push({
            id: `conflict-const-${constraint.id}-${slot.id}`,
            type: 'CONSTRAINT_VIOLATION',
            severity: constraint.priority === 'HARD' ? 'ERROR' : 'WARNING',
            message: `Kötöttség megsértése: ${constraint.title} (${cls?.name || ''} - ${subj?.shortCode || ''})`,
            day: slot.day,
            period: slot.period,
            involvedSlotIds: [slot.id],
          });
        }
      });
    }
  });

  return conflicts;
}

export function calculateCurriculumProgress(
  curriculum: CurriculumRequirement[],
  slots: TimetableSlot[]
): CurriculumProgress[] {
  return curriculum.map((req) => {
    const assignedHours = slots.filter(
      (s) => s.classId === req.classId && s.subjectId === req.subjectId && s.teacherId === req.teacherId
    ).length;

    const remainingHours = req.weeklyHours - assignedHours;

    return {
      curriculumId: req.id,
      classId: req.classId,
      subjectId: req.subjectId,
      teacherId: req.teacherId,
      requiredHours: req.weeklyHours,
      assignedHours,
      remainingHours,
      isComplete: assignedHours === req.weeklyHours,
      isExceeded: assignedHours > req.weeklyHours,
    };
  });
}
