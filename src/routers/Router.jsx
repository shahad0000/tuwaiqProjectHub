import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router";
import SignUp from "../pages/SignUp";
import Login from "../pages/Login";
import Admin from "../pages/Admin";
import Students from "../pages/Students";
import Teachers from "../pages/Teachers";
import Layout from "../components/Layout";
import { Navigate } from "react-router";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/login" /> }, 
      { path: "/login", element: <Login /> },
      { path: "/signUp", element: <SignUp /> },
      { path: "/admins", element: <Admin /> },
      { path: "/students", element: <Students /> },
      { path: "/teachers", element: <Teachers /> },
    ],
  },
]);

const Router = () => {
  return <RouterProvider router={router} />;
};

export default Router;
