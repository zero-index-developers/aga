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
  FormMessage,
} from '@client/components/ui/form';

const dangerFormSchema = z.object({
  confirmEmail: z.string(),
});

export function DangerZone() {
  const form = useForm<z.infer<typeof dangerFormSchema>>({
    resolver: zodResolver(dangerFormSchema),
    defaultValues: {
      confirmEmail: "",
    },
  });

  const onSubmit = (values: z.infer<typeof dangerFormSchema>) => {
    if (values.confirmEmail === "john.doe@example.com") {
      toast.success('Account deletion scheduled');
      form.reset();
    }
  };

  return (
    <Card className="p-6 border-red-500/20 bg-red-500/5 backdrop-blur-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="confirmEmail"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Type john.doe@example.com to confirm"
                    className="bg-background/50 border-red-500/30 focus-visible:ring-red-500"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="destructive"
              disabled={form.watch("confirmEmail") !== "john.doe@example.com"}
              className="bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete account
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
