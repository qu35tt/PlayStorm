import { useLoginForm } from "../hooks/use-login-form";
import axios from "axios";
import { useNavigate } from "react-router";

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
import { useUserStore } from '../stores/userStore'

import { toast } from "sonner"

export function LoginForm({stateChanger}: any) {
    const user_ = useUserStore()
    const nav = useNavigate();

    const { form, handleSubmit } = useLoginForm(async (data) => {
        try{
            await axios.post(`${import.meta.env.VITE_API_URL}auth/login`, {
                email: data.email,
                password: data.password
            })
            .then(function (response){
                user_.setId(response.data.id);
                user_.setToken(response.data.access_token);

                nav("/home");
            })
            .catch(function (err){
                console.error(err)
                toast.error("Špatné přihlašovací údaje!", {duration: 2000});
            })
        } 
        catch(err){
            console.log(err)
            toast.error("Špatné přihlašovací údaje!", {duration: 2000});
        }
    });

    return (
        <div className="flex justify-center items-center p-0 m-0 z-50 text-white">
            <div className="w-[35rem] h-[40rem] backdrop-blur-lg rounded-lg border border-white/30">
                <div className="text-6xl font-extrabold h-[10rem] flex justify-start items-center mx-[4rem] animate-fadein">Sign In</div>
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-6 px-[4rem] flex flex-col">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-2xl">Email</FormLabel>
                                    <FormControl>
                                        <Input className="bg-[#0E111A] h-[3rem]" placeholder="Enter Email..." {...field}/>
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
                                        <Input className="bg-[#0E111A] h-[3rem]" type="password" placeholder="Enter Password..." {...field}/>
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="bg-[#3B82F6] text-2xl w-[10rem] h-[4rem] mx-auto cursor-pointer hover:bg-[#06B6D4]">Log In!</Button>

                        <a className="mx-auto text-xl font-semibold text-[#3B82F6] cursor-pointer hover:underline">Zapomenuté heslo?</a>
                        <div className="mx-auto text-xl font-semibold cursor-default">Nemáte jěště účet? <a className="text-[#3B82F6] cursor-pointer hover:underline" onClick={() => stateChanger(false)}>Vytvořit účet?</a></div>
                    </form>
                </Form>
            </div>
        </div>
        
    )
}