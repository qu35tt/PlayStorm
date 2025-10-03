import { useRegisterForm } from "../hooks/use-register-form";
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

export function RegisterForm({stateChanger}: any) {
    const user = useUserStore()
    const nav = useNavigate();

    const { form, handleSubmit } = useRegisterForm(async (data) => {
        try{
            await axios.post(`${import.meta.env.VITE_API_URL}auth/register`, {
                email: data.email,
                password: data.password,
                username: data.username
            })
            .then(function (response){
                user.setId(response.data.id);
                user.setToken(response.data.access_token);

                nav("/home");
            })
            .catch(function (err){
                console.error(err)
            })
        } 
        catch(err){
            console.log(err)
        }
    });

    return (
        <div className="flex justify-center items-center p-0 m-0 z-50 text-white">
            <div className=" w-[35rem] h-[40rem] backdrop-blur-lg border border-gray-600 rounded-lg shadow-lg">
                <div className="text-6xl font-extrabold h-[10rem] flex justify-start items-center mx-[4rem] animate-fadein">Sign Up</div>
                <Form {...form}>
                    <form onSubmit={handleSubmit} className="space-y-6 px-[4rem] flex flex-col">
                        <FormField
                            control={form.control}
                            name="username"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-2xl">Username</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="bg-[#0E111A] h-[3rem]" 
                                            placeholder="Enter Username..." 
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel className="text-2xl">Email</FormLabel>
                                    <FormControl>
                                        <Input 
                                            className="bg-[#0E111A] h-[3rem]" 
                                            placeholder="Enter Email..." 
                                            {...field}
                                        />
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
                                        <Input 
                                            className="bg-[#0E111A] h-[3rem]" 
                                            type="password" 
                                            placeholder="Enter Password..." 
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                        <Button 
                            type="submit" 
                            className="bg-[#3B82F6] hover:bg-[#06B6D4] text-2xl w-[10rem] h-[4rem] mx-auto cursor-pointer transition-colors"
                        >
                            Register!
                        </Button>

                        <div className="mx-auto text-xl font-semibold cursor-default">
                            Již máte účet? 
                            <a className="text-[#3B82F6] cursor-pointer hover:underline ml-1" onClick={() => stateChanger(true)}>
                                Přihlásit se!
                            </a>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}