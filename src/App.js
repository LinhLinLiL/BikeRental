import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import DetectPlate from "./pages/DetectPlate";
import Dashboard from "./screens/Dashboard";
import Users from "./screens/Users";
import Bikes from "./screens/Bikes";
import Locks from "./screens/Locks";
import Statics from "./screens/StationStats";
import Login from "./screens/Login";

import RequireAuth from "./RequireAuth";

const LayoutWithSidebar = ({ children }) => (
  <div className="flex h-screen w-screen overflow-hidden">
    <Sidebar />
    <div className="flex flex-col flex-1 overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-auto p-6 bg-gray-100">{children}</main>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <LayoutWithSidebar>
                <Dashboard />
              </LayoutWithSidebar>
            </RequireAuth>
          }
        />
        <Route
          path="/detect-plate"
          element={
            <RequireAuth>
              <LayoutWithSidebar>
                <DetectPlate />
              </LayoutWithSidebar>
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <LayoutWithSidebar>
                <Users />
              </LayoutWithSidebar>
            </RequireAuth>
          }
        />
        <Route
          path="/bikes"
          element={
            <RequireAuth>
              <LayoutWithSidebar>
                <Bikes />
              </LayoutWithSidebar>
            </RequireAuth>
          }
        />
        <Route
          path="/locks"
          element={
            <RequireAuth>
              <LayoutWithSidebar>
                <Locks />
              </LayoutWithSidebar>
            </RequireAuth>
          }
        />
        <Route
          path="/statics"
          element={
            <RequireAuth>
              <LayoutWithSidebar>
                <Statics />
              </LayoutWithSidebar>
            </RequireAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
