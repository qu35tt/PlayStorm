import { RouterProvider } from "react-router/dom";
import { router } from "./services/router"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "./context/socket-context";
import { SocketManager } from '@/components/socketManager';

function App() {
  return (
    <>
      <SocketProvider>
        {/* <SocketManager /> */}
        <RouterProvider router={router} />
        <Toaster position="top-center" richColors/>
      </SocketProvider>
    </>
  )
}

export default App
