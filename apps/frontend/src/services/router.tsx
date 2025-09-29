import { createBrowserRouter } from "react-router";

import { Login } from "../pages/Login"
import { Home } from "../pages/Home"
import { VideoPlayer } from "../pages/VideoPlayer"
import { VideoLists } from "../components/VideoLists"

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
        index: true,
        element: <VideoLists />
      },
    ],
  },
  {
    path: "/watch/:id", // or just "/watch"
    element: <VideoPlayer />
  }
]);