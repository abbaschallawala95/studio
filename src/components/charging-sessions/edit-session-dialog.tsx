'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Timestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { updateChargingSession } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/firebase';
import type { ChargingSession } from '@/lib/types';
import { Textarea } from '../ui/textarea';

const formSchema = z
  .object({
    date: z.date({
      required_error: 'A date is required.',
    }),
    startTime: z.string().min(1, 'Start time is required.').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    endTime: z.string().min(1, 'End time is required.').regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    startPercentage: z.coerce.number().min(0).max(100),
    endPercentage: z.coerce.number().min(0).max(100),
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

export function EditSessionDialog({ session, children }: { session: ChargingSession, children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [isPending, startTransition] = React.useTransition();
  const { toast } = useToast();
  const { user } = useUser();

  const sessionDate = session.date instanceof Timestamp ? session.date.toDate() : new Date(session.date);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      startPercentage: session.startPercentage,
      endPercentage: session.endPercentage,
      notes: session.notes || '',
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({ title: 'Error', description: 'You must be logged in to edit a session.', variant: 'destructive' });
      return;
    }
    const formData = new FormData();
    formData.append('date', values.date.toISOString());
    formData.append('startTime', values.startTime);
    formData.append('endTime', values.endTime);
    formData.append('startPercentage', values.startPercentage.toString());
    formData.append('endPercentage', values.endPercentage.toString());
    if (values.notes) {
      formData.append('notes', values.notes);
    }

    startTransition(async () => {
      const result = await updateChargingSession(user.uid, session.id, formData);
      if (result?.message.includes('Error')) {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success',
          description: result.message,
        });
        setOpen(false);
      }
    });
  };

  React.useEffect(() => {
    if (open) {
        const sessionDate = session.date instanceof Timestamp ? session.date.toDate() : new Date(session.date);
        form.reset({
            date: sessionDate,
            startTime: session.startTime,
            endTime: session.endTime,
            startPercentage: session.startPercentage,
            endPercentage: session.endPercentage,
            notes: session.notes || '',
        });
    }
  }, [open, session, form]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Charging Session</DialogTitle>
          <DialogDescription>Update the details for your charging session.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="startPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Percentage: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Percentage: {field.value}%</FormLabel>
                  <FormControl>
                    <Slider
                      value={[field.value]}
                      onValueChange={(values) => field.onChange(values[0])}
                      max={100}
                      step={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., used a fast charger, cost, etc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
