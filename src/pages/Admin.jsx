import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { MdLogout } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import { FaLightbulb } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { MdOutlineAddComment } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaCheckCircle } from "react-icons/fa";
import { FaFilter } from "react-icons/fa";
import { FaUsersGear } from "react-icons/fa6";
import { PiProjectorScreenChartDuotone } from "react-icons/pi";
import { PiSealCheckDuotone } from "react-icons/pi";
import { PiClockCountdownDuotone } from "react-icons/pi";
import { PiSmileySadDuotone } from "react-icons/pi";
import { CiCircleRemove } from "react-icons/ci";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

const Admin = () => {
  const currUsername = localStorage.getItem("username");
  const [openSidebar, setOpenSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [teams, setTeams] = useState([]);
  const [showUserForm, setShowUserFrom] = useState(false);
  const [addMemberForm, setAddMemberForm] = useState({ show: false, id: "" });
  const [freeUsers, setFreeUsers] = useState([]);
  const [projects, setProject] = useState([]);
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

  const [pending, setPending] = useState([]);
  const [determined, setDetermined] = useState([]);
  const [approved, setApproved] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [teamsProjectsData, SetTeamsProjectsData] = useState([]);

  const menuItems = [
    { label: "dashboard", icon: <MdDashboard /> },
    { label: "project proposals", icon: <FaLightbulb /> },
    { label: "teams", icon: <RiTeamFill /> },
    { label: "users", icon: <FaUsersGear /> },
  ];
  const projectStatusData = [
    { name: "Approved", value: approved.length, color: "#2db57c" },
    { name: "Rejected", value: rejected.length, color: "#dd253b" },
    { name: "Pending", value: pending.length, color: "#f2cb6d" },
  ];

  const getTeamData = () => {
    const formattedData = teams.map((team) => {
      const data = { approved: 0, rejected: 0, pending: 0 };

      team.students.forEach((std) => {
        const stdProjects = projects.filter(
          (proj) => proj.owner === std.username
        );

        stdProjects.forEach((proj) => {
          const status = proj.status?.toLowerCase();
          if (status && data[status] !== undefined) {
            data[status]++;
          }
        });
      });

      return {
        team: team.teacher,
        approved: data.approved,
        rejected: data.rejected,
        pending: data.pending,
      };
    });

    SetTeamsProjectsData(formattedData);
  };

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreds((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const editTeams = async (id) => {
    console.log(teams);
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
    const postUser = await axios.post(
      "https://6844185771eb5d1be03260ba.mockapi.io/users",
      creds
    );
    if (creds.role === "teacher") {
      const postTeam = await axios.post(
        "https://6844185771eb5d1be03260ba.mockapi.io/teams",
        {
          email: creds.email,
          teacher: creds.username,
          students: [],
        }
      );
      setTeams((prev) => [...prev, postTeam.data]);
    }
    setUsers((prev) => [...prev, creds]);
    getUsers();
    if (creds.role !== "teacher") setFreeUsers((prev) => [...prev, creds]);
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
        const userToDelete = users.find((user) => user.id === id);
        const res = await axios.delete(
          `https://6844185771eb5d1be03260ba.mockapi.io/users/${id}`
        );
        setUsers(users.filter((user) => user.id !== id));
        if (userToDelete.role === "teacher") {
          const teamToDelete = teams.find(
            (team) => team.teacher === userToDelete.username
          );
          if (teamToDelete) {
            await delTeam(teamToDelete.id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  const delTeam = async (id) => {
    try {
      const res = await axios.delete(
        `https://6844185771eb5d1be03260ba.mockapi.io/teams/${id}`
      );
      setTeams(teams.filter((team) => team.id !== id));
    } catch (err) {
      console.error(err);
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

  const getProjects = async () => {
    try {
      const res = await axios.get(
        "https://6844185771eb5d1be03260ba.mockapi.io/projects"
      );

      // Reset to avoid duplicated
      setPending([]);
      setApproved([]);
      setDetermined([]);
      setRejected([]);
      res.data.forEach((proj) => {
        if (proj.status === "Pending") setPending((prev) => [...prev, proj]);
        if (proj.status === "Approved") setApproved((prev) => [...prev, proj]);
        if (proj.status === "Rejected") setRejected((prev) => [...prev, proj]);
        if (proj.status === "Approved" || proj.status === "Rejected")
          setDetermined((prev) => [...prev, proj]);
      });

      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const msg =
        status === "Approved"
          ? "Are you sure you want to approve this project?"
          : status === "Rejected"
          ? "Are you sure you want to reject this project"
          : "Add a comment";
      const send = await Swal.fire({
        title: `${msg}`,
        showCancelButton: true,
        input: "textarea",
        inputAutoFocus: true,
        inputPlaceholder: "Write a comment...",
        confirmButtonText: `Send`,
        confirmButtonColor: "#3730a3",
        inputValidator: (cmnt) => {
          if (!cmnt && (status === "Rejected" || status === "Pending")) {
            return "You must write a comment";
          }
        },
      });
      if (send.isConfirmed) {
        const comment = send.value || "";
        const res = await axios.put(
          `https://6844185771eb5d1be03260ba.mockapi.io/projects/${id}`,
          {
            status: status,
            comment: comment,
          }
        );
        getProjects();
      }
    } catch (err) {
      console.error(err);
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
      getProjects();
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (teams.length > 0 && projects.length > 0) {
      getTeamData();
    }
  }, [teams, projects]);

  useEffect(() => {
    if (addMemberForm.show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [addMemberForm.show]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-sans">
      {showUserForm && (
        <div className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
          <div className="bg-white rounded-2xl p-14">
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
                <button className="mt-8 tracking-wide font-semibold bg-indigo-800 text-gray-100 w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addMemberForm.show && (
        <div className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
          <div className="bg-white rounded-2xl p-12 flex flex-col gap-7 w-[90%] lg:w-[40%]">
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
                          <div className="w-10 h-10 rounded-full bg-lime-50 text-2xl text-lime-800 border-2 flex items-center justify-center">
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
                  className="mt-8 tracking-wide font-semibold bg-gray-500 text-white w-full py-2"
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
                  className="mt-8 tracking-wide font-semibold bg-indigo-800 text-white w-full py-2 rounded-md cursor-pointer"
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
        className={`bg-white fixed md:static inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out ${
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
            <RxHamburgerMenu />
          </button>
        </div>
        <nav className="py-4">
          <ul className="space-y-1">
            {menuItems.map((section) => (
              <li key={section.label}>
                <button
                  onClick={() => {
                    setActiveSection(section.label);
                    setOpenSidebar(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-indigo-50 transition-colors ${
                    activeSection === section.label ? "bg-indigo-50" : ""
                  }`}
                >
                  {section.icon && (
                    <span className="text-2xl text-tuwaiq-purple">
                      {section.icon}
                    </span>
                  )}
                  <span className="text-gray-700 capitalize">
                    {section.label}
                  </span>
                </button>
              </li>
            ))}
            <button
              onClick={handleLogout}
              className="flex gap-2 items-center space-x-3 px-4 py-2 w-full text-left hover:bg-red-50 transition-colors text-red-700 cursor-pointer"
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
      <main className="flex-1 bg-slate-50  p-4 md:p-6 overflow-y-auto">
        <div className="md:hidden flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800">Tuwaiq ProjectHub</h1>
          <button
            onClick={() => setOpenSidebar(!openSidebar)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <RxHamburgerMenu />
          </button>
        </div>

        {activeSection === "dashboard" && (
          <div>
            <section className="space-y-6">
              <header className="relative z-10 px-6 mb-6">
                <h1 className="text-3xl font-bold  text-neutral-600 mb-3">
                  Welcome Back, {currUsername}
                </h1>
                <div className="w-80 h-1 bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-full"></div>
              </header>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-700">
                      Total Project Ideas
                    </h2>
                    <p className="text-4xl font-bold text-blue-600">
                      {projects.length}
                    </p>
                  </div>
                  <div className="text-7xl text-indigo-900">
                    <PiProjectorScreenChartDuotone />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-700">
                      Approved Ideas
                    </h2>
                    <p className="text-4xl font-bold text-green-600">
                      {approved.length}
                    </p>
                  </div>
                  <div className="text-7xl text-indigo-900">
                    <PiSealCheckDuotone />
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md flex justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-700">
                      Pending Project Ideas
                    </h2>
                    <p className="text-4xl font-bold text-yellow-700">
                      {pending.length}
                    </p>
                  </div>
                  <div className="text-7xl text-indigo-900">
                    <PiClockCountdownDuotone />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-2xl font-semibold text-slate-900 mb-4">
                  Project Status Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Teams Project Submissions
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamsProjectsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="team" />
                    <YAxis />
                    <Tooltip />
                    <Legend />

                    <Bar dataKey="approved" fill="#2db57c" name="Approved" />
                    <Bar dataKey="rejected" fill="#dd253b" name="Rejected" />
                    <Bar dataKey="pending" fill="#f2cb6d" name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
            <div className="m-4">
              <h1 className="text-2xl font-bold text-gray-800 flex gap-3 items-center m-4">
                Approved Project Ideas
                <div className="text-green-700">
                  <FaCheckCircle />
                </div>
              </h1>
              <div className="bg-white p-3 rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-indigo-50">
                    <tr className="text-indigo-900 uppercase text-left">
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Title</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  {approved.length > 0 ? (
                    <tbody className="divide-y divide-gray-200">
                      {approved.map((proj) => (
                        <tr className="text-gray-900" key={proj.id}>
                          <td className="px-4 py-3 whitespace-wrap ">
                            {proj.owner}
                          </td>
                          <td className="px-4 py-3 whitespace-wrap">
                            {proj.title}
                          </td>
                          <td className="px-4 py-3 whitespace-wrap">
                            {proj.desc}
                          </td>
                          <td>
                            <div className="text-green-700 bg-green-100 w-fit p-0.5 px-2 rounded-sm whitespace-wrap">
                              {proj.status}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody>
                      <tr>
                        <td colSpan="5">
                          <div className="text-center py-6 text-gray-500 text-lg">
                            There are no approved ideas yet.
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        )}

        {activeSection === "project proposals" && (
          <div id="pendingProjects">
            <header className="flex justify-between p-3">
              <h1 className="text-2xl font-bold text-gray-800">Pending</h1>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr className="text-indigo-900 uppercase text-left">
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Comment</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                {pending.length > 0 ? (
                  <tbody className="divide-y divide-gray-200">
                    {pending.map((proj) => (
                      <tr key={proj.id}>
                        <td className="px-4 py-3 whitespace-wrap text-gray-900">
                          {proj.owner}
                        </td>
                        <td className="px-4 py-3 whitespace-wrap text-gray-900">
                          {proj.title}
                        </td>
                        <td className="px-4 py-3 whitespace-wrap text-gray-900">
                          {proj.desc}
                        </td>
                        <td className="px-4 py-3 whitespace-wrap text-gray-900">
                          {proj.comment !== "" ? (
                            proj.comment
                          ) : (
                            <div className="text-gray-500">No comments yet</div>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-3 text-white py-3">
                            <button
                              onClick={() => updateStatus(proj.id, "Pending")}
                              className=" text-3xl cursor-pointer text-indigo-800 h-fit"
                            >
                              <MdOutlineAddComment />
                            </button>
                            <button
                              onClick={() => updateStatus(proj.id, "Rejected")}
                              className="bg-rose-700  h-7 rounded-sm px-2 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => updateStatus(proj.id, "Approved")}
                              className="bg-[#34ab7f]  h-7 rounded-sm px-2 cursor-pointer"
                            >
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="5">
                        <div className="text-center py-6 text-gray-500 text-lg">
                          You don't have any pending projects
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
            <header className="flex justify-between p-3">
              <h1 className="text-2xl font-bold text-gray-800">Determined</h1>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr className="text-indigo-900 uppercase text-left">
                    <th className="px-4 py-3">Owner</th>
                    <th className="px-4 py-3">Title</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Comment</th>
                  </tr>
                </thead>
                {determined.length > 0 ? (
                  <tbody className="divide-y divide-gray-200">
                    {determined.map((proj) => (
                      <tr key={proj.id}>
                        <td className="px-4 py-3 whitespace-wrap  text-gray-900">
                          {proj.owner}
                        </td>
                        <td className="px-4 py-3 whitespace-wrap  text-gray-900">
                          {proj.title}
                        </td>
                        <td className="px-4 py-3 whitespace-wrap  text-gray-900">
                          {proj.desc}
                        </td>
                        <td>
                          <div
                            className={` w-fit p-0.5 px-2.5 rounded-md whitespace-wrap  ${
                              proj.status === "Approved"
                                ? "text-green-700 bg-green-100"
                                : "text-red-800 bg-red-100"
                            } `}
                          >
                            {proj.status}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-wrap  text-gray-900">
                          {proj.comment !== "" ? (
                            proj.comment
                          ) : (
                            <div className="text-gray-500">
                              No comments provided
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="5">
                        <div className="text-center py-6 text-gray-500 text-lg">
                          You don't have any determined projects
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}

        {activeSection === "users" && (
          <div>
            <header className="flex justify-between p-5 items-center">
              <h1 className="text-4xl m-4 font-bold text-gray-800">
                All Users
                <span className="text-gray-600">({users.length})</span>
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-stone-400 rounded-md focus-within:outline-1 focus-within:outline-indigo-700 px-3">
                  <input
                    type="text"
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    placeholder="Search users by name or role"
                    className="bg-white py-2 w-60 focus:outline-0"
                  />
                  <div className="text-tuwaiq-purple">
                    <FaFilter />
                  </div>
                </div>

                <button
                  onClick={() => setShowUserFrom(true)}
                  className="cursor-pointer text-white bg-indigo-900 px-2 p-1 rounded-sm font-semibold"
                >
                  Add new users +
                </button>
              </div>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr className="text-indigo-900 uppercase text-center">
                    <th className="px-4 py-3">Username</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                {users.filter(
                  (user) =>
                    user.username
                      .toLowerCase()
                      .includes(searchUser.toLowerCase()) ||
                    user.role.toLowerCase().includes(searchUser.toLowerCase())
                ).length > 0 ? (
                  <tbody className="divide-y divide-gray-200">
                    {users
                      .filter(
                        (user) =>
                          user.username
                            .toLowerCase()
                            .includes(searchUser.toLowerCase()) ||
                          user.role
                            .toLowerCase()
                            .includes(searchUser.toLowerCase())
                      )
                      .map((user) => (
                        <tr key={user.id}>
                          <td className="px-4 py-3 whitespace-wrap text-gray-900">
                            <div className="flex gap-4 items-center">
                              <div
                                className={`w-12 h-12 font-bold rounded-full text-2xl border-2 flex items-center justify-center ${
                                  user.role === "admin"
                                    ? "text-indigo-800 bg-indigo-100"
                                    : user.role === "teacher"
                                    ? "text-sky-700 bg-sky-50"
                                    : "text-lime-700 bg-lime-50"
                                }`}
                              >
                                {user.username[0]}
                              </div>
                              <div className="font-semibold text-xl flex gap-2">
                                {user.username}{" "}
                                {user.role === "admin" && (
                                  <div className="text-gray-500">(You)</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-wrap text-center text-gray-900">
                            {user.email}
                          </td>
                          <td>
                            <div
                              className={`px-2 py-1 m-auto w-fit whitespace-wrap ${
                                user.role === "admin"
                                  ? "text-indigo-800 bg-indigo-100"
                                  : user.role === "teacher"
                                  ? "text-sky-800 bg-sky-50"
                                  : "text-lime-800 bg-lime-50"
                              }`}
                            >
                              {user.role}
                            </div>
                          </td>
                          <td>
                            <div className="flex gap-3 justify-around m-auto">
                              <div className=" flex items-center text-2xl text-tuwaiq-purple justify-center cursor-pointer">
                                {user.username !== currUsername && (
                                  <a href={`mailto:${user.email}`}>
                                    <MdEmail />
                                  </a>
                                )}
                              </div>
                              {user.role !== "admin" && (
                                <button
                                  onClick={() => delUser(user.id)}
                                  className="cursor-pointer text-red-800"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                ) : (
                  <tbody>
                    <tr>
                      <td colSpan="5">
                        <div className="text-center py-6 text-gray-500 flex flex-col justify-center items-center gap-3">
                          <div className="text-6xl text-indigo-900">
                            <PiSmileySadDuotone />
                          </div>
                          <div>Oops! No results found.</div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                )}
              </table>
            </div>
          </div>
        )}

        {activeSection === "teams" && (
          <div>
            <h1 className="text-4xl m-4 font-bold text-gray-800">Teams</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {teams.map((team) => (
                <div key={team.id} className="lw-full p-11">
                  <div className="relative mt-10">
                    <div className="rounded overflow-hidden shadow-md bg-white ">
                      <div className="absolute -mt-15 w-full flex justify-center">
                        <div className="h-27 w-34 rounded-xl flex items-center justify-center text-5xl font-bold text-sky-800 border-3 bg-sky-100">
                          {team?.teacher
                            .split(" ")
                            .map((word) => word[0])
                            .join(" ")
                            .toUpperCase()}
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
                          <h1 className="text-2xl font-bold text-gray-700 m-3">
                            Members
                          </h1>
                          {team.students.length > 0 ? (
                            <div>
                              {team.students.map((std) => (
                                <div key={std.id}>
                                  <div className="flex justify-between border-1 p-2 border-gray-300">
                                    <div className="w-12 h-12 rounded-full text-lime-700 text-2xl bg-lime-50 border-2 font-bold flex items-center justify-center">
                                      {std.username[0]}
                                    </div>
                                    <div className="flex flex-col w-70">
                                      <div className="font-bold text-xl">
                                        {std.username}
                                      </div>
                                      <div className="text-gray-500">
                                        {std.email}
                                      </div>
                                    </div>

                                    <button
                                      onClick={() => remMember(team.id, std.id)}
                                      className="text-red-700 cursor-pointer"
                                    >
                                      <div className="text-3xl "><CiCircleRemove />
                                      </div>
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-2xl text-gray-500 text-center my-4">
                              There are no members in this team yet
                            </div>
                          )}

                          <div className="flex justify-between p-2 my-5">
                            <div className="text-2xl">
                              {team.students.length} Members
                            </div>
                            <button
                              className="cursor-pointer bg-indigo-900 text-xl font-semibold text-white p-1 px-3 rounded-md"
                              onClick={() =>
                                setAddMemberForm({ show: true, id: team.id })
                              }
                            >
                              Add Members +
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
