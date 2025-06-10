import axios from "axios";
import React, { use, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { MdLogout } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import { FaLightbulb } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaPenAlt } from "react-icons/fa";

const Students = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("dashboard");
  const currId = localStorage.getItem("id");
  const currUsername = localStorage.getItem("username");
  const navigate = useNavigate();
  const [addProj, setAddProj] = useState(false);
  const [team, setTeam] = useState({});
  const [projects, setProject] = useState([]);
  const [currProjs, setCurrProjs] = useState([]);
  const [newProject, setNewProject] = useState({
    owner: currUsername,
    title: "",
    desc: "",
    comment: "",
    status: "Pending",
  });
  const menuItems = [
    { label: "home", icon: <FaHome /> },
    { label: "project proposals", icon: <FaLightbulb /> },
    { label: "my team", icon: <RiTeamFill /> },
  ];

  const getProjects = async () => {
    try {
      const res = await axios.get(
        "https://6844185771eb5d1be03260ba.mockapi.io/projects"
      );
      setProject(res.data);
      const currentProjects = res.data.filter(
        (proj) => proj.owner === currUsername
      );
      setCurrProjs(currentProjects);
    } catch (err) {
      console.error(err);
    }
  };

  const editProjects = async (id) => {
    try {
      const projToEdit = projects.find((proj) => proj.id === id);
      const update = await Swal.fire({
        title: "Edit your project idea",
        showCancelButton: true,
        input: "textarea",
        inputAutoFocus: true,
        inputPlaceholder: "Write a comment...",
        confirmButtonText: `Send`,
        confirmButtonColor: "#3730a3",
        inputValue: `${projToEdit.desc}`,
        inputValidator: (value) => {
          if (!value) {
            return "You cannot submit an empty idea";
          }
        },
      });

      if (update.isConfirmed) {
        const updatedIdea = update.value;
        const res = await axios.put(
          `https://6844185771eb5d1be03260ba.mockapi.io/projects/${id}`,
          {
            ...projToEdit,
            desc: updatedIdea,
          }
        );
        setProject((prev) =>
          prev.map((proj) => (proj.id === id ? res.data : proj))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const postProjects = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "https://6844185771eb5d1be03260ba.mockapi.io/projects",
        newProject
      );
      setProject((prev) => [...prev, res.data]);
      setAddProj(false);
      setNewProject((prev) => ({
        ...prev,
        title: "",
        desc: "",
        comment: "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getTeam = async (id) => {
    try {
      const res = await axios.get(
        "https://6844185771eb5d1be03260ba.mockapi.io/teams"
      );
      const currTeam = res.data.find((team) =>
        team.students.some((std) => std.id === id)
      );
      setTeam(currTeam);
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

  // prevent users from accessing the student page without crredentials
  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedIn") === "true";
    const isStd = localStorage.getItem("role") === "student";
    if (loggedIn && isStd) {
      getTeam(currId);
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    getProjects();
  }, [projects]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans">
      {addProj && (
        <div className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex">
          <div className="bg-white p-9 rounded-lg">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-center mb-3">
              Add new project idea
            </h1>
            <form onSubmit={postProjects} className="max-w-sm ">
              <label htmlFor="title">Title</label>
              <input
                className="mb-3 w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white"
                type="text"
                name="title"
                required
                value={newProject.title}
                onChange={handleChange}
                placeholder="Enter the title of your project"
              />
              <label htmlFor="desc">Description</label>
              <textarea
                className="w-full px-8 py-3 rounded-sm font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mb-3"
                type="text"
                name="desc"
                value={newProject.desc}
                onChange={handleChange}
                placeholder="Type the details of your project"
                required
              ></textarea>
              <div className="flex gap-4 px-11">
                <button
                  onClick={() => setAddProj(false)}
                  className="mt-8 tracking-wide font-semibold bg-gray-500 text-white w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none"
                >
                  Cancel
                </button>
                <button className="mt-8 tracking-wide font-semibold bg-tuwaiq-purple text-gray-100 w-full py-3 rounded-sm cursor-pointer transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none">
                  Submit
                </button>
              </div>
            </form>
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
            {menuItems.map((section) => (
              <li key={section.label}>
                <button
                  onClick={() => {
                    setActiveSection(section.label);
                    setOpenSidebar(false);
                  }}
                  className={`flex items-center space-x-3 px-4 py-2 w-full text-left hover:bg-indigo-50 rounded-lg transition-colors ${
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
              className="flex gap-2 items-center space-x-3 px-4 py-2 w-full text-left hover:bg-red-50 rounded-lg transition-colors text-red-700 cursor-pointer"
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

        {activeSection === "home" && <section className="space-y-6"></section>}

        {activeSection === "project proposals" && (
          <section className="space-y-6">
            <header className="flex justify-between p-3">
              <h1 className="text-2xl font-bold text-gray-800">
                Your Projects
              </h1>
              <button
                onClick={() => setAddProj(true)}
                className="cursor-pointer text-white bg-[#0b9883] px-2 p-1 rounded-sm font-semibold"
              >
                Add new project +
              </button>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>

                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Comment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currProjs.map((proj) => (
                    <tr key={proj.id}>
                      <td className="px-4 py-3 whitespace-wrap text-sm text-gray-900">
                        {proj.title}
                      </td>
                      <td className="px-4 py-3 whitespace-wrap text-sm text-gray-900">
                        {proj.desc}
                      </td>
                      <td>
                        <div
                          className={` w-fit p-0.5 px-2 rounded-sm whitespace-wrap text-sm ${
                            proj.status === "Pending"
                              ? "text-yellow-600 bg-yellow-50"
                              : proj.status === "Approved"
                              ? "text-green-600 bg-green-50"
                              : "text-red-700 bg-red-50"
                          }`}
                        >
                          {proj.status}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-wrap text-sm text-gray-900">
                        {proj.comment !== "" ? (
                          proj.comment
                        ) : (
                          <div className="text-gray-500">No comments yet</div>
                        )}
                      </td>
                      {proj.status === "Pending" && (
                        <td className="px-4  whitespace-wrap text-xl text-gray-900">
                          <button
                            onClick={() => editProjects(proj.id)}
                            className=" w-full flex justify-center cursor-pointer text-tuwaiq-purple"
                          >
                            <FaPenAlt />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeSection === "my team" && (
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Team</h1>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 whitespace-wrap text-center text-gray-900">
                      <div
                        className="flex gap-4
                     items-center"
                      >
                        <div className="w-12 h-12 rounded-full font-bold text-sky-800 text-xl bg-sky-100 border-2 flex items-center justify-center">
                          {team.teacher[0]}
                        </div>
                        <div className="font-semibold text-xl">
                          {team.teacher}
                        </div>
                      </div>
                    </td>
                    <td className=" p-4 h-full justify-center flex items-start text-center text-gray-900">
                      <div className="bg-amber-50 w-fit text-yellow-800 p-1 px-2 rounded-sm">
                        Team Leader
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-wrap text-center text-gray-900">
                      {team.email}
                    </td>
                    <td className="px-4 text-3xl text-tuwaiq-purple">
                      <div className=" flex items-center justify-center cursor-pointer">
                        <a href={`mailto:${team.email}`}>
                          <MdEmail />
                        </a>
                      </div>
                    </td>
                  </tr>
                  {team.students.map((std) => (
                    <tr key={std.id}>
                      <td className="px-4 py-3 whitespace-wrap text-center text-gray-900">
                        <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 font-bold rounded-full text-lime-700 text-2xl bg-lime-50 border-2 flex items-center justify-center">
                            {std.username[0]}
                          </div>
                          <div className="font-semibold text-xl">
                            {std.username === currUsername
                              ? "You"
                              : std.username}
                          </div>
                        </div>
                      </td>
                      <td className=" p-4 h-full justify-center flex items-start text-center text-gray-900">
                        <div className="bg-blue-50 w-fit text-blue-800 p-1 px-2 rounded-sm">
                          Team Member
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-wrap text-center text-gray-900">
                        {std.email}
                      </td>
                      <td className="px-4  text-3xl text-tuwaiq-purple">
                        <div className=" flex items-center justify-center cursor-pointer">
                          {std.username !== currUsername && (
                            <a href={`mailto:${std.email}`}>
                              <MdEmail />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Students;
