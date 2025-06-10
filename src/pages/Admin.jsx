import axios from "axios";
import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { FaFilter } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

const Admin = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [teams, setTeams] = useState([]);
  const [showUserForm, setShowUserFrom] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ show: false, id: "" });
  const [freeUsers, setFreeUsers] = useState([]);
  const [newMember, setNewMember] = useState({
    id: "",
    username: "",
    email: "",
  });
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

  const editTeams = async (id) => {
    const team = teams.find((t) => t.id === id);
    if (!team) return;

    const updatedTeam = {
      ...team,
      students: [...team.students, newMember],
    };
    try {
      const res = await axios.put(
        `https://6844185771eb5d1be03260ba.mockapi.io/teams/${id}`,
        updatedTeam
      );
      setTeams((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      setFreeUsers(freeUsers.filter((user) => user.id !== newMember.id));
      setNewMember({ id: "", username: "", email: "" });
      setAddMemberForm({ show: false, id: "" });
    } catch (err) {
      console.error(err);
    }
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
    setUsers((prev) => [...prev, creds]);
    setFreeUsers((prev) => [...prev, creds]);
    setShowUserFrom(false);
    setCreds({
      email: "",
      username: "",
      role: "",
      password: "",
    });
    Swal.fire({
      icon: "success",
      title: "User has been added successfully!",
      confirmButtonColor: "#4f29b7",
    });
  };

  const getUsers = async () => {
    try {
      const usersRes = await axios.get(
        "https://6844185771eb5d1be03260ba.mockapi.io/users"
      );
      setUsers(usersRes.data);
      const teamsRes = await axios.get(
        "https://6844185771eb5d1be03260ba.mockapi.io/teams"
      );
      setTeams(teamsRes.data);
      const assignedStudents = new Set(
        teamsRes.data.flatMap((team) => team.students).map((std) => std.id)
      );
      const free = usersRes.data.filter(
        (user) => !assignedStudents.has(user.id) && user.role === "student"
      );
      setFreeUsers(free);
    } catch (err) {
      console.log(err);
    }
  };

  const delUser = async (id) => {
    const confirmDelete = await Swal.fire({
      icon: "question",
      title: "Are you sure you want to delete this user?",
      showCancelButton: true,
      confirmButtonColor: "#e0696d",
      confirmButtonText: "Delete",
    });
    if (confirmDelete.isConfirmed) {
      try {
        const res = await axios.delete(
          `https://6844185771eb5d1be03260ba.mockapi.io/users/${id}`
        );
        setUsers(users.filter((user) => user.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const remMember = async (teamId, stdId) => {
    const confirmDelete = await Swal.fire({
      icon: "question",
      title: "Are you sure you want to remove this member?",
      showCancelButton: true,
      confirmButtonColor: "#e0696d",
      confirmButtonText: "Remove",
    });
    if (confirmDelete.isConfirmed) {
      const team = teams.find((t) => t.id === teamId);
      if (!team) return;

      const updatedTeam = {
        ...team,
        students: team.students.filter((std) => std.id !== stdId),
      };
      try {
        const res = await axios.put(
          `https://6844185771eb5d1be03260ba.mockapi.io/teams/${teamId}`,
          updatedTeam
        );
        setTeams((prev) => prev.map((t) => (t.id === teamId ? res.data : t)));
        const removedUser = users.find((user) => user.id === stdId);
        if (removedUser) {
          setFreeUsers((prev) => [...prev, removedUser]);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleLogout = async () => {
    const confirmlogout = await Swal.fire({
      icon: "question",
      title: "Are you sure you want to log out?",
      showCancelButton: true,
      confirmButtonColor: "#e0696d",
      confirmButtonText: "Log out",
    });
    if (confirmlogout.isConfirmed) {
      localStorage.clear();
      navigate("/login");
    }
  };

  // prevent users from accessing the admin page without crredentials
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const isAdmin = localStorage.getItem("role") === "admin";
    if (loggedIn && isAdmin) {
      getUsers();
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (addMemberForm.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [addMemberForm.show]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-sans">
      {showUserForm && (
        <div className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
          <div className="bg-white p-14">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-center mb-3">
              Create a new user
            </h1>
            <form onSubmit={handleSubmit} className="max-w-sm ">
              <label htmlFor="email">Email Address</label>
              <input
                className="mb-3 w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                type="email"
                name="email"
                required
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
              <div className="flex gap-4">
                <button
                  onClick={() => setShowUserFrom(false)}
                  className="mt-8 tracking-wide font-semibold bg-gray-500 text-white w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  Cancel
                </button>
                <button className="mt-8 tracking-wide font-semibold bg-tuwaiq-purple text-gray-100 w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addMemberForm.show && (
        <div className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
          <div className="bg-white p-12 flex flex-col gap-7 w-[90%] lg:w-[50%]">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-center mb-3">
              Add new members
            </h1>
            <div>
              {freeUsers.length > 0 ? (
                <div className="max-h-60 overflow-scroll">
                  {freeUsers.map((user) => (
                    <div key={user.id}>
                      <button
                        className="focus:outline-1 hover:bg-indigo-50 focus:bg-indigo-50 w-full h-full outline-gray-300 rounded-md cursor-pointer"
                        onClick={() =>
                          setNewMember({
                            id: user.id,
                            username: user.username,
                            email: user.email,
                          })
                        }
                      >
                        <div className="flex gap-5 border-1 p-2 border-gray-300">
                          <div className="w-10 h-10 rounded-full bg-cyan-600 text-2xl text-white flex items-center justify-center">
                            {user.username[0]}
                          </div>
                          <div className="flex flex-col w-50 text-start">
                            <div className="text-xl font-semibold">
                              {user.username}
                            </div>
                            <div className="text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-700 text-center">
                  All students have already been assigned to teams.
                </div>
              )}

              <div className="flex gap-4 md:px-22 lg:px-33">
                <button
                  onClick={() => setAddMemberForm({ show: false, id: "" })}
                  className="mt-8 tracking-wide font-semibold bg-gray-500 text-white w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (newMember.id) {
                      editTeams(addMemberForm.id);
                    } else {
                      Swal.fire({
                        icon: "info",
                        title: "You need to select a user",
                      });
                    }
                  }}
                  className="mt-8 tracking-wide font-semibold bg-tuwaiq-purple text-gray-100 w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`bg-white shadow-lg fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out ${
          openSidebar ? "w-64" : "hidden md:block md:w-64"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
            <h1
              className={`text-xl font-bold text-gray-800 transition-opacity duration-300 ${
                openSidebar ? "opacity-100" : "hidden md:block"
              }`}
            >
              Tuwaiq ProjectHub
            </h1>
            <img className="w-10 h-10" src="/imgs/tuwaiqLogo.png" alt="" />
          </div>
          <button
            onClick={() => setOpenSidebar(!openSidebar)}
            className="md:hidden p-2 rounded-full hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>
        <nav className="py-4">
          <ul className="space-y-2">
            {["dashboard", "projects", "teams", "users"].map((section) => (
              <li key={section}>
                <button
                  onClick={() => {
                    setActiveSection(section);
                    setOpenSidebar(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-gray-100 rounded-lg transition-colors ${
                    activeSection === section ? "bg-gray-100" : ""
                  }`}
                >
                  <span className="text-gray-700 capitalize">{section}</span>
                </button>
              </li>
            ))}
            <button
              onClick={handleLogout}
              className="flex gap-2 items-center space-x-3 px-4 py-2 w-full text-left hover:bg-gray-100 rounded-lg transition-colors text-red-700 cursor-pointer"
            >
              <div className="text-2xl">
                <MdLogout />
              </div>
              Log out
            </button>
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Tuwaiq ProjectHub</h1>
          <button
            onClick={() => setOpenSidebar(!openSidebar)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          </button>
        </div>

        {activeSection === "dashboard" && (
          <section className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome Back, Project Manager!
              </h1>
              <p className="text-gray-600">
                Here's your current project overview.
              </p>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">
                  Total Projects
                </h2>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">
                  Active Tasks
                </h2>
                <p className="text-2xl font-bold text-yellow-600">24</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-gray-700">
                  Completed Tasks
                </h2>
                <p className="text-2xl font-bold text-blue-600">102</p>
              </div>
            </div>
          </section>
        )}

        {activeSection === "projects" && (
          <section className="space-y-6">
            <header>
              <h1 className="text-2xl font-bold text-gray-800">
                Your Projects
              </h1>
              <p className="text-gray-600">
                Track your ongoing projects and milestones.
              </p>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deadline
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Website Redesign
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      2025-07-15
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">
                      In Progress
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      Marketing Campaign
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      2025-06-30
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-yellow-600">
                      Pending
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "users" && (
          <div>
            <header className="flex justify-between p-5 items-center">
              <h1 className="text-2xl font-bold text-gray-800">Users</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white  border border-gray-200 rounded-md focus-within:outline-1  px-3">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search users...."
                    className="bg-white py-1 focus:outline-0"
                  />
                  <div className="text-tuwaiq-purple">
                    <FaFilter />
                  </div>
                </div>

                <button
                  onClick={() => setShowUserFrom(true)}
                  className="cursor-pointer text-white bg-[#0b9883] px-2 p-1 rounded-sm font-semibold"
                >
                  Add new users +
                </button>
              </div>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users
                    .filter((user) =>
                      user.username
                        .toLowerCase()
                        .includes(searchUser.toLowerCase())
                    )
                    .map((user) => (
                      <tr key={user.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {user.username}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {user.role}
                        </td>
                        <td className="text-red-700 px-4 py-3 whitespace-nowrap w-20 ">
                          <button
                            onClick={() => delUser(user.id)}
                            className="cursor-pointer"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeSection === "teams" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {teams.map((team) => (
                <div key={team.id} className="lw-full p-11">
                  <div className="relative mt-10">
                    <div className="rounded overflow-hidden shadow-md bg-white ">
                      <div className="absolute -mt-20 w-full flex justify-center">
                        <div className="h-32 w-32 rounded-full flex items-center justify-center text-6xl bg-indigo-300">
                          {team.teacher.split(" ")[1]?.[0]}
                        </div>
                      </div>
                      <div className="px-6 mt-16">
                        <h1 className="font-bold text-3xl text-center mb-1">
                          {team.teacher}
                        </h1>
                        <p className="text-gray-800 text-md text-center">
                          {team.email}
                        </p>
                        <div>
                          <h1>Members</h1>
                          <div>
                            {team.students.map((std) => (
                              <div key={std.id}>
                                <div className="flex justify-between border-1 p-2 border-gray-300">
                                  <div className="w-10 h-10 rounded-full bg-cyan-600 text-2xl text-white flex items-center justify-center">
                                    {std.username[0]}
                                  </div>
                                  <div className="flex flex-col w-70">
                                    <div>{std.username}</div>
                                    <div className="text-gray-500">
                                      {std.email}
                                    </div>
                                  </div>

                                  <button
                                    onClick={() => remMember(team.id, std.id)}
                                    className="text-red-500 cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-center p-2">
                            <button
                              className="cursor-pointer text-[#08816f] text-xl font-semibold"
                              onClick={() =>
                                setAddMemberForm({ show: true, id: team.id })
                              }
                            >
                              Add Students +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
