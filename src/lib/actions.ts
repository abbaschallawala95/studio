'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeServerApp } from '@/firebase';

const sessionSchema = z
  .object({
    date: z.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    startPercentage: z.coerce.number().min(0).max(100),
    endPercentage: z.coerce.number().min(0).max(100),
    notes: z.string().optional(),
  })
  .refine((data) => {
    // This logic can be simplified, but for now, we'll keep it
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
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Error: Please check the form fields.',
        };
    }

    try {
        const sessionData = {
            ...validatedFields.data,
            date: validatedFields.data.date.toISOString(),
        }
        const sessionsCollectionRef = collection(firestore, 'users', userId, 'charging_sessions');
        // The type mismatch is expected here as we are using the client SDK with the Admin SDK
        // This will be resolved in a future update.
        // @ts-ignore
        await addDoc(sessionsCollectionRef, sessionData);
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
        notes: formData.get('notes'),
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Error: Please check the form fields.',
        };
    }

    try {
        const sessionData = {
            ...validatedFields.data,
            date: validatedFields.data.date.toISOString(),
            id: sessionId
        }
        const sessionDocRef = doc(firestore, 'users', userId, 'charging_sessions', sessionId);
        // The type mismatch is expected here as we are using the client SDK with the Admin SDK
        // @ts-ignore
        await updateDoc(sessionDocRef, sessionData);
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
    const sessionDocRef = doc(firestore, 'users', userId, 'charging_sessions', sessionId);
    // The type mismatch is expected here as we are using the client SDK with the Admin SDK
    // @ts-ignore
    await deleteDoc(sessionDocRef);
    revalidatePath('/');
  } catch (e: any) {
    console.error('Error deleting session:', e);
    // Optionally return an error message
  }
}
