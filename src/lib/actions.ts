'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeServerApp } from '@/firebase/server';
import { generateChargingInsights } from '@/ai/flows/charging-data-insights';
import type { ChargingSession } from './types';
import { format } from 'date-fns';

const sessionSchema = z
  .object({
    date: z.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    startPercentage: z.coerce.number().min(0).max(100),
    endPercentage: z.coerce.number().min(0).max(100),
    energyConsumed: z.coerce.number().optional(),
    notes: z.string().optional(),
  })
  .refine((data) => {
    const start = new Date(`1970-01-01T${data.startTime}`);
    const end = new Date(`1970-01-01T${data.endTime}`);
    return end > start;
  }, {
    message: 'End time must be after start time.',
    path: ['endTime'],
  })
  .refine((data) => data.endPercentage > data.startPercentage, {
    message: 'End percentage must be greater than start percentage.',
    path: ['endPercentage'],
  });

export async function addChargingSession(userId: string, formData: FormData) {
    await initializeServerApp();
    const firestore = getFirestore();

    const validatedFields = sessionSchema.safeParse({
        date: new Date(formData.get('date') as string),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        startPercentage: formData.get('startPercentage'),
        endPercentage: formData.get('endPercentage'),
        energyConsumed: formData.get('energyConsumed'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Error: Please check the form fields.',
        };
    }

    try {
        const sessionRef = firestore.collection('users').doc(userId).collection('charging_sessions').doc();
        const sessionData = {
            ...validatedFields.data,
            id: sessionRef.id,
            date: Timestamp.fromDate(validatedFields.data.date),
        }
        await sessionRef.set(sessionData);
        revalidatePath('/');
        return { message: 'Successfully added charging session.', errors: {} };
    } catch (e: any) {
        return { message: `Error: Could not add session. ${e.message}`, errors: {} };
    }
}


export async function updateChargingSession(userId: string, sessionId: string, formData: FormData) {
    await initializeServerApp();
    const firestore = getFirestore();
    const validatedFields = sessionSchema.safeParse({
        date: new Date(formData.get('date') as string),
        startTime: formData.get('startTime'),
        endTime: formData.get('endTime'),
        startPercentage: formData.get('startPercentage'),
        endPercentage: formData.get('endPercentage'),
        energyConsumed: formData.get('energyConsumed'),
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error: Please check the form fields.',
        };
    }

    try {
        const sessionDocRef = firestore.collection('users').doc(userId).collection('charging_sessions').doc(sessionId);
        const sessionData = {
            ...validatedFields.data,
            date: Timestamp.fromDate(validatedFields.data.date),
        }
        await sessionDocRef.update(sessionData);
        revalidatePath('/');
        return { message: 'Successfully updated charging session.', errors: {} };
    } catch (e: any) {
        return { message: `Error: Could not update session. ${e.message}`, errors: {} };
    }
}


export async function deleteChargingSession(userId: string, sessionId: string) {
  await initializeServerApp();
  const firestore = getFirestore();
  try {
    const sessionDocRef = firestore.collection('users').doc(userId).collection('charging_sessions').doc(sessionId);
    await sessionDocRef.delete();
    revalidatePath('/');
  } catch (e: any) {
    console.error('Error deleting session:', e);
    return { message: `Error: Could not delete session. ${e.message}`, errors: {} };
  }
}

export async function getChargingInsights(sessions: ChargingSession[]) {
    if (sessions.length === 0) {
        return null;
    }
    try {
        const formattedSessions = sessions.map((s) => ({
            ...s,
            date: format(s.date instanceof Date ? s.date : (s.date as Timestamp).toDate(), 'yyyy-MM-dd'),
            startTime: s.startTime,
            endTime: s.endTime,
            startPercentage: s.startPercentage,
            endPercentage: s.endPercentage,
        }));

        const insights = await generateChargingInsights({ chargingSessions: formattedSessions });
        return insights;
    } catch (error) {
        console.error("Error generating charging insights:", error);
        return null;
    }
}
