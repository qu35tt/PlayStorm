import { useState } from "react"
import { LoginForm } from "../components/login-form"
import { RegisterForm } from "../components/register-form";
import { Rain } from "@/components/rain"
import { useUser } from "@/context/user-context";
import { useUserStore } from '@/stores/user-store'

export function Login() {
    const[isLogging, setIsLogging] = useState(true);
    const user = useUserStore()
    const { clearUser }= useUser();

    function resetData(){
        user.clearId();
        user.clearToken();
        clearUser();
    }

    return(
        <div className="w-screen h-screen relative" onLoad={resetData}>
            
            <Rain />
            <img
                src="/logo.svg"
                className="w-[20rem] h-[10rem] p-6 object-contain z-10 block"
                alt="Logo"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
                {isLogging ? 
                    <LoginForm stateChanger={setIsLogging}/>
                    :
                    <RegisterForm stateChanger={setIsLogging}/>
                }
            </div>
        </div>
    )
}