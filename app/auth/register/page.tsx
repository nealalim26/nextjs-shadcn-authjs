"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { Eye, EyeOff, Loader2, Check, X } from "lucide-react"

const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

interface PasswordRequirement {
  label: string
  test: (password: string) => boolean
  icon: React.ReactNode
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = form.watch("password")

  const passwordRequirements: PasswordRequirement[] = [
    {
      label: "At least 8 characters",
      test: (pwd: string) => pwd.length >= 8,
      icon: <Check className="h-4 w-4" />
    },
    {
      label: "One lowercase letter",
      test: (pwd: string) => /[a-z]/.test(pwd),
      icon: <Check className="h-4 w-4" />
    },
    {
      label: "One uppercase letter",
      test: (pwd: string) => /[A-Z]/.test(pwd),
      icon: <Check className="h-4 w-4" />
    },
    {
      label: "One number",
      test: (pwd: string) => /[0-9]/.test(pwd),
      icon: <Check className="h-4 w-4" />
    },
    {
      label: "One special character",
      test: (pwd: string) => /[^A-Za-z0-9]/.test(pwd),
      icon: <Check className="h-4 w-4" />
    },
  ]

  const passwordStrength = useMemo(() => {
    if (!password) return 0
    const passedRequirements = passwordRequirements.filter(req => req.test(password)).length
    return (passedRequirements / passwordRequirements.length) * 100
  }, [password])

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500"
    if (strength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log("Register data:", data)
      // Handle success
    } catch (error) {
      console.error("Error:", error)
      // Handle error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Form */}
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
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Create an account</h1>
                <p className="text-gray-600 mt-1">Get started with NealUI today.</p>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="nealalim26@lebryne.com"
                          className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />

                      {/* Password Strength Progress */}
                      {password && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Password strength</span>
                            <span className={`font-medium ${passwordStrength < 40 ? 'text-red-600' :
                              passwordStrength < 80 ? 'text-yellow-600' : 'text-green-600'
                              }`}>
                              {passwordStrength < 40 ? 'Weak' :
                                passwordStrength < 80 ? 'Medium' : 'Strong'}
                            </span>
                          </div>
                          <Progress value={passwordStrength} className="h-2" />
                          <div className="space-y-1">
                            {passwordRequirements.map((requirement, index) => (
                              <div key={index} className="flex items-center space-x-2 text-xs">
                                <span className={`${requirement.test(password) ? 'text-green-600' : 'text-gray-400'
                                  }`}>
                                  {requirement.test(password) ? requirement.icon : <X className="h-4 w-4" />}
                                </span>
                                <span className={requirement.test(password) ? 'text-green-600' : 'text-gray-500'}>
                                  {requirement.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="mt-1 w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full py-2 px-4 rounded-md font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account →"
                )}
              </Button>

              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
                  Login
                </Link>
              </p>
            </form>
          </Form>

          {/* Footer */}
          <div className="mt-16">
            <p className="text-gray-500 text-sm">© 2025 NealUI</p>
          </div>
        </div>
      </div>

      {/* Right Column - Image */}
      <div className="flex-1 relative">
        <img
          src="/placeholder.svg?height=800&width=600"
          alt="Register background"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
