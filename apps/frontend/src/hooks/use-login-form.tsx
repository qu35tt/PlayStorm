import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
//Schéma Formu
export const loginFormSchema = z.object({
  email: z.string().min(2, { message: "Username must be at least 2 characters." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
//Hook pro login form
export function useLoginForm(onSubmit: (data: LoginFormValues) => void) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Wrap the provided onSubmit with react-hook-form's handleSubmit
  const handleSubmit = form.handleSubmit(onSubmit);

  return { form, handleSubmit };
}