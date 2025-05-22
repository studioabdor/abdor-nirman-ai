import React from "react";
import { signOutUser } from "../../lib/auth";

const LogoutButton: React.FC = () => {
  const handleLogout = async () => {
    try {
      await signOutUser();
      // Handle successful sign-out (e.g., redirect or display message)
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally display an error message to the user
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogoutButton;
