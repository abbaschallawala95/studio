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
  prompt: `You are an AI assistant specializing in analyzing electric vehicle charging data and providing insights to users.

  Given the following charging session data, generate insights into the user's charging habits, including:
  - Total charging time across all sessions.
  - Average charge gained per session.
  - Most frequent charging times.

  Charging Session Data:
  {{#each chargingSessions}}
  - Date: {{date}}, Start Time: {{startTime}}, End Time: {{endTime}}, Start Percentage: {{startPercentage}}%, End Percentage: {{endPercentage}}%
  {{/each}}
  
  Consider all charging data when creating insights.
  
  Output the insights in a concise and easy-to-understand format. Make sure the total charging time is a humanized duration.
  Total Charging Time: {{totalChargingTime}}
  Average Charge Per Session: {{averageChargePerSession}}
  Most Frequent Charging Times: {{mostFrequentChargingTimes}}`,
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
