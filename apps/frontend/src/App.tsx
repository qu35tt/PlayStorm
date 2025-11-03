import { RouterProvider } from "react-router/dom";
import { router } from "./services/router"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "./context/socket-context";

function App() {
  return (
    <>
      <SocketProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors/>
      </SocketProvider>
    </>
  )
}

export default App
