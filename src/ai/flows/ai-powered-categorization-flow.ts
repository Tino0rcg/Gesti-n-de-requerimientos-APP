'use server';
/**
 * @fileOverview An AI agent that suggests a category and priority for IT support tickets.
 *
 * - categorizeTicket - A function that handles the ticket categorization process.
 * - CategorizeTicketInput - The input type for the categorizeTicket function.
 * - CategorizeTicketOutput - The return type for the categorizeTicket function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeTicketInputSchema = z.object({
  ticketDescription: z.string().describe('The detailed description of the IT support ticket.'),
});
export type CategorizeTicketInput = z.infer<typeof CategorizeTicketInputSchema>;

const CategorizeTicketOutputSchema = z.object({
  suggestedCategory: z
    .enum(['Network', 'Software', 'Hardware', 'Account', 'Security', 'Other'])
    .describe('The suggested category for the ticket.'),
  suggestedPriority: z.enum(['Low', 'Medium', 'High', 'Critical']).describe('The suggested priority level for the ticket.'),
});
export type CategorizeTicketOutput = z.infer<typeof CategorizeTicketOutputSchema>;

export async function categorizeTicket(input: CategorizeTicketInput): Promise<CategorizeTicketOutput> {
  return categorizeTicketFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeTicketPrompt',
  input: {schema: CategorizeTicketInputSchema},
  output: {schema: CategorizeTicketOutputSchema},
  prompt: `You are an expert IT support agent responsible for triaging incoming support tickets.

Your task is to analyze the provided ticket description and suggest the most appropriate category and priority level.

Choose the category from the following options: 'Network', 'Software', 'Hardware', 'Account', 'Security', 'Other'.
Choose the priority from the following options: 'Low', 'Medium', 'High', 'Critical'.

Ticket Description: {{{ticketDescription}}}`,
});

const categorizeTicketFlow = ai.defineFlow(
  {
    name: 'categorizeTicketFlow',
    inputSchema: CategorizeTicketInputSchema,
    outputSchema: CategorizeTicketOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to categorize ticket: AI did not return an output.');
    }
    return output;
  }
);
