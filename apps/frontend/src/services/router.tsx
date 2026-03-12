import { createBrowserRouter } from "react-router";

import { Login } from "@/pages/login"
import { Home } from "@/pages/home"
import { VideoPlayer } from "@/pages/video-player"
import { VideoLists } from "@/components/video-lists"
import { PrivateRoute } from "@/lib/private-route"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: (
      <PrivateRoute>
          <Home />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: (
        <>
          <VideoLists />
        </>
      )},
    ],
  },
  {
    path: "/watch/:id",
    element: (
      <PrivateRoute>
        <VideoPlayer />
      </PrivateRoute>
    )
  },
]);