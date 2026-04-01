import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { logout, clearAllUserErrors } from "../store/slices/userSlice";
import { LuMoveRight } from "react-icons/lu";

import MyProfile from "../components/MyProfile";
import UpdateProfile from "../components/UpdateProfile";
import UpdatePassword from "../components/UpdatePassword";
import MyJobs from "../components/MyJobs";
import JobPost from "../components/JobPost";
import Applications from "../components/Applications";
import MyApplications from "../components/MyApplications";

const Dashboard = () => {
  const [show, setShow] = useState(false);
  const [componentName, setComponentName] = useState("My Profile");

  const { loading, isAuthenticated, error, user } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();
  const navigateTo = useNavigate();

  const isEmployer = user?.role === "Employer";
  const isSeeker = user?.role === "Job Seeker";

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully.");
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAllUserErrors());
    }
    if (!isAuthenticated) {
      navigateTo("/");
    }
  }, [dispatch, error, isAuthenticated]);

  const renderComponent = () => {
    switch (componentName) {
      case "My Profile":
        return <MyProfile />;

      case "Update Profile":
        return <UpdateProfile />;

      case "Update Password":
        return <UpdatePassword />;

      case "Job Post":
        return isEmployer ? <JobPost /> : <MyProfile />;

      case "My Jobs":
        return isEmployer ? <MyJobs /> : <MyProfile />;

      case "Applications":
        return isEmployer ? <Applications /> : <MyProfile />;

      case "My Applications":
        return isSeeker ? <MyApplications /> : <MyProfile />;

      default:
        return <MyProfile />;
    }
  };

  return (
    <section className="account">
      <div className="component_header">
        <p></p>
        <p>
          Welcome! <span>{user?.name}</span>
        </p>
      </div>

      <div className="container">
        {/* Sidebar */}
        <div className={show ? "sidebar showSidebar" : "sidebar"}>
          <ul className="sidebar_links">
            <h4>Manage Account</h4>

            {/* COMMON */}
            <li>
              <button onClick={() => { setComponentName("My Profile"); setShow(false); }}>
                My Profile
              </button>
            </li>

            <li>
              <button onClick={() => { setComponentName("Update Profile"); setShow(false); }}>
                Update Profile
              </button>
            </li>

            <li>
              <button onClick={() => { setComponentName("Update Password"); setShow(false); }}>
                Update Password
              </button>
            </li>

            {/* EMPLOYER ONLY */}
            {isEmployer && (
              <>
                <li>
                  <button onClick={() => { setComponentName("Job Post"); setShow(false); }}>
                    Post New Job
                  </button>
                </li>

                <li>
                  <button onClick={() => { setComponentName("My Jobs"); setShow(false); }}>
                    My Jobs
                  </button>
                </li>

                <li>
                  <button onClick={() => { setComponentName("Applications"); setShow(false); }}>
                    Applications
                  </button>
                </li>
              </>
            )}

            {/* JOB SEEKER ONLY */}
            {isSeeker && (
              <li>
                <button onClick={() => { setComponentName("My Applications"); setShow(false); }}>
                  My Applications
                </button>
              </li>
            )}

            <li>
              <button onClick={handleLogout}>Logout</button>
            </li>
          </ul>
        </div>

        {/* Main Content */}
        <div className="banner">
          <div className={show ? "sidebar_icon move_right" : "sidebar_icon move_left"}>
            <LuMoveRight
              onClick={() => setShow(!show)}
              className={show ? "left_arrow" : "right_arrow"}
            />
          </div>

          {renderComponent()}
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
