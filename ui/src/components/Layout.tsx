import { Outlet } from "react-router-dom";
import Header from "@/components/Header"; // adjust path as needed
import Sidebar from "@/components/Sidebar"; // optional, if using sidebar

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar promptHistory={[]} /> {/* Optional if you use a sidebar */}
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-4">
          <Outlet /> {/* This renders the active route component */}
        </main>
      </div>
    </div>
  );
};

export default Layout;