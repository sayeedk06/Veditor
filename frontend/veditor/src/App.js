import "./App.css";
import Home from "./pages/Home";
import Root from "./components/Root";
import Profile from "./pages/Profile";
import Gallery from "./pages/Gallery";
import Premium from "./pages/Premium";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/gallery",
    element: <Gallery />,
  },
  {
    path: "/premium",
    element: <Premium />,
  },
]);

function App() {
  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
