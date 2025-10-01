import { RouterProvider } from "react-router/dom";
import { router } from "./services/router"
import { Toaster } from "@/components/ui/sonner"
import { ModalProvider } from "./providers/modal-provider"

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors/>
      <ModalProvider />
    </>
  )
}

export default App
