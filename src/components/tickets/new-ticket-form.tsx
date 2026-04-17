'use client';

import { useForm, useFormState } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFormState as useActionFormState, useFormStatus } from 'react-dom';
import React, { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createTicket, getAiSuggestions, NewTicketState } from '@/lib/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';


const ticketSchema = z.object({
  subject: z.string().min(5, {
    message: 'Subject must be at least 5 characters.',
  }),
  description: z.string().min(10, {
    message: 'Description must be at least 10 characters.',
  }),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  category: z.enum(['Network', 'Software', 'Hardware', 'Account', 'Security', 'Other']),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

function SubmitButton() {
    const { pending } = useFormStatus();
  
    return (
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Ticket
      </Button>
    );
}

export function NewTicketForm() {
  const [isAiPending, startAiTransition] = useTransition();
  const { toast } = useToast();
  
  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: '',
      description: '',
      priority: 'Medium',
      category: 'Other',
    },
  });

  const { control, getValues, setValue } = form;
  const { isDirty, isValid } = useFormState({ control });

  const initialState: NewTicketState = { message: null, errors: {} };
  const [state, dispatch] = useActionFormState(createTicket, initialState);

  React.useEffect(() => {
    if (state.message && !state.errors) {
        toast({
            title: "Success",
            description: state.message,
        })
        form.reset();
    } else if (state.message && state.errors) {
        toast({
            title: "Error",
            description: state.message,
            variant: "destructive",
        })
    }
  }, [state, toast, form]);


  const handleAiSuggestion = () => {
    const description = getValues('description');
    startAiTransition(async () => {
      const result = await getAiSuggestions(description);
      if (result.error) {
        toast({
            title: "AI Suggestion Error",
            description: result.error,
            variant: "destructive",
        });
      } else if(result.suggestedCategory && result.suggestedPriority) {
        setValue('category', result.suggestedCategory, { shouldValidate: true });
        setValue('priority', result.suggestedPriority, { shouldValidate: true });
        toast({
            title: "AI Suggestions Applied",
            description: `Category set to ${result.suggestedCategory} and Priority set to ${result.suggestedPriority}.`
        });
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new support ticket</CardTitle>
        <CardDescription>
          Fill out the form below and our IT team will get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
            <form action={dispatch} className="space-y-8">
                <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Cannot connect to Wi-Fi" {...field} />
                        </FormControl>
                        <FormDescription>
                            A brief summary of your issue.
                        </FormDescription>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea
                                placeholder="Describe your issue in detail..."
                                className="min-h-[150px]"
                                {...field}
                                />
                            </FormControl>
                            <FormDescription>
                                The more details you provide, the faster we can resolve your issue.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow">
                        <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Network">Network</SelectItem>
                                    <SelectItem value="Software">Software</SelectItem>
                                    <SelectItem value="Hardware">Hardware</SelectItem>
                                    <SelectItem value="Account">Account</SelectItem>
                                    <SelectItem value="Security">Security</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a priority level" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                    <SelectItem value="Critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleAiSuggestion}
                        disabled={isAiPending || getValues('description').length < 10}
                        className="w-full sm:w-auto"
                    >
                        {isAiPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                        )}
                        Suggest with AI
                    </Button>
                </div>
                
                <SubmitButton />

            </form>
        </Form>
      </CardContent>
    </Card>
  );
}
