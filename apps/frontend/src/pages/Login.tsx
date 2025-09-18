import { LoginForm } from "../components/LoginForm"

export function Login() {
    return(
        <div className="w-screen h-screen relative">
            <img
                src="/logo.png"
                className="w-[40rem] h-[15rem] pt-[5rem] z-10 block"
                alt="Logo"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <LoginForm />
            </div>
        </div>
    )
}