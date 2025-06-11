import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const Login = () => {
  const [creds, setCreds] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreds((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.get(
      "https://6844185771eb5d1be03260ba.mockapi.io/users"
    );
    const userExist = res.data.find(
      (user) => user.email === creds.email && user.password === creds.password
    );
    if (userExist) {
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("id", userExist.id);
      localStorage.setItem("username", userExist.username);
      localStorage.setItem("email", userExist.email);
      localStorage.setItem("role", userExist.role);
      navigate(`/${userExist.role}s`);
    } else {
      return Swal.fire({
        icon: "error",
        title: "Email or password is incorrect",
        confirmButtonColor: "#4f29b7",
      });
    }
  };

  return (
    <div>
      <div>
        <div className="min-h-screen bg-gray-50 text-gray-900 flex justify-center items-center">
          <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
            <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
              <div className="mt-12 flex flex-col items-center">
                <h1 className="text-2xl xl:text-3xl font-extrabold">
                  Sign in to your account
                </h1>
                <div className="w-full flex-1 mt-8">
                  <form onSubmit={handleSubmit} className="mx-auto max-w-xs">
                    <label htmlFor="email">Email Address</label>
                    <input
                      className="mb-3 w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                      type="email"
                      name="email"
                      value={creds.email}
                      onChange={handleChange}
                      autoComplete="email"
                      placeholder="e.g. name@tuwaiq.com"
                    />

                    <label htmlFor="password">Password</label>
                    <input
                      className="w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                      type="password"
                      name="password"
                      value={creds.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="•••••••••"
                    />
                    <button className="mt-8 tracking-wide font-semibold bg-indigo-800 text-gray-100 w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                      <svg
                        className="w-6 h-6 -ml-2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <path d="M20 8v6M23 11h-6" />
                      </svg>
                      <span className="ml-3">Sign in</span>
                    </button>
                  </form>
                  <p className="mt-6 text-gray-600 text-center text-lg">
                    Don't have an account?
                    <Link
                      to="/signUp"
                      className="m-1 text-tuwaiq-purple border-b border-gray-500 border-dotted"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-[#f8f8fc] text-center hidden lg:flex justify-center items-center">
              <div className="flex flex-col items-center justify-center">
                <div className="text-gray-700 font-bold text-5xl text-center flex gap-2 items-center justify-center mb-3">
                  <div>Tuwaiq ProjectHub</div>
                  <div>
                    <img
                      className="w-19 h-19 object-cover"
                      src="/imgs/tuwaiqLogo.png"
                      alt=""
                    />
                  </div>
                </div>
                <div className="w-full h-full">
                    <img className="object-cover" src="/imgs/programmer.png" alt="" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
