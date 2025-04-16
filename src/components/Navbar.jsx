import { useState, useEffect } from 'react';
import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import { FaUserCircle, FaCalendarCheck, FaHome, FaHistory, FaBullhorn, FaUsers } from 'react-icons/fa';
import { RiDashboardLine } from 'react-icons/ri';
import Logo from '../assets/logo-csa.png';

export default function Navbar() {
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState({});

    useEffect(() => {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // Check if user has role before redirecting
        if (userData.role === 'admin' && path === '/dashboard') {
            navigate('/admin/dashboard');
        } else if (userData.role === 'member' && path.startsWith('/admin/')) {
            navigate('/dashboard');
        }
    }, [navigate, location.pathname]);

    const handleLogout = () => {
        // Close profile dropdown before logout
        setIsProfileOpen(false);

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Use a timeout to ensure state changes complete before navigation
        setTimeout(() => {
            navigate('/login');
        }, 10);
    };

    // Get current path
    const path = location.pathname;

    // Navigation links based on user role
    const memberLinks = [
        { path: '/dashboard', name: 'Dashboard', icon: <RiDashboardLine /> },
        { path: '/meetings', name: 'Meetings', icon: <FaCalendarCheck /> },
        { path: '/announcements', name: 'Announcements', icon: <FaBullhorn /> },
        { path: '/history', name: 'History', icon: <FaHistory /> },
    ];

    const adminLinks = [
        { path: '/admin/dashboard', name: 'Dashboard', icon: <RiDashboardLine /> },
        { path: '/admin/meetings', name: 'Meetings', icon: <FaCalendarCheck /> },
        { path: '/admin/announcements', name: 'Announcements', icon: <FaBullhorn /> },
        { path: '/admin/users', name: 'Members', icon: <FaUsers /> },
    ];

    // Determine which links to show based on user role
    const links = user.role === 'admin' ? adminLinks : memberLinks;

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between py-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <img src={Logo} alt="CSA Logo" className="h-10" />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="relative">
                            <button
                                className="flex items-center space-x-2 focus:outline-none"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-lg">
                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="hidden md:block text-gray-700">{user.name || 'User'}</span>
                                <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-10">
                                    <div className="px-4 py-3 text-sm text-gray-700 border-b">
                                        <div className="flex items-center mb-2">
                                            <div className="h-12 w-12 rounded-full bg-blue-700 flex items-center justify-center text-white text-xl mr-3">
                                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{user.name || user.username}</p>
                                                <p className="text-gray-500 text-xs">{user.email || ''}</p>
                                            </div>
                                        </div>
                                        <div className="py-1">
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-500">Position:</span>
                                                <span className="font-medium text-gray-800">{user.position || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-500">Division:</span>
                                                <span className="font-medium text-gray-800">{user.division || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between py-1">
                                                <span className="text-gray-500">Role:</span>
                                                <span className="font-medium text-blue-600 capitalize">{user.role || 'member'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition duration-200"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200">
                    <div className="flex space-x-8 overflow-x-auto py-3">
                        {links.map((link) => (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                className={({ isActive }) =>
                                    `flex items-center space-x-1 px-1 py-2 text-sm font-medium transition-colors duration-200 
                                    ${isActive
                                        ? 'text-blue-700 border-b-2 border-blue-700'
                                        : 'text-gray-500 hover:text-blue-700'}`
                                }
                            >
                                <span className="text-lg">{link.icon}</span>
                                <span>{link.name}</span>
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
}