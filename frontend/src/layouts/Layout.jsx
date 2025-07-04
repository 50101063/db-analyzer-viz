import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';

const Layout = () => {
  const { logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="container flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">DB Analyzer</Link>
          <nav>
            <ul className="flex space-x-4">
              <li><Link to="/connections" className="hover:underline">Connections</Link></li>
              <li><Link to="/visualize" className="hover:underline">Visualize</Link></li>
              <li><Link to="/profile" className="hover:underline">Profile</Link></li>
              <li><Button onClick={logout} variant="secondary" className="bg-blue-700 text-white hover:bg-blue-800">Logout</Button></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow container py-8">
        <Outlet /> {/* Renders the child route components */}
      </main>
      <footer className="bg-gray-800 text-white p-4 text-center">
        <div className="container">
          &copy; {new Date().getFullYear()} DB Analyzer. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
