"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { RegisterInputSchema, type RegisterInput } from "@voicenexus/contracts";
import { useForm } from "react-hook-form";

import { authApi } from "@/lib/api/auth-api";
import { ApiClientError } from "@/lib/api/client";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);
  const form = useForm<RegisterInput>({
    resolver: zodResolver(RegisterInputSchema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      organizationName: "",
      password: "",
    },
  });

  const registerMutation = useMutation({
    mutationFn: (input: RegisterInput) => authApi.register(input),
    onSuccess: (session) => {
      setSession(session);
      router.replace("/dashboard");
    },
  });

  const errorMessage =
    registerMutation.error instanceof ApiClientError
      ? registerMutation.error.message
      : registerMutation.error
        ? "Unable to create your account. Please try again."
        : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create your workspace</CardTitle>
        <CardDescription>
          Set up your first organization and owner account for VoiceNexus AI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={form.handleSubmit((values) => registerMutation.mutate(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input id="firstName" autoComplete="given-name" {...form.register("firstName")} />
            {form.formState.errors.firstName ? (
              <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input id="lastName" autoComplete="family-name" {...form.register("lastName")} />
            {form.formState.errors.lastName ? (
              <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="organizationName">Organization name</Label>
            <Input id="organizationName" {...form.register("organizationName")} />
            {form.formState.errors.organizationName ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.organizationName.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          {errorMessage ? (
            <p className="text-sm text-destructive sm:col-span-2">{errorMessage}</p>
          ) : null}

          <Button className="sm:col-span-2" disabled={registerMutation.isPending} type="submit">
            {registerMutation.isPending ? "Creating workspace..." : "Create workspace"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link className="font-medium text-slate-950 underline-offset-4 hover:underline" href="/login">
            Log in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
