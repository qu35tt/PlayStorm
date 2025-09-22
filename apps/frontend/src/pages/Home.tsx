import { Navbar } from "../components/Navbar"
import { Footer } from "../components/Footer"
import { Outlet } from "react-router"


export function Home() {
    return(
        <div className="w-screen h-screen flex flex-col">
            <Navbar />
            <Outlet />
            <Footer />
        </div>
    )
}