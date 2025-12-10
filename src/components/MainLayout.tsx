// src/components/MainLayout.tsx
import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";

interface MainLayoutProps {
  children: ReactNode;
  title: string;
}

const MainLayout = ({ children, title }: MainLayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <TopBar title={title} />
      <main className="pt-16 ml-0 md:ml-64 transition-all duration-300">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default MainLayout;
