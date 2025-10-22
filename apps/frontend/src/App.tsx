import { RouterProvider } from "react-router/dom";
import { router } from "./services/router"
import { Toaster } from "@/components/ui/sonner"

import { useEffect } from 'react';
import { useSocket } from './context/socket-context';
import { useWatchPartyStore } from './stores/socketStore';

function App() {
  const socket = useSocket();

  const initializeListeners = useWatchPartyStore((state) => state.initializeListeners);

  useEffect(() => {
    initializeListeners(socket);
  }, [socket, initializeListeners]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors/>
    </>
  )
}

export default App
