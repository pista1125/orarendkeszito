import type { TimetableProject, TimetableSlot } from '../types/timetable';

export const INITIAL_MOCK_PROJECT: TimetableProject = {
  id: 'proj-1',
  name: '2026/2027 I. Félév Fő Órarend',
  schoolName: 'Általános Iskola',
  academicYear: '2026/2027',
  semester: 'I. Félév',
  periods: [
    { period: 1, startTime: '08:00', endTime: '08:45' },
    { period: 2, startTime: '08:55', endTime: '09:40' },
    { period: 3, startTime: '09:55', endTime: '10:40' },
    { period: 4, startTime: '10:50', endTime: '11:35' },
    { period: 5, startTime: '11:45', endTime: '12:30' },
    { period: 6, startTime: '12:40', endTime: '13:25' },
    { period: 7, startTime: '13:30', endTime: '14:15' },
    { period: 8, startTime: '14:20', endTime: '15:05' },
  ],
  teachers: [
    {
      id: 't-1',
      name: 'Kovács Orsolya',
      shortCode: 'KO',
      color: '#3b82f6',
      maxDailyHours: 6,
      unavailableSlots: [{ day: 4, period: 7 }, { day: 4, period: 8 }],
    },
    {
      id: 't-2',
      name: 'Nagy Péter',
      shortCode: 'NP',
      color: '#ef4444',
      maxDailyHours: 6,
      unavailableSlots: [],
    },
    {
      id: 't-3',
      name: 'Szabó Éva',
      shortCode: 'SZÉ',
      color: '#10b981',
      maxDailyHours: 6,
      unavailableSlots: [{ day: 0, period: 1 }],
    },
    {
      id: 't-4',
      name: 'Tóth Gábor',
      shortCode: 'TG',
      color: '#f59e0b',
      maxDailyHours: 6,
      unavailableSlots: [],
    },
    {
      id: 't-5',
      name: 'Horváth Katalin',
      shortCode: 'HK',
      color: '#8b5cf6',
      maxDailyHours: 6,
      unavailableSlots: [],
    },
    {
      id: 't-6',
      name: 'Molnár Balázs',
      shortCode: 'MB',
      color: '#ec4899',
      maxDailyHours: 6,
      unavailableSlots: [],
    },
    {
      id: 't-7',
      name: 'Farkas Andrea',
      shortCode: 'FA',
      color: '#06b6d4',
      maxDailyHours: 6,
      unavailableSlots: [],
    },
    {
      id: 't-8',
      name: 'Varga Zoltán',
      shortCode: 'VZ',
      color: '#84cc16',
      maxDailyHours: 6,
      unavailableSlots: [],
    },
  ],
  classes: [
    { id: 'c-4', name: '4.o', grade: 4, color: '#f59e0b' },
    { id: 'c-5', name: '5.o', grade: 5, color: '#3b82f6' },
    { id: 'c-6', name: '6.o', grade: 6, color: '#ec4899' },
    { id: 'c-7', name: '7.o', grade: 7, color: '#8b5cf6' },
    { id: 'c-8', name: '8.o', grade: 8, color: '#10b981' },
  ],
  subjects: [
    { id: 's-1', name: 'Magyar nyelv és irodalom', shortCode: 'Magyar', color: '#f43f5e' },
    { id: 's-2', name: 'Német nyelv', shortCode: 'Német', color: '#84cc16' },
    { id: 's-3', name: 'Matematika', shortCode: 'Matek', color: '#8b5cf6' },
    { id: 's-4', name: 'Történelem', shortCode: 'Történelem', color: '#f97316' },
    { id: 's-5', name: 'Természetismeret', shortCode: 'Természetism.', color: '#0284c7' },
    { id: 's-6', name: 'Biológia', shortCode: 'Biológia', color: '#0369a1' },
    { id: 's-7', name: 'Fizika', shortCode: 'Fizika', color: '#0d9488' },
    { id: 's-8', name: 'Kémia', shortCode: 'Kémia', color: '#0891b2' },
    { id: 's-9', name: 'Földrajz', shortCode: 'Földrajz', color: '#0284c7' },
    { id: 's-10', name: 'Testnevelés', shortCode: 'Testnevelés', color: '#15803d' },
    { id: 's-11', name: 'Informatika', shortCode: 'Informatika', color: '#06b6d4' },
    { id: 's-12', name: 'Technika', shortCode: 'Technika', color: '#b45309' },
    { id: 's-13', name: 'Rajz és vizuális kultúra', shortCode: 'Rajz', color: '#eab308' },
    { id: 's-14', name: 'Ének-zene', shortCode: 'Ének', color: '#d946ef' },
    { id: 's-15', name: 'Birkózás / Sport', shortCode: 'Birkózás', color: '#64748b' },
    { id: 's-16', name: 'Nemzetiségi népismeret', shortCode: 'Nemzetiségi', color: '#d97706' },
    { id: 's-17', name: 'Boldogságóra / Etika', shortCode: 'Boldogságóra', color: '#ca8a04' },
  ],
  rooms: [
    { id: 'r-1', name: 'V. osztályterem', shortCode: 'V.' },
    { id: 'r-2', name: 'VI. osztályterem', shortCode: 'VI.' },
    { id: 'r-3', name: 'VII. osztályterem', shortCode: 'VII.' },
    { id: 'r-4', name: 'VIII. osztályterem', shortCode: 'VIII.' },
    { id: 'r-5', name: 'Tornaterem', shortCode: 'TORNA' },
    { id: 'r-6', name: 'Informatika terem', shortCode: 'INFO' },
  ],
  curriculum: [
    // V. osztály (5.o)
    { id: 'curr-v-1', classId: 'c-5', subjectId: 's-1', teacherId: 't-2', weeklyHours: 5 },
    { id: 'curr-v-2', classId: 'c-5', subjectId: 's-2', teacherId: 't-3', weeklyHours: 4 },
    { id: 'curr-v-3', classId: 'c-5', subjectId: 's-3', teacherId: 't-1', weeklyHours: 5 },
    { id: 'curr-v-4', classId: 'c-5', subjectId: 's-4', teacherId: 't-4', weeklyHours: 2 },
    { id: 'curr-v-5', classId: 'c-5', subjectId: 's-5', teacherId: 't-5', weeklyHours: 2 },
    { id: 'curr-v-6', classId: 'c-5', subjectId: 's-10', teacherId: 't-6', weeklyHours: 3 },
    { id: 'curr-v-7', classId: 'c-5', subjectId: 's-11', teacherId: 't-7', weeklyHours: 1 },
    { id: 'curr-v-8', classId: 'c-5', subjectId: 's-12', teacherId: 't-8', weeklyHours: 1 },
    { id: 'curr-v-9', classId: 'c-5', subjectId: 's-13', teacherId: 't-8', weeklyHours: 1 },
    { id: 'curr-v-10', classId: 'c-5', subjectId: 's-14', teacherId: 't-2', weeklyHours: 1 },
    { id: 'curr-v-11', classId: 'c-5', subjectId: 's-15', teacherId: 't-6', weeklyHours: 2 },

    // VI. osztály (6.o)
    { id: 'curr-vi-1', classId: 'c-6', subjectId: 's-1', teacherId: 't-2', weeklyHours: 4 },
    { id: 'curr-vi-2', classId: 'c-6', subjectId: 's-2', teacherId: 't-3', weeklyHours: 4 },
    { id: 'curr-vi-3', classId: 'c-6', subjectId: 's-3', teacherId: 't-1', weeklyHours: 4 },
    { id: 'curr-vi-4', classId: 'c-6', subjectId: 's-4', teacherId: 't-4', weeklyHours: 3 },
    { id: 'curr-vi-5', classId: 'c-6', subjectId: 's-5', teacherId: 't-5', weeklyHours: 2 },
    { id: 'curr-vi-6', classId: 'c-6', subjectId: 's-10', teacherId: 't-6', weeklyHours: 3 },
    { id: 'curr-vi-7', classId: 'c-6', subjectId: 's-11', teacherId: 't-7', weeklyHours: 2 },
    { id: 'curr-vi-8', classId: 'c-6', subjectId: 's-12', teacherId: 't-8', weeklyHours: 1 },
    { id: 'curr-vi-9', classId: 'c-6', subjectId: 's-13', teacherId: 't-8', weeklyHours: 1 },
    { id: 'curr-vi-10', classId: 'c-6', subjectId: 's-16', teacherId: 't-4', weeklyHours: 1 },
    { id: 'curr-vi-11', classId: 'c-6', subjectId: 's-17', teacherId: 't-5', weeklyHours: 1 },

    // VII. osztály (7.o)
    { id: 'curr-vii-1', classId: 'c-7', subjectId: 's-1', teacherId: 't-2', weeklyHours: 4 },
    { id: 'curr-vii-2', classId: 'c-7', subjectId: 's-2', teacherId: 't-3', weeklyHours: 4 },
    { id: 'curr-vii-3', classId: 'c-7', subjectId: 's-3', teacherId: 't-1', weeklyHours: 4 },
    { id: 'curr-vii-4', classId: 'c-7', subjectId: 's-4', teacherId: 't-4', weeklyHours: 3 },
    { id: 'curr-vii-5', classId: 'c-7', subjectId: 's-6', teacherId: 't-5', weeklyHours: 2 },
    { id: 'curr-vii-6', classId: 'c-7', subjectId: 's-7', teacherId: 't-7', weeklyHours: 2 },
    { id: 'curr-vii-7', classId: 'c-7', subjectId: 's-8', teacherId: 't-5', weeklyHours: 2 },
    { id: 'curr-vii-8', classId: 'c-7', subjectId: 's-9', teacherId: 't-4', weeklyHours: 2 },
    { id: 'curr-vii-9', classId: 'c-7', subjectId: 's-10', teacherId: 't-6', weeklyHours: 3 },
    { id: 'curr-vii-10', classId: 'c-7', subjectId: 's-11', teacherId: 't-7', weeklyHours: 2 },

    // VIII. osztály (8.o)
    { id: 'curr-viii-1', classId: 'c-8', subjectId: 's-1', teacherId: 't-2', weeklyHours: 4 },
    { id: 'curr-viii-2', classId: 'c-8', subjectId: 's-2', teacherId: 't-3', weeklyHours: 4 },
    { id: 'curr-viii-3', classId: 'c-8', subjectId: 's-3', teacherId: 't-1', weeklyHours: 4 },
    { id: 'curr-viii-4', classId: 'c-8', subjectId: 's-4', teacherId: 't-4', weeklyHours: 3 },
    { id: 'curr-viii-5', classId: 'c-8', subjectId: 's-6', teacherId: 't-5', weeklyHours: 2 },
    { id: 'curr-viii-6', classId: 'c-8', subjectId: 's-7', teacherId: 't-7', weeklyHours: 2 },
    { id: 'curr-viii-7', classId: 'c-8', subjectId: 's-8', teacherId: 't-5', weeklyHours: 2 },
    { id: 'curr-viii-8', classId: 'c-8', subjectId: 's-9', teacherId: 't-4', weeklyHours: 2 },
    { id: 'curr-viii-9', classId: 'c-8', subjectId: 's-10', teacherId: 't-6', weeklyHours: 3 },
    { id: 'curr-viii-10', classId: 'c-8', subjectId: 's-11', teacherId: 't-7', weeklyHours: 2 },

    // IV. osztály (4.o)
    { id: 'curr-iv-1', classId: 'c-4', subjectId: 's-1', teacherId: 't-2', weeklyHours: 5 },
    { id: 'curr-iv-2', classId: 'c-4', subjectId: 's-3', teacherId: 't-1', weeklyHours: 5 },
    { id: 'curr-iv-3', classId: 'c-4', subjectId: 's-2', teacherId: 't-3', weeklyHours: 3 },
    { id: 'curr-iv-4', classId: 'c-4', subjectId: 's-10', teacherId: 't-6', weeklyHours: 4 },
    { id: 'curr-iv-5', classId: 'c-4', subjectId: 's-13', teacherId: 't-8', weeklyHours: 2 },
    { id: 'curr-iv-6', classId: 'c-4', subjectId: 's-14', teacherId: 't-2', weeklyHours: 2 },
  ],
  constraints: [
    {
      id: 'const-1',
      title: 'V. osztályban hétfő 1. órában ne legyen Matematika',
      type: 'NO_SUBJECT_PERIOD',
      classId: 'c-5',
      subjectId: 's-3',
      day: 0,
      period: 1,
      priority: 'HARD',
    },
  ],
  slots: [
    // HÉTFŐ
    { id: 's-1', day: 0, period: 1, classId: 'c-5', subjectId: 's-5', teacherId: 't-5' }, // V. Természetism.
    { id: 's-2', day: 0, period: 2, classId: 'c-5', subjectId: 's-1', teacherId: 't-2' }, // V. Magyar
    { id: 's-3', day: 0, period: 4, classId: 'c-5', subjectId: 's-2', teacherId: 't-3' }, // V. Német
    { id: 's-4', day: 0, period: 5, classId: 'c-5', subjectId: 's-4', teacherId: 't-4' }, // V. Történelem
    { id: 's-5', day: 0, period: 6, classId: 'c-5', subjectId: 's-14', teacherId: 't-2' }, // V. Ének

    { id: 's-6', day: 0, period: 1, classId: 'c-6', subjectId: 's-1', teacherId: 't-2' }, // VI. Magyar
    { id: 's-7', day: 0, period: 2, classId: 'c-6', subjectId: 's-4', teacherId: 't-4' }, // VI. Történelem
    { id: 's-8', day: 0, period: 3, classId: 'c-6', subjectId: 's-2', teacherId: 't-3' }, // VI. Német
    { id: 's-9', day: 0, period: 4, classId: 'c-6', subjectId: 's-3', teacherId: 't-1' }, // VI. Matek
    { id: 's-10', day: 0, period: 5, classId: 'c-6', subjectId: 's-10', teacherId: 't-6' }, // VI. Tesi
    { id: 's-11', day: 0, period: 6, classId: 'c-6', subjectId: 's-17', teacherId: 't-5' }, // VI. Boldogságóra

    { id: 's-12', day: 0, period: 1, classId: 'c-7', subjectId: 's-3', teacherId: 't-1' }, // VII. Matek
    { id: 's-13', day: 0, period: 2, classId: 'c-7', subjectId: 's-6', teacherId: 't-5' }, // VII. Biológia
    { id: 's-14', day: 0, period: 3, classId: 'c-7', subjectId: 's-4', teacherId: 't-4' }, // VII. Történelem
    { id: 's-15', day: 0, period: 4, classId: 'c-7', subjectId: 's-1', teacherId: 't-2' }, // VII. Magyar
    { id: 's-16', day: 0, period: 5, classId: 'c-7', subjectId: 's-2', teacherId: 't-3' }, // VII. Német

    { id: 's-17', day: 0, period: 3, classId: 'c-8', subjectId: 's-11', teacherId: 't-7' }, // VIII. Info
    { id: 's-18', day: 0, period: 4, classId: 'c-8', subjectId: 's-10', teacherId: 't-6' }, // VIII. Tesi

    // KEDD
    { id: 's-19', day: 1, period: 1, classId: 'c-5', subjectId: 's-2', teacherId: 't-3' }, // V. Német
    { id: 's-20', day: 1, period: 2, classId: 'c-5', subjectId: 's-1', teacherId: 't-2' }, // V. Magyar
    { id: 's-21', day: 1, period: 3, classId: 'c-5', subjectId: 's-3', teacherId: 't-1' }, // V. Matek
    { id: 's-22', day: 1, period: 5, classId: 'c-5', subjectId: 's-10', teacherId: 't-6' }, // V. Tesi
    { id: 's-23', day: 1, period: 6, classId: 'c-5', subjectId: 's-11', teacherId: 't-7' }, // V. Info

    { id: 's-24', day: 1, period: 1, classId: 'c-6', subjectId: 's-1', teacherId: 't-2' }, // VI. Magyar
    { id: 's-25', day: 1, period: 2, classId: 'c-6', subjectId: 's-2', teacherId: 't-3' }, // VI. Német
    { id: 's-26', day: 1, period: 3, classId: 'c-6', subjectId: 's-11', teacherId: 't-7' }, // VI. Info
    { id: 's-27', day: 1, period: 4, classId: 'c-6', subjectId: 's-16', teacherId: 't-4' }, // VI. Nemzetiségi
    { id: 's-28', day: 1, period: 5, classId: 'c-6', subjectId: 's-3', teacherId: 't-1' }, // VI. Matek

    { id: 's-29', day: 1, period: 1, classId: 'c-7', subjectId: 's-2', teacherId: 't-3' }, // VII. Német
    { id: 's-30', day: 1, period: 2, classId: 'c-7', subjectId: 's-3', teacherId: 't-1' }, // VII. Matek
    { id: 's-31', day: 1, period: 3, classId: 'c-7', subjectId: 's-1', teacherId: 't-2' }, // VII. Magyar
    { id: 's-32', day: 1, period: 4, classId: 'c-7', subjectId: 's-10', teacherId: 't-6' }, // VII. Tesi
    { id: 's-33', day: 1, period: 5, classId: 'c-7', subjectId: 's-11', teacherId: 't-7' }, // VII. Info

    // SZERDA
    { id: 's-34', day: 2, period: 1, classId: 'c-5', subjectId: 's-15', teacherId: 't-6' }, // V. Birkózás
    { id: 's-35', day: 2, period: 2, classId: 'c-5', subjectId: 's-15', teacherId: 't-6' }, // V. Birkózás
    { id: 's-36', day: 2, period: 3, classId: 'c-5', subjectId: 's-1', teacherId: 't-2' }, // V. Magyar
    { id: 's-37', day: 2, period: 4, classId: 'c-5', subjectId: 's-3', teacherId: 't-1' }, // V. Matek
    { id: 's-38', day: 2, period: 5, classId: 'c-5', subjectId: 's-2', teacherId: 't-3' }, // V. Német

    { id: 's-39', day: 2, period: 1, classId: 'c-6', subjectId: 's-2', teacherId: 't-3' }, // VI. Német
    { id: 's-40', day: 2, period: 2, classId: 'c-6', subjectId: 's-1', teacherId: 't-2' }, // VI. Magyar
    { id: 's-41', day: 2, period: 3, classId: 'c-6', subjectId: 's-5', teacherId: 't-5' }, // VI. Természetism.
    { id: 's-42', day: 2, period: 4, classId: 'c-6', subjectId: 's-4', teacherId: 't-4' }, // VI. Történelem
    { id: 's-43', day: 2, period: 5, classId: 'c-6', subjectId: 's-3', teacherId: 't-1' }, // VI. Matek

    { id: 's-44', day: 2, period: 1, classId: 'c-7', subjectId: 's-1', teacherId: 't-2' }, // VII. Magyar
    { id: 's-45', day: 2, period: 2, classId: 'c-7', subjectId: 's-8', teacherId: 't-5' }, // VII. Kémia
    { id: 's-46', day: 2, period: 3, day_split: true, classId: 'c-7', subjectId: 's-2', teacherId: 't-3' }, // VII. Német
    { id: 's-47', day: 2, period: 4, classId: 'c-7', subjectId: 's-6', teacherId: 't-5' }, // VII. Biológia
    { id: 's-48', day: 2, period: 5, classId: 'c-7', subjectId: 's-4', teacherId: 't-4' }, // VII. Történelem

    // CSÜTÖRTÖK
    { id: 's-49', day: 3, period: 1, classId: 'c-5', subjectId: 's-13', teacherId: 't-8' }, // V. Rajz
    { id: 's-50', day: 3, period: 2, classId: 'c-5', subjectId: 's-1', teacherId: 't-2' }, // V. Magyar
    { id: 's-51', day: 3, period: 3, classId: 'c-5', subjectId: 's-2', teacherId: 't-3' }, // V. Német
    { id: 's-52', day: 3, period: 4, classId: 'c-5', subjectId: 's-10', teacherId: 't-6' }, // V. Tesi
    { id: 's-53', day: 3, period: 5, classId: 'c-5', subjectId: 's-12', teacherId: 't-8' }, // V. Technika

    { id: 's-54', day: 3, period: 1, classId: 'c-6', subjectId: 's-2', teacherId: 't-3' }, // VI. Német
    { id: 's-55', day: 3, period: 2, classId: 'c-6', subjectId: 's-5', teacherId: 't-5' }, // VI. Természetism.
    { id: 's-56', day: 3, period: 3, classId: 'c-6', subjectId: 's-12', teacherId: 't-8' }, // VI. Technika
    { id: 's-57', day: 3, period: 4, classId: 'c-6', subjectId: 's-1', teacherId: 't-2' }, // VI. Magyar
    { id: 's-58', day: 3, period: 5, classId: 'c-6', subjectId: 's-10', teacherId: 't-6' }, // VI. Tesi

    { id: 's-59', day: 3, period: 1, classId: 'c-7', subjectId: 's-7', teacherId: 't-7' }, // VII. Fizika
    { id: 's-60', day: 3, period: 2, classId: 'c-7', subjectId: 's-1', teacherId: 't-2' }, // VII. Magyar
    { id: 's-61', day: 3, period: 3, classId: 'c-7', subjectId: 's-3', teacherId: 't-1' }, // VII. Matek
    { id: 's-62', day: 3, period: 4, classId: 'c-7', subjectId: 's-2', teacherId: 't-3' }, // VII. Német
    { id: 's-63', day: 3, period: 5, classId: 'c-7', subjectId: 's-9', teacherId: 't-4' }, // VII. Földrajz

    // PÉNTEK
    { id: 's-64', day: 4, period: 1, classId: 'c-5', subjectId: 's-2', teacherId: 't-3' }, // V. Német
    { id: 's-65', day: 4, period: 2, classId: 'c-5', subjectId: 's-3', teacherId: 't-1' }, // V. Matek

    { id: 's-66', day: 4, period: 1, classId: 'c-6', subjectId: 's-3', teacherId: 't-1' }, // VI. Matek
    { id: 's-67', day: 4, period: 2, classId: 'c-6', subjectId: 's-10', teacherId: 't-6' }, // VI. Tesi
    { id: 's-68', day: 4, period: 4, classId: 'c-6', subjectId: 's-2', teacherId: 't-3' }, // VI. Német
    { id: 's-69', day: 4, period: 5, classId: 'c-6', subjectId: 's-13', teacherId: 't-8' }, // VI. Rajz

    { id: 's-70', day: 4, period: 1, classId: 'c-7', subjectId: 's-10', teacherId: 't-6' }, // VII. Tesi
    { id: 's-71', day: 4, period: 2, classId: 'c-7', subjectId: 's-2', teacherId: 't-3' }, // VII. Német
    { id: 's-72', day: 4, period: 3, classId: 'c-7', subjectId: 's-3', teacherId: 't-1' }, // VII. Matek
    { id: 's-73', day: 4, period: 4, classId: 'c-7', subjectId: 's-8', teacherId: 't-5' }, // VII. Kémia
    { id: 's-74', day: 4, period: 5, classId: 'c-7', subjectId: 's-1', teacherId: 't-2' }, // VII. Magyar
  ] as (TimetableSlot & { day_split?: boolean })[],
  updatedAt: new Date().toISOString(),
};
