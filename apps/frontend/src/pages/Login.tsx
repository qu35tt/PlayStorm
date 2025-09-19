import { useState } from "react"
import { LoginForm } from "../components/LoginForm"
import { RegisterForm } from "@/components/RegisterForm";

export function Login() {
    const[isLogging, setIsLogging] = useState(true);

    return(
        <div className="w-screen h-screen relative">
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