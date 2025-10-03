import { RouterProvider } from "react-router/dom";
import { router } from "./services/router"
import { Toaster } from "@/components/ui/sonner"


function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors/>
    </>
  )
}

export default App
