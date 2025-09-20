'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Forgot password data:', data);
      // Handle success
    } catch (error) {
      console.error('Error:', error);
      // Handle error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Image */}
      <div className="flex-1 relative">
        <Image src="/placeholder.svg?height=800&width=600" alt="Forgot password background" fill className="object-cover" priority />
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center px-12 py-8 bg-white">
        <div className="max-w-sm mx-auto w-full">
          {/* Logo */}
          <div className="mb-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-black rounded-sm flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-sm transform rotate-45"></div>
              </div>
              <span className="text-xl font-semibold">NealUI</span>
            </div>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-semibold text-gray-900">Forgot Password?</h1>
                <p className="text-gray-600 mt-2 leading-relaxed">Enter the email associated with your account and we&apos;ll send you a link to reset your password.</p>
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">Email address</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full py-2 px-4 rounded-md font-medium" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Reset Password'
                )}
              </Button>

              <div className="flex justify-between text-sm">
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Back to Login
                </Link>
                <Link href="#" className="text-blue-600 hover:underline font-medium">
                  Need Help?
                </Link>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
