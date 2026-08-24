export type DayOfWeek = 0 | 1 | 2 | 3 | 4; // 0: Hétfő, 1: Kedd, 2: Szerda, 3: Csütörtök, 4: Péntek

export const DAYS_HUNGARIAN: string[] = ['Hétfő', 'Kedd', 'Szerda', 'Csütörtök', 'Péntek'];

export interface TimeSlotConfig {
  period: number; // 1..8
  startTime: string; // e.g. "08:00"
  endTime: string; // e.g. "08:45"
}

export const DEFAULT_PERIODS: TimeSlotConfig[] = [
  { period: 1, startTime: '08:00', endTime: '08:45' },
  { period: 2, startTime: '08:55', endTime: '09:40' },
  { period: 3, startTime: '09:55', endTime: '10:40' },
  { period: 4, startTime: '10:50', endTime: '11:35' },
  { period: 5, startTime: '11:45', endTime: '12:30' },
  { period: 6, startTime: '12:40', endTime: '13:25' },
  { period: 7, startTime: '13:30', endTime: '14:15' },
  { period: 8, startTime: '14:20', endTime: '15:05' },
];

export interface Teacher {
  id: string;
  name: string;
  shortCode: string; // e.g. "KO" for Kovács Orsolya
  color: string;
  maxDailyHours: number;
  unavailableSlots: { day: DayOfWeek; period: number }[]; // 1-indexed period
}

export interface ClassGroup {
  id: string;
  name: string; // e.g. "5.A"
  grade: number; // e.g. 5
  color: string;
}

export interface Subject {
  id: string;
  name: string; // e.g. "Matematika"
  shortCode: string; // e.g. "MAT"
  color: string;
}

export interface Room {
  id: string;
  name: string; // e.g. "101. terem", "Tornaterem", "Informatika lab"
  shortCode: string;
}

// Defines how many hours per week a class has of a specific subject with a specific teacher
export interface CurriculumRequirement {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  weeklyHours: number;
}

// Individual slot entry in the timetable
export interface TimetableSlot {
  id: string;
  day: DayOfWeek;
  period: number; // 1..8
  classId: string;
  subjectId: string;
  teacherId: string;
  roomId?: string;
  groupName?: string; // e.g. "1. csoport", "Lányok", "Haladó"
  isLocked?: boolean; // if locked, automatic generator will not touch/move it
}

export type ConstraintType =
  | 'NO_SUBJECT_PERIOD' // e.g. Class X cannot have Subject Y in Period Z
  | 'TEACHER_MAX_DAILY' // Teacher cannot exceed N hours in a single day
  | 'NO_TEACHER_DOUBLE_BOOKING' // Hard constraint: Teacher in only one class per slot
  | 'NO_CLASS_DOUBLE_BOOKING' // Hard constraint: Class has only one subject per slot
  | 'TEACHER_UNAVAILABLE' // Teacher cannot be assigned during marked unavailable slot
  | 'PREFER_MORNING_SUBJECT'; // Soft constraint: e.g. Math/Hungarian preferred in periods 1-4

export interface Constraint {
  id: string;
  title: string;
  type: ConstraintType;
  classId?: string;
  teacherId?: string;
  subjectId?: string;
  day?: DayOfWeek;
  period?: number;
  maxHours?: number;
  priority: 'HARD' | 'SOFT';
}

export interface Conflict {
  id: string;
  type: 'TEACHER_OVERLAP' | 'CLASS_OVERLAP' | 'CONSTRAINT_VIOLATION' | 'UNAVAILABLE_TEACHER';
  severity: 'ERROR' | 'WARNING';
  message: string;
  day: DayOfWeek;
  period: number;
  involvedSlotIds: string[];
}

export interface TimetableProject {
  id: string;
  name: string;
  schoolName: string;
  academicYear: string;
  semester?: string; // e.g. "I. Félév", "II. Félév", "Egész tanév"
  periods?: TimeSlotConfig[]; // Csengetési rend (Start & End times per period)
  teachers: Teacher[];
  classes: ClassGroup[];
  subjects: Subject[];
  rooms: Room[];
  curriculum: CurriculumRequirement[];
  constraints: Constraint[];
  slots: TimetableSlot[];
  updatedAt: string;
}
