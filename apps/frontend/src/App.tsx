import { RouterProvider } from "react-router/dom";
import { router } from "./services/router"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "./context/socket-context";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SocketEventHandler } from "@/components/SocketEventHandler";


function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <SocketEventHandler />
          <RouterProvider router={router} />
          <Toaster position="top-center" richColors/>
        </SocketProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </>
  )
}

export default App
