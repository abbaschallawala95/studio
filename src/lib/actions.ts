'use server';

import { z } from 'zod';
import { placeholderSessions } from './placeholder-data';
import type { ChargingSession } from './types';
import { revalidatePath } from 'next/cache';

// In a real application, this would fetch from a database like Firestore.
export async function getChargingSessions(): Promise<ChargingSession[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Sort by date descending by default
      const sortedSessions = [...placeholderSessions].sort((a, b) => b.date.getTime() - a.date.getTime());
      resolve(sortedSessions);
    }, 500); // Simulate network delay
  });
}

const formSchema = z
  .object({
    date: z.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
    startPercentage: z.coerce.number().min(0).max(100),
    endPercentage: z.coerce.number().min(0).max(100),
  })
  .refine((data) => data.endPercentage > data.startPercentage, {
    message: 'End percentage must be greater than start percentage.',
    path: ['endPercentage'],
  });

// This is a stub. In a real app, you'd insert into a database.
export async function addChargingSession(prevState: unknown, formData: FormData) {
  const validatedFields = formSchema.safeParse({
    date: new Date(formData.get('date') as string),
    startTime: formData.get('startTime'),
    endTime: formData.get('endTime'),
    startPercentage: formData.get('startPercentage'),
    endPercentage: formData.get('endPercentage'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Error: Please check the form fields.',
    };
  }

  // Here you would add the data to your Firestore database.
  // For demonstration, we'll just log it.
  console.log('New session added (simulated):', validatedFields.data);

  revalidatePath('/');
  return { message: 'Successfully added charging session.', errors: {} };
}

// This is a stub. In a real app, you'd delete from the database.
export async function deleteChargingSession(id: string) {
  console.log('Deleting session (simulated):', id);
  // Here you would delete the item from your Firestore database.
  revalidatePath('/');
}
