"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@client/components/ui/card';
import { Input } from '@client/components/ui/input';
import { Button } from '@client/components/ui/button';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@client/components/ui/form';

const securityFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password must be at least 6 characters." }),
  newPassword: z.string().min(6, { message: "New password must be at least 6 characters." }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters." }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});

export function SecurityForm() {
  const form = useForm<z.infer<typeof securityFormSchema>>({
    resolver: zodResolver(securityFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: z.infer<typeof securityFormSchema>) => {
    form.reset({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    toast.success('Password updated successfully');
  };

  return (
    <Card className="p-6 bg-card/30 backdrop-blur-sm border-border/50">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="currentPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Current Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter your current password" className="bg-background/50 border-border/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter your new password" className="bg-background/50 border-border/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Confirm new password" className="bg-background/50 border-border/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={!form.formState.isDirty}
              className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save password
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
