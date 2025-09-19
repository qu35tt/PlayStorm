import { createBrowserRouter } from "react-router";

import { Login } from "../pages/Login"
import { Home } from "../pages/Home"
import { VideoPlayer } from "../pages/VideoPlayer"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />,
    children: [
      {
        path: "watch/:id",
        element: <VideoPlayer /> 
      },
    ],
  }
]);