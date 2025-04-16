import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function AnnouncementsManagement() {
    const [announcements, setAnnouncements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        content: '',
        priority: 'normal', // normal, important, urgent
        status: 'active' // active or archived
    });
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        // Load announcements from localStorage
        loadAnnouncements();
    }, [navigate]);

    const loadAnnouncements = () => {
        const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        // Sort by date (newest first)
        const sortedAnnouncements = [...storedAnnouncements].sort((a, b) =>
            new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at)
        );
        setAnnouncements(sortedAnnouncements);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const openModal = (announcement = null) => {
        if (announcement) {
            // Editing existing announcement
            setEditingAnnouncement(announcement);
            setFormData({
                id: announcement.id,
                title: announcement.title,
                content: announcement.content,
                priority: announcement.priority || 'normal',
                status: announcement.status || 'active'
            });
        } else {
            // Adding new announcement
            setEditingAnnouncement(null);
            setFormData({
                id: Date.now().toString(),
                title: '',
                content: '',
                priority: 'normal',
                status: 'active'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAnnouncement(null);
    };

    const saveAnnouncement = (e) => {
        e.preventDefault();

        const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (editingAnnouncement) {
            // Update existing announcement
            const updatedAnnouncements = storedAnnouncements.map(announcement =>
                announcement.id === formData.id ?
                    {
                        ...formData,
                        updatedAt: new Date().toISOString(),
                        updatedBy: userData.name || userData.email
                    } : announcement
            );
            localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        } else {
            // Add new announcement
            const newAnnouncement = {
                ...formData,
                createdAt: new Date().toISOString(),
                createdBy: userData.name || userData.email,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('announcements', JSON.stringify([...storedAnnouncements, newAnnouncement]));
        }

        loadAnnouncements();
        closeModal();
    };

    const deleteAnnouncement = (announcementId) => {
        if (window.confirm('Are you sure you want to delete this announcement?')) {
            const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
            const updatedAnnouncements = storedAnnouncements.filter(announcement => announcement.id !== announcementId);
            localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
            loadAnnouncements();
        }
    };

    const toggleStatus = (announcement) => {
        const storedAnnouncements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const newStatus = announcement.status === 'active' ? 'archived' : 'active';

        const updatedAnnouncements = storedAnnouncements.map(item =>
            item.id === announcement.id ? { ...item, status: newStatus } : item
        );

        localStorage.setItem('announcements', JSON.stringify(updatedAnnouncements));
        loadAnnouncements();
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
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Create Announcement
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
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created By
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {announcements.length > 0 ? (
                                        announcements.map((announcement) => (
                                            <tr key={announcement.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                        ${announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                            announcement.priority === 'important' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'}`}>
                                                        {announcement.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                        ${announcement.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {announcement.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">
                                                        {formatDate(announcement.createdAt || announcement.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{announcement.createdBy || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => toggleStatus(announcement)}
                                                        className={`${announcement.status === 'active' ? 'text-gray-600 hover:text-gray-900' : 'text-blue-600 hover:text-blue-900'} mr-4`}
                                                    >
                                                        {announcement.status === 'active' ? 'Archive' : 'Activate'}
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(announcement)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteAnnouncement(announcement.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No announcements found. Create a new announcement to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Announcement Modal */}
                {isModalOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={saveAnnouncement}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-y-4">
                                            <div>
                                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    name="title"
                                                    id="title"
                                                    required
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                                    Content
                                                </label>
                                                <textarea
                                                    name="content"
                                                    id="content"
                                                    required
                                                    rows="5"
                                                    value={formData.content}
                                                    onChange={handleInputChange}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                                                    Priority
                                                </label>
                                                <select
                                                    name="priority"
                                                    id="priority"
                                                    required
                                                    value={formData.priority}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="important">Important</option>
                                                    <option value="urgent">Urgent</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                                                    Status
                                                </label>
                                                <select
                                                    name="status"
                                                    id="status"
                                                    required
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="archived">Archived</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            {editingAnnouncement ? 'Update' : 'Create'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={closeModal}
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