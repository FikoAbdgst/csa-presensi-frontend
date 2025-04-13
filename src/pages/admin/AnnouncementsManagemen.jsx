import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function AnnouncementsManagement() {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        importance: 'normal',
        active: true,
    });
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    // Load announcements from localStorage
    useEffect(() => {
        // Check if admin
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        // Load announcements from localStorage or set default
        const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        if (storedAnnouncements.length === 0) {
            // Set some default announcements
            const defaultAnnouncements = [
                {
                    id: 1,
                    title: "Weekly Meeting Schedule",
                    content: "Our weekly meetings will be held every Friday at 10AM in the main conference room.",
                    createdAt: new Date(2025, 3, 10).toISOString(),
                    importance: "normal",
                    active: true,
                    createdBy: "Admin User"
                },
                {
                    id: 2,
                    title: "New Project Updates",
                    content: "We'll be starting a new project next month. All members are required to update their skills matrix.",
                    createdAt: new Date(2025, 3, 12).toISOString(),
                    importance: "high",
                    active: true,
                    createdBy: "Admin User"
                }
            ];
            localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
            setAnnouncements(defaultAnnouncements);
        } else {
            setAnnouncements(storedAnnouncements);
        }
        setIsLoading(false);
    }, [navigate]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();

        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (isEditing) {
            // Update existing announcement
            const updatedAnnouncements = announcements.map(announcement =>
                announcement.id === currentAnnouncement.id ? {
                    ...currentAnnouncement,
                    ...formData,
                    updatedAt: new Date().toISOString(),
                    updatedBy: userData.name || 'Admin'
                } : announcement
            );
            setAnnouncements(updatedAnnouncements);
            localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        } else {
            // Create new announcement
            const newAnnouncement = {
                ...formData,
                id: announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1,
                createdAt: new Date().toISOString(),
                createdBy: userData.name || 'Admin'
            };
            const updatedAnnouncements = [...announcements, newAnnouncement];
            setAnnouncements(updatedAnnouncements);
            localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        }

        // Reset and close modal
        handleCloseModal();
    };

    // Handle delete announcement
    const handleDelete = (announcementId) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            const updatedAnnouncements = announcements.filter(announcement => announcement.id !== announcementId);
            setAnnouncements(updatedAnnouncements);
            localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        }
    };

    // Toggle announcement activation
    const handleToggleActive = (announcementId) => {
        const updatedAnnouncements = announcements.map(announcement =>
            announcement.id === announcementId ? {
                ...announcement,
                active: !announcement.active
            } : announcement
        );
        setAnnouncements(updatedAnnouncements);
        localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
    };

    // Open modal for adding announcement
    const handleAddAnnouncement = () => {
        setFormData({
            title: '',
            content: '',
            importance: 'normal',
            active: true,
        });
        setIsEditing(false);
        setIsModalOpen(true);
    };

    // Open modal for editing announcement
    const handleEditAnnouncement = (announcement) => {
        setCurrentAnnouncement(announcement);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            importance: announcement.importance,
            active: announcement.active,
        });
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Close modal and reset form
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentAnnouncement(null);
        setFormData({
            title: '',
            content: '',
            importance: 'normal',
            active: true,
        });
    };

    // Format date
    const formatDate = (dateString) => {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Announcements Management</h1>
                    <button
                        onClick={handleAddAnnouncement}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Add New Announcement
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
                    <div className="space-y-6">
                        {announcements.length === 0 ? (
                            <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
                                No announcements found
                            </div>
                        ) : (
                            announcements.map(announcement => (
                                <div key={announcement.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                                    <div className="px-4 py-5 sm:px-6 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                                {announcement.title}
                                                {announcement.importance === 'high' && (
                                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                        Important
                                                    </span>
                                                )}
                                                {!announcement.active && (
                                                    <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                                Created by {announcement.createdBy} on {formatDate(announcement.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleToggleActive(announcement.id)}
                                                className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${announcement.active
                                                    ? 'text-white bg-green-600 hover:bg-green-700'
                                                    : 'text-white bg-gray-600 hover:bg-gray-700'
                                                    }`}
                                            >
                                                {announcement.active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                onClick={() => handleEditAnnouncement(announcement)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(announcement.id)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                        <div className="text-sm text-gray-700 whitespace-pre-line">
                                            {announcement.content}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Modal for Add/Edit Announcement */}
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
                                                {isEditing ? 'Edit Announcement' : 'Add New Announcement'}
                                            </h3>
                                        </div>
                                        <div className="space-y-6">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    id="title"
                                                    value={formData.title}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
                                                <textarea
                                                    name="content"
                                                    id="content"
                                                    rows="4"
                                                    value={formData.content}
                                                    onChange={handleChange}
                                                    required
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label htmlFor="importance" className="block text-sm font-medium text-gray-700">Importance</label>
                                                <select
                                                    name="importance"
                                                    id="importance"
                                                    value={formData.importance}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="high">High (Important)</option>
                                                </select>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="active"
                                                    name="active"
                                                    type="checkbox"
                                                    checked={formData.active}
                                                    onChange={handleChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                                                    Active
                                                </label>
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