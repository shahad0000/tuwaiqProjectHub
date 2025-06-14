import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { MdLogout } from "react-icons/md";
import { RiTeamFill } from "react-icons/ri";
import { FaLightbulb } from "react-icons/fa";
import { FaHome } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { MdOutlineAddComment } from "react-icons/md";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaCheckCircle } from "react-icons/fa";

const Teachers = () => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const currId = localStorage.getItem("id");
  const currUsername = localStorage.getItem("username");
  const currEmail = localStorage.getItem("email");
  const navigate = useNavigate();
  const [team, setTeam] = useState({});
  const [projects, setProject] = useState([]);
  const [pending, setPending] = useState([]);
  const [determined, setDetermined] = useState([]);
  const [approved, setApproved] = useState([]);

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

      const teamNames = team.students?.map((std) => std.username);
      const teamProjs = res.data.filter((proj) =>
        teamNames?.includes(proj.owner)
      );
      // Reset to avoid duplicated
      setPending([]);
      setApproved([]);
      setDetermined([]);
      res.data.forEach((proj) => {
        if (proj.status === "Approved") setApproved((prev) => [...prev, proj]);
      });
      teamProjs.forEach((proj) => {
        if (proj.status === "Pending") setPending((prev) => [...prev, proj]);
        if (proj.status === "Approved" || proj.status === "Rejected")
          setDetermined((prev) => [...prev, proj]);
      });

      setProject(teamProjs);
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

  const getTeam = async () => {
    try {
      const res = await axios.get(
        "https://6844185771eb5d1be03260ba.mockapi.io/teams"
      );
      const currTeam = res.data.find((team) => team.email === currEmail);
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
    const isTeacher = localStorage.getItem("role") === "teacher";
    if (loggedIn && isTeacher) {
      getTeam(currId);
      getProjects();
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (team && team.students?.length > 0) {
      getProjects();
    }
  }, [team]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
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
      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="md:hidden flex justify-between items-center p-4 ">
          <h1 className="text-xl font-bold text-gray-800">Tuwaiq ProjectHub</h1>
          <button
            onClick={() => setOpenSidebar(!openSidebar)}
            className="p-2 text-2xl rounded-full hover:bg-gray-200"
          >
            <RxHamburgerMenu />
          </button>
        </div>

        {activeSection === "home" && (
          <div>
            <section className="relative py-6 px-4">
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-200 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-200 rounded-full blur-xl"></div>
              </div>
              <header className="relative z-10 px-6 mb-3">
                <h1 className="text-3xl font-bold text-neutral-600 mb-3">
                  Welcome Back, {currUsername}
                </h1>
                <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-indigo-800 rounded-full"></div>
              </header>

              <div className="relative z-10 container mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="w-full flex flex-col md:items-start md:text-left order-2 lg:order-1 items-center text-center">
                  <h1 className="title-font text-4xl sm:text-3xl font-bold text-gray-900 leading-tight">
                    Guide, Review & Approve
                    <span className="mx-2 text-indigo-900">
                      Student Projects
                    </span>
                  </h1>

                  <p className="mb-8 leading-relaxed text-lg text-gray-600 max-w-lg">
                    Here you can manage submitted ideas, provide feedback, and
                    approve or reject projects to help students grow.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <button
                      onClick={() => setActiveSection("project proposals")}
                      className="text-white bg-gradient-to-br from-indigo-800 to-indigo-900 cursor-pointer border-0 py-2 px-8 focus:outline-none hover:from-indigo-900 rounded-md text-lg font-semibold"
                    >
                      Review Pending Ideas
                    </button>
                  </div>
                </div>

                <div className="w-full order-1 lg:order-2">
                  <img
                    className="object-cover object-center rounded-2xl w-full"
                    alt="hero"
                    src="/imgs/heroImg.png"
                  />
                </div>
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
                          <td className="px-4 py-3 whitespace-wrap font-semibold text-md text-gray-700">
                            {proj.owner}
                          </td>
                          <td className="px-4 py-3 whitespace-wrap">
                            {proj.title}
                          </td>
                          <td className="px-4 py-3 whitespace-wrap">
                            {proj.desc}
                          </td>
                          <td>
                            <div className="text-green-700 bg-green-100 w-fit p-0.5 px-2.5 rounded-md whitespace-wrap">
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
          <div
            id="pendingProjects"
          >
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
                        <td className="px-4 py-3 whitespace-wrap font-semibold text-xl text-gray-700">
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
                              className="bg-rose-700  h-6.6 rounded-md px-2 cursor-pointer"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => updateStatus(proj.id, "Approved")}
                              className="bg-[#2ab482]  h-6.6 rounded-md px-2 cursor-pointer"
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
                        <td className="px-4 py-3 whitespace-wrap font-semibold text-xl text-gray-700">
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

        {activeSection === "my team" && (
          <div>
            <header className="flex justify-between p-3">
              <h1 className="text-2xl font-bold text-gray-800">My Team</h1>
            </header>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr className="text-indigo-900 uppercase text-center">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Contact</th>
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
                        <div className="font-semibold text-xl">{team.teacher} <span className="text-gray-500">(You)</span></div>
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
                    <td className="px-4  text-3xl text-tuwaiq-purple">
                      <div className=" flex items-center justify-center cursor-pointer"></div>
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
                            {std.username}
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
                      <td className="px-4 text-3xl text-tuwaiq-purple">
                        <div className=" flex items-center justify-center cursor-pointer">
                          <a href={`mailto:${std.email}`}>
                            <MdEmail />
                          </a>
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

export default Teachers;
