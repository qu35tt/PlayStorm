import { useLoginForm } from "../hooks/use-login-form";

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function LoginForm() {

    const { form, handleSubmit } = useLoginForm((data) => {
        console.log(data);
    });

    return (
        <div className="flex justify-center items-center p-0 m-0 z-50">
            <div className="bg-[#1F2A3A] w-[35rem] h-[40rem]">
                <div className="text-6xl font-extrabold h-[10rem] flex justify-start items-center mx-[4rem] animate-fadein">Sign In</div>
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-6 px-[4rem] flex flex-col">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-2xl">Username</FormLabel>
                                    <FormControl>
                                        <Input className="bg-[#273444] h-[3rem]" placeholder="Enter Username..." {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-2xl">Password</FormLabel>
                                    <FormControl>
                                        <Input className="bg-[#273444] h-[3rem]" type="password" placeholder="Enter Password..." {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-[#FF6B35] text-2xl w-[10rem] h-[4rem] mx-auto cursor-pointer">Log In!</Button>

                        <a className="mx-auto text-xl font-semibold text-[#00C9D6] cursor-pointer hover:underline">Zapomenuté heslo?</a>
                        <div className="mx-auto text-xl font-semibold cursor-default">Nemáte jěště účet? <a className="text-[#00C9D6] cursor-pointer hover:underline">Vytvořit účet?</a></div>
                    </form>
                </Form>
            </div>
        </div>
        
    )
}