import React from 'react';
import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import AuthorProfile from './pages/AuthorProfile';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text transition-colors duration-200">
            <Navbar />
            
            {/* Main view injection */}
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/blogs" element={<Blogs />} />
                <Route path="/blogs/:slug" element={<BlogDetail />} />
                <Route path="/author/:id" element={<AuthorProfile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />
                
                {/* Fallback route */}
                <Route path="*" element={
                  <div className="py-20 text-center space-y-4">
                    <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                    <p className="text-muted text-sm">The resource you requested does not exist.</p>
                    <Link to="/" className="inline-block px-4 py-2 bg-primary text-white rounded-full text-xs font-bold">
                      Return Home
                    </Link>
                  </div>
                } />
              </Routes>
            </main>

            <Footer />
            <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
