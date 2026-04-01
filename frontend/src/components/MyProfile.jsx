import React from "react";
import { useSelector } from "react-redux";
import ConvertDate from './DateConverter.jsx';

const MyProfile = () => {
  const { user } = useSelector((state) => state.user);
  return (
    <div className="account_components">
      <h3>My Profile</h3>
      <div>
        <label>Full Name</label>
        <input
          type="text"
          disabled
          value={user?.name || ""}
          onChange={(e) => e.target.value}
        />
      </div>

      <div>
        <label>Email Address</label>
        <input
          type="email"
          disabled
          value={user?.email || ""}
          onChange={(e) => e.target.value}
        />
      </div>
      {user?.role === "Job Seeker" && (
        <div>
          <label>My Preferred Job Niches</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <input
              type="text"
              disabled
              value={user?.niches?.firstNiche||""}
              onChange={(e) => e.target.value}
            />
            <input
              type="text"
              disabled
              value={ user?.niches?.secondNiche||""}
              onChange={(e) => e.target.value}
            />
            <input
              type="text"
              disabled
              value={ user?.niches?.thirdNiche||""}
              onChange={(e) => e.target.value}
            />
          </div>
        </div>
      )}
      <div>
        <label>Phone Number</label>
        <input
          type="number"
          disabled
          value={user?.phone || ""}
          onChange={(e) => e.target.value}
        />
      </div>
      <div>
        <label>Address</label>
        <input
          type="text"
          disabled
          value={user?.address || ""}
          onChange={(e) => e.target.value}
        />
      </div>
      <div>
        <label>Role</label>
        <input
          type="text"
          disabled
          value={user?.role || ""}
          onChange={(e) => e.target.value}
        />
      </div>
      <div>
        <label>Joined On</label>
        <input
          type="text"
          disabled
          value={ConvertDate(user?.createdAt) || ""}
          onChange={(e) => e.target.value}
        />
      </div>
    </div>
  );
};

export default MyProfile;
