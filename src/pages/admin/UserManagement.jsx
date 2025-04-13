import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        position: '',
        division: '',
        role: 'member'
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Load users from localStorage
    useEffect(() => {
        // Check if admin
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        // Load users from localStorage or set default
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        if (storedUsers.length === 0) {
            // Default users if none exist
            const defaultUsers = [
                {
                    id: 1,
                    username: "fiko",
                    password: "123",
                    name: "Fiko Sujadi",
                    email: "fiko@example.com",
                    position: "Frontend Developer",
                    division: "Web Development",
                    role: "member"
                },
                {
                    id: 2,
                    username: "admin",
                    password: "admin123",
                    name: "Admin User",
                    email: "admin@example.com",
                    position: "Manager",
                    division: "Administration",
                    role: "admin"
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
            setUsers(defaultUsers);
        } else {
            setUsers(storedUsers);
        }
        setIsLoading(false);
    }, [navigate]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            // Update existing user
            const updatedUsers = users.map(user =>
                user.id === currentUser.id ? { ...formData, id: user.id } : user
            );
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        } else {
            // Create new user
            const newUser = {
                ...formData,
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1
            };
            const updatedUsers = [...users, newUser];
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }

        // Reset and close modal
        handleCloseModal();
    };

    // Handle delete user
    const handleDelete = (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            const updatedUsers = users.filter(user => user.id !== userId);
            setUsers(updatedUsers);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
        }
    };

    // Open modal for adding user
    const handleAddUser = () => {
        setFormData({
            name: '',
            email: '',
            username: '',
            password: '',
            position: '',
            division: '',
            role: 'member'
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // Open modal for editing user
    const handleEditUser = (user) => {
        setCurrentUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            username: user.username,
            password: user.password,
            position: user.position,
            division: user.division,
            role: user.role
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Close modal and reset form
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentUser(null);
        setFormData({
            name: '',
            email: '',
            username: '',
            password: '',
            position: '',
            division: '',
            role: 'member'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <button
                        onClick={handleAddUser}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add New User
                    </button>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {users.length === 0 ? (
                                <li className="px-6 py-4 text-center text-gray-500">No users found</li>
                            ) : (
                                users.map(user => (
                                    <li key={user.id} className="px-6 py-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center text-white text-lg mr-4">
                                                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <span className={`px-2 py-1 text-xs rounded-full capitalize mr-4 ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(user.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-500">
                                            <div>
                                                <span className="font-medium text-gray-600">Username:</span> {user.username}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Position:</span> {user.position}
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-600">Division:</span> {user.division}
                                            </div>
                                        </div>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>
                )}

                {/* Modal for Add/Edit User */}
                {isModalOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={handleSubmit}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {isEditing ? 'Edit User' : 'Add New User'}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    id="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    id="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                                                <input
                                                    type="text"
                                                    name="username"
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    id="password"
                                                    value={formData.password}
                                                    onChange={handleChange}
                                                    required={!isEditing}
                                                    placeholder={isEditing ? "Leave blank to keep current" : ""}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                                                <input
                                                    type="text"
                                                    name="position"
                                                    id="position"
                                                    value={formData.position}
                                                    onChange={handleChange}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="division" className="block text-sm font-medium text-gray-700">Division</label>
                                                <input
                                                    type="text"
                                                    name="division"
                                                    id="division"
                                                    value={formData.division}
                                                    onChange={handleChange}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
                                                <select
                                                    name="role"
                                                    id="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="member">Member</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            {isEditing ? 'Update' : 'Add'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}