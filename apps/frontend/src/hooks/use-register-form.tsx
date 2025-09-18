import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
//Schéma Formu
export const registerFormSchema = z.object({
  email: z.string().min(2, { message: "Username must be at least 2 characters." }),
  username: z.string().min(4, { message: "Username must have at least 4 characters"}),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

export type RegisterFormValues = z.infer<typeof registerFormSchema>;
//Hook pro login form
export function useRegisterForm(onSubmit: (data: RegisterFormValues) => void) {
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
    },
  });

  // Wrap the provided onSubmit with react-hook-form's handleSubmit
  const handleSubmit = form.handleSubmit(onSubmit);

  return { form, handleSubmit };
}