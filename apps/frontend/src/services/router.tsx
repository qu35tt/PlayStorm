import { createBrowserRouter } from "react-router";

import { Login } from "../pages/Login"
import { Home } from "../pages/Home"
import { VideoPlayer } from "../pages/VideoPlayer"
import { VideoLists } from "../components/VideoLists"
import { PrivateRoute } from "../lib/PrivateRoute"
import { TestJoinComponent } from "../components/testJoinComponent"

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
        element: <VideoLists />
      },
    ],
  },
  {
    path: "/watch/:id", // or just "/watch"
    element: <VideoPlayer />
  },
  {
    path: "party/:roomId",
    element: <TestJoinComponent />
  }
]);