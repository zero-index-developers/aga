"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@client/components/ui/card';
import { Input } from '@client/components/ui/input';
import { Button } from '@client/components/ui/button';
import { Badge } from '@client/components/ui/badge';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/components/ui/form';

const profileFormSchema = z.object({
  fullName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function ProfileForm() {
  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "John Doe",
      email: "john.doe@example.com",
    },
  });

  const onSubmit = (values: z.infer<typeof profileFormSchema>) => {
    form.reset(values);
    toast.success('Profile updated successfully');
  };

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 min-w-md">
          <div className="space-y-2">
            <label className="text-sm font-medium">Account</label>
            <Input defaultValue="johndoe" disabled className="bg-background/50 border-border/50 opacity-70" />
          </div>

          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-background/50 border-border/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Email</FormLabel>
                <div className="flex items-center gap-3">
                  <FormControl>
                    <Input {...field} type="email" className="bg-background/50 border-border/50 flex-1" />
                  </FormControl>
                  <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 shrink-0 py-1.5">Verified</Badge>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!form.formState.isDirty}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save profile
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
