import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const updateFormSchema = z.object({
    username: z.string().optional(),
    email: z.union([
        z.string().email("Invalid email format"),
        z.literal("")
    ]).optional(),
    password: z.union([
        z.string().min(6, "Password must be at least 6 characters"),
        z.literal("")
    ]).optional(),
    confirmPassword: z.string().optional(),
    }).refine((data) => {
    // Only validate password confirmation if password is provided
    if (data.password && data.password !== "") {
        return data.password === data.confirmPassword;
    }
    return true;
    }, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type UpdateFormValues = z.infer<typeof updateFormSchema>

export function useUpdateForm(onSubmit: (data: UpdateFormValues) => void) {
    const form = useForm<UpdateFormValues>({
        resolver: zodResolver(updateFormSchema),
        defaultValues: {
            email: "",
            username: "",
            password: "",
            confirmPassword: ""
        }
    });

    const handleSubmit = form.handleSubmit(onSubmit);

    return { form, handleSubmit }
}