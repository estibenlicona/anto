import React from "react";
import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { Outlet } from "react-router-dom";
import { Footer } from "./components/Footer";

export const MainLayout: React.FC = () => {
  return (
    <div className="main-layout">
      <Header />
      <div className="main-layout__body">
        <Sidebar />
        <main className="main-layout__content">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};
