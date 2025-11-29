'use server';

/**
 * @fileOverview A flow for generating insights into charging data.
 *
 * - generateChargingInsights - A function that generates insights from charging data.
 * - ChargingDataInsightsInput - The input type for the generateChargingInsights function.
 * - ChargingDataInsightsOutput - The return type for the generateChargingInsights function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChargingDataInsightsInputSchema = z.object({
  chargingSessions: z.array(
    z.object({
      date: z.string().describe('The date of the charging session.'),
      startTime: z.string().describe('The start time of the charging session.'),
      endTime: z.string().describe('The end time of the charging session.'),
      startPercentage: z
        .number()
        .describe('The initial charge percentage at the start of the session.'),
      endPercentage: z
        .number()
        .describe('The final charge percentage at the end of the session.'),
    })
  ).describe('An array of charging session objects.'),
});
export type ChargingDataInsightsInput = z.infer<typeof ChargingDataInsightsInputSchema>;

const ChargingDataInsightsOutputSchema = z.object({
  totalChargingTime: z
    .string()
    .describe('The total charging time across all sessions.'),
  averageChargePerSession: z
    .string()
    .describe('The average charge gained per charging session.'),
  mostFrequentChargingTimes: z
    .string()
    .describe('The most frequent charging times.'),
  totalEnergyConsumed: z
    .string()
    .describe('The total energy consumed across all sessions in kWh.'),
});
export type ChargingDataInsightsOutput = z.infer<typeof ChargingDataInsightsOutputSchema>;

export async function generateChargingInsights(
  input: ChargingDataInsightsInput
): Promise<ChargingDataInsightsOutput> {
  return chargingDataInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chargingDataInsightsPrompt',
  input: {schema: ChargingDataInsightsInputSchema},
  output: {schema: ChargingDataInsightsOutputSchema},
  prompt: `You are an AI assistant specializing in analyzing electric scooter charging data. Your task is to provide insightful summaries based on the user's charging history.

  ASSUMPTIONS FOR CALCULATION:
  - The electric scooter has an average battery capacity of 0.5 kWh (500Wh).

  CALCULATIONS:
  1. For each session, calculate the energy consumed in kWh. The formula is: (endPercentage - startPercentage) / 100 * 0.5 kWh.
  2. Calculate 'totalEnergyConsumed' by summing the energy consumed from all sessions. Format it to two decimal places (e.g., "1.23 kWh").
  3. Calculate 'totalChargingTime' by summing the duration of all sessions. Provide a human-readable format (e.g., "1 day 4 hours").
  4. Calculate 'averageChargePerSession' as the average percentage points gained per session.
  5. Determine the 'mostFrequentChargingTimes' by analyzing the start times of the sessions (e.g., "Late Evening").

  USER DATA:
  {{#each chargingSessions}}
  - Date: {{date}}, Start: {{startTime}} ({{startPercentage}}%), End: {{endTime}} ({{endPercentage}}%)
  {{/each}}
  
  Please provide the output in the format specified by the output schema.
  `,
});

const chargingDataInsightsFlow = ai.defineFlow(
  {
    name: 'chargingDataInsightsFlow',
    inputSchema: ChargingDataInsightsInputSchema,
    outputSchema: ChargingDataInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
