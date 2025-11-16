import type { ChargingSession } from './types';

// This file is now deprecated as we are using Firestore.
// It is kept here for reference but is no longer used in the application.
export const placeholderSessions: ChargingSession[] = [
  {
    id: '1',
    date: new Date('2024-07-15'),
    startTime: '20:00',
    endTime: '23:30',
    startPercentage: 22,
    endPercentage: 95,
  },
  {
    id: '2',
    date: new Date('2024-07-18'),
    startTime: '21:30',
    endTime: '01:00',
    startPercentage: 15,
    endPercentage: 100,
  },
  {
    id: '3',
    date: new Date('2024-07-21'),
    startTime: '19:45',
    endTime: '22:15',
    startPercentage: 35,
    endPercentage: 88,
  },
  {
    id: '4',
    date: new Date('2024-07-24'),
    startTime: '22:00',
    endTime: '02:30',
    startPercentage: 10,
    endPercentage: 100,
  },
  {
    id: '5',
    date: new Date('2024-07-28'),
    startTime: '18:00',
    endTime: '21:00',
    startPercentage: 40,
    endPercentage: 92,
  },
  {
    id: '6',
    date: new Date('2024-07-30'),
    startTime: '23:00',
    endTime: '02:00',
    startPercentage: 18,
    endPercentage: 99,
  },
];
