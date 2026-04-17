"use server";

import { categorizeTicket } from "@/ai/flows/ai-powered-categorization-flow";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const NewTicketSchema = z.object({
  subject: z.string().min(1, "Subject is required."),
  description: z.string().min(1, "Description is required."),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  category: z.enum(['Network', 'Software', 'Hardware', 'Account', 'Security', 'Other']),
});

export type NewTicketState = {
  errors?: {
    subject?: string[];
    description?: string[];
    priority?: string[];
    category?: string[];
  };
  message?: string | null;
};

export async function createTicket(prevState: NewTicketState, formData: FormData) {
  const validatedFields = NewTicketSchema.safeParse({
    subject: formData.get("subject"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    category: formData.get("category"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Missing Fields. Failed to Create Ticket.",
    };
  }

  // In a real app, you would insert the data into a database.
  // For this demo, we'll just log it.
  console.log("New ticket created:", validatedFields.data);

  // Revalidate the dashboard path to show the new ticket
  revalidatePath("/dashboard");
  
  return {
    message: "Ticket created successfully.",
  };
}


export async function getAiSuggestions(description: string) {
    if (!description || description.trim().length < 10) {
        return { error: "Please provide a more detailed description (at least 10 characters)." };
    }

    try {
        const result = await categorizeTicket({ ticketDescription: description });
        return {
            suggestedCategory: result.suggestedCategory,
            suggestedPriority: result.suggestedPriority,
        };
    } catch (error) {
        console.error("AI suggestion failed:", error);
        return { error: "Failed to get AI suggestions. Please try again." };
    }
}
