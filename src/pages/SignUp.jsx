import axios from "axios";
import React, { useState } from "react";
import { Link } from "react-router";
import Swal from "sweetalert2";
import { useNavigate } from "react-router";

const SignUp = () => {
  const [creds, setCreds] = useState({
    email: "",
    username: "",
    role: "",
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
    const getRes = await axios.get(
      "https://6844185771eb5d1be03260ba.mockapi.io/users"
    );
    const userExist = getRes.data.find((user) => user.email === creds.email);
    if (userExist) {
      return Swal.fire({
        icon: "error",
        title: "This email is already registered",
        confirmButtonColor: "#4f29b7",
      });
    } else if (!creds.email.includes("@tuwaiq.com")) {
      return Swal.fire({
        icon: "error",
        title: "Email must contain '@tuwaiq.com'",
        confirmButtonColor: "#4f29b7",
      });
    }
    const postRes = await axios.post(
      "https://6844185771eb5d1be03260ba.mockapi.io/users",
      creds
    );
    if (creds.role === "teacher") {
      const postRes = await axios.post(
        "https://6844185771eb5d1be03260ba.mockapi.io/teams",
        {
          tId: creds.id,
          email: creds.email,
          teacher: creds.username,
          students: [],
        }
      );
    }
    navigate("/login");
  };

  return (
    <div className="bg-indigo-50/70 min-h-[80vh]">
      <div>
        <div className=" py-33 lg:py-11  text-gray-900 flex flex-col justify-center items-center">
          <div className="text-gray-700 font-bold text-5xl text-center flex gap-2 items-center justify-center mb-3">
            <div>Tuwaiq ProjectHub</div>
            <div>
              <img
                className="w-19 h-19 object-cover"
                src="/imgs/tuwaiqLogo.png"
                alt="tuwaiq logo"
              />
            </div>
          </div>
          <div className="w-10/12 m-0 sm:m-11 bg-white sm:rounded-lg flex item justify-center flex-1">
            <div className="w-full lg:w-1/2 xl:w-5/12 p-6 sm:p-12 shadow-md">
              <div className="mt-12 flex flex-col items-center">
                <h1 className="text-2xl xl:text-3xl font-extrabold">
                  Create an account
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
                    <label htmlFor="username">Username</label>
                    <input
                      className="w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3"
                      type="text"
                      name="username"
                      value={creds.username}
                      onChange={handleChange}
                      autoComplete="username"
                      placeholder="Enter a username"
                      required
                    />
                    <label htmlFor="role">Role</label>
                    <select
                      className="w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3"
                      name="role"
                      value={creds.role}
                      onChange={handleChange}
                      placeholder="Enter a username"
                      required
                    >
                      <option value="" disabled hidden>
                        Select role...
                      </option>
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                    </select>

                    <label htmlFor="password">Password</label>
                    <input
                      className="w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                      type="password"
                      name="password"
                      value={creds.password}
                      onChange={handleChange}
                      autoComplete="current-password"
                      placeholder="•••••••••"
                      required
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
                      <span className="ml-3">Sign Up</span>
                    </button>
                  </form>
                  <p className="mt-6 text-gray-600 text-center text-lg">
                    Already have an account?
                    <Link
                      to="/login"
                      className="m-1 text-tuwaiq-purple border-b border-gray-500 border-dotted"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-indigo-50/70 text-center hidden lg:flex justify-center items-center">
              <div className="flex flex-col items-center justify-center">
                <div className="w-full h-full">
                  <img
                    className="object-cover"
                    src="/imgs/programmer.png"
                    alt=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
