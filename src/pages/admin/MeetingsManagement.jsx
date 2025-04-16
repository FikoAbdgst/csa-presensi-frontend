import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function MeetingsManagement() {
    const [meetings, setMeetings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        enableManualAttendance: false,
        enableQrAttendance: false
    });
    const [qrUrl, setQrUrl] = useState('');
    const [attendances, setAttendances] = useState([]);
    const [users, setUsers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        if (userData.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        // Load meetings from localStorage
        loadMeetings();
        // Load users for attendance management
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        setUsers(storedUsers.filter(user => user.role === 'member'));
    }, [navigate]);

    const loadMeetings = () => {
        const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
        // Sort by date (newest first)
        const sortedMeetings = [...storedMeetings].sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateB - dateA;
        });
        setMeetings(sortedMeetings);
        setIsLoading(false);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const openModal = (meeting = null) => {
        if (meeting) {
            // Editing existing meeting
            setEditingMeeting(meeting);
            setFormData({
                id: meeting.id,
                title: meeting.title,
                description: meeting.description || '',
                date: meeting.date,
                time: meeting.time,
                location: meeting.location || '',
                enableManualAttendance: meeting.enableManualAttendance || false,
                enableQrAttendance: meeting.enableQrAttendance || false
            });
        } else {
            // Adding new meeting
            setEditingMeeting(null);
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            const formattedTime = today.toTimeString().slice(0, 5);

            setFormData({
                id: Date.now().toString(),
                title: '',
                description: '',
                date: formattedDate,
                time: formattedTime,
                location: '',
                enableManualAttendance: false,
                enableQrAttendance: false
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMeeting(null);
    };

    const saveMeeting = (e) => {
        e.preventDefault();

        const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (editingMeeting) {
            // Update existing meeting
            const updatedMeetings = storedMeetings.map(meeting =>
                meeting.id === formData.id ?
                    {
                        ...formData,
                        updatedAt: new Date().toISOString(),
                        updatedBy: userData.name || userData.email
                    } : meeting
            );
            localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
        } else {
            // Add new meeting
            const newMeeting = {
                ...formData,
                createdAt: new Date().toISOString(),
                createdBy: userData.name || userData.email,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem('meetings', JSON.stringify([...storedMeetings, newMeeting]));
        }

        loadMeetings();
        closeModal();
    };

    const deleteMeeting = (meetingId) => {
        if (window.confirm('Are you sure you want to delete this meeting? This will also delete all associated attendance records.')) {
            const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
            const updatedMeetings = storedMeetings.filter(meeting => meeting.id !== meetingId);
            localStorage.setItem('meetings', JSON.stringify(updatedMeetings));

            // Delete associated attendance records
            const storedAttendances = JSON.parse(localStorage.getItem('attendances') || '[]');
            const updatedAttendances = storedAttendances.filter(attendance => attendance.meeting_id !== meetingId);
            localStorage.setItem('attendances', JSON.stringify(updatedAttendances));

            loadMeetings();
        }
    };

    const toggleAttendanceSettings = (meetingId, settingName) => {
        const storedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
        const updatedMeetings = storedMeetings.map(meeting => {
            if (meeting.id === meetingId) {
                return {
                    ...meeting,
                    [settingName]: !meeting[settingName],
                    updatedAt: new Date().toISOString()
                };
            }
            return meeting;
        });

        localStorage.setItem('meetings', JSON.stringify(updatedMeetings));
        loadMeetings();
    };

    const openAttendanceModal = (meeting) => {
        setSelectedMeeting(meeting);

        // Load attendances for this meeting
        const storedAttendances = JSON.parse(localStorage.getItem('attendances') || '[]');
        const filteredAttendances = storedAttendances.filter(a => a.meeting_id === meeting.id);
        setAttendances(filteredAttendances);

        // Generate dummy QR code URL
        setQrUrl(`${window.location.origin}/attendance/${meeting.id}`);

        setIsAttendanceModalOpen(true);
    };

    const closeAttendanceModal = () => {
        setIsAttendanceModalOpen(false);
        setSelectedMeeting(null);
    };

    const recordManualAttendance = (userId, status) => {
        if (!selectedMeeting) return;

        const storedAttendances = JSON.parse(localStorage.getItem('attendances') || '[]');
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const user = users.find(u => u.id === userId);

        // Check if attendance record already exists
        const existingIndex = storedAttendances.findIndex(
            a => a.user_id === userId && a.meeting_id === selectedMeeting.id
        );

        if (existingIndex >= 0) {
            // Update existing record
            storedAttendances[existingIndex] = {
                ...storedAttendances[existingIndex],
                status,
                updatedAt: new Date().toISOString(),
                recorded_by: userData.name || userData.email
            };
        } else {
            // Create new record
            const newAttendance = {
                id: Date.now().toString(),
                meeting_id: selectedMeeting.id,
                meeting_title: selectedMeeting.title,
                user_id: userId,
                user_name: user?.name || 'Unknown User',
                status,
                createdAt: new Date().toISOString(),
                recorded_by: userData.name || userData.email,
                method: 'manual'
            };
            storedAttendances.push(newAttendance);
        }

        localStorage.setItem('attendances', JSON.stringify(storedAttendances));

        // Reload attendances for this meeting
        const updatedAttendances = storedAttendances.filter(a => a.meeting_id === selectedMeeting.id);
        setAttendances(updatedAttendances);
    };

    // Format date
    const formatDate = (dateString, timeString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        const date = new Date(`${dateString}T${timeString}`);
        return date.toLocaleDateString('id-ID', options);
    };

    // Format time
    const formatTime = (timeString) => {
        return timeString;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Meetings Management</h1>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Create Meeting
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
                                            Meeting
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date & Time
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Manual Attendance
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            QR Attendance
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {meetings.length > 0 ? (
                                        meetings.map((meeting) => (
                                            <tr key={meeting.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{meeting.title}</div>
                                                    {meeting.description && (
                                                        <div className="text-sm text-gray-500 truncate max-w-xs">{meeting.description}</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{formatDate(meeting.date, meeting.time)}</div>
                                                    <div className="text-sm text-gray-500">{formatTime(meeting.time)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-500">{meeting.location || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => toggleAttendanceSettings(meeting.id, 'enableManualAttendance')}
                                                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${meeting.enableManualAttendance ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                            role="switch"
                                                            aria-checked={meeting.enableManualAttendance || false}
                                                        >
                                                            <span className="sr-only">Toggle manual attendance</span>
                                                            <span
                                                                aria-hidden="true"
                                                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${meeting.enableManualAttendance ? 'translate-x-5' : 'translate-x-0'}`}
                                                            ></span>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => toggleAttendanceSettings(meeting.id, 'enableQrAttendance')}
                                                            className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${meeting.enableQrAttendance ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                            role="switch"
                                                            aria-checked={meeting.enableQrAttendance || false}
                                                        >
                                                            <span className="sr-only">Toggle QR attendance</span>
                                                            <span
                                                                aria-hidden="true"
                                                                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200 ${meeting.enableQrAttendance ? 'translate-x-5' : 'translate-x-0'}`}
                                                            ></span>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => openAttendanceModal(meeting)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Attendance
                                                    </button>
                                                    <button
                                                        onClick={() => openModal(meeting)}
                                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteMeeting(meeting.id)}
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
                                                No meetings found. Create a new meeting to get started.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Meeting Modal */}
                {isModalOpen && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                                <form onSubmit={saveMeeting}>
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="mb-4">
                                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                                {editingMeeting ? 'Edit Meeting' : 'Create Meeting'}
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
                                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                                    Description
                                                </label>
                                                <textarea
                                                    name="description"
                                                    id="description"
                                                    rows="3"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                ></textarea>
                                            </div>
                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div>
                                                    <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                                                        Date
                                                    </label>
                                                    <input
                                                        type="date"
                                                        name="date"
                                                        id="date"
                                                        required
                                                        value={formData.date}
                                                        onChange={handleInputChange}
                                                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                                                        Time
                                                    </label>
                                                    <input
                                                        type="time"
                                                        name="time"
                                                        id="time"
                                                        required
                                                        value={formData.time}
                                                        onChange={handleInputChange}
                                                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                                                    Location
                                                </label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    id="location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="enableManualAttendance"
                                                    name="enableManualAttendance"
                                                    type="checkbox"
                                                    checked={formData.enableManualAttendance}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="enableManualAttendance" className="ml-2 block text-sm text-gray-900">
                                                    Enable Manual Attendance
                                                </label>
                                            </div>
                                            <div className="flex items-center">
                                                <input
                                                    id="enableQrAttendance"
                                                    name="enableQrAttendance"
                                                    type="checkbox"
                                                    checked={formData.enableQrAttendance}
                                                    onChange={handleInputChange}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                />
                                                <label htmlFor="enableQrAttendance" className="ml-2 block text-sm text-gray-900">
                                                    Enable QR Code Attendance
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                        <button
                                            type="submit"
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                        >
                                            {editingMeeting ? 'Update' : 'Create'}
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

                {/* Attendance Modal */}
                {isAttendanceModalOpen && selectedMeeting && (
                    <div className="fixed z-10 inset-0 overflow-y-auto">
                        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                            </div>

                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Attendance for {selectedMeeting.title}
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={closeAttendanceModal}
                                            className="text-gray-400 hover:text-gray-500"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Manual Attendance Section */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-gray-900 mb-4">Manual Attendance</h4>

                                            {selectedMeeting.enableManualAttendance ? (
                                                <div>
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-600">
                                                            Manually mark attendance for members. Records will be saved to the system.
                                                        </p>
                                                    </div>

                                                    <div className="overflow-y-auto max-h-96">
                                                        <table className="min-w-full divide-y divide-gray-200">
                                                            <thead className="bg-gray-100">
                                                                <tr>
                                                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Name
                                                                    </th>
                                                                    <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                        Status
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="bg-white divide-y divide-gray-200">
                                                                {users.length > 0 ? (
                                                                    users.map((user) => {
                                                                        const attendanceRecord = attendances.find(a => a.user_id === user.id);
                                                                        return (
                                                                            <tr key={user.id}>
                                                                                <td className="px-4 py-2 whitespace-nowrap">
                                                                                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                                                </td>
                                                                                <td className="px-4 py-2 whitespace-nowrap text-right">
                                                                                    <div className="flex justify-end space-x-2">
                                                                                        <button
                                                                                            onClick={() => recordManualAttendance(user.id, 'present')}
                                                                                            className={`px-2 py-1 text-xs rounded ${attendanceRecord?.status === 'present'
                                                                                                ? 'bg-green-100 text-green-800 border border-green-500'
                                                                                                : 'bg-gray-100 text-gray-800 hover:bg-green-50'
                                                                                                }`}
                                                                                        >
                                                                                            Present
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => recordManualAttendance(user.id, 'absent')}
                                                                                            className={`px-2 py-1 text-xs rounded ${attendanceRecord?.status === 'absent'
                                                                                                ? 'bg-red-100 text-red-800 border border-red-500'
                                                                                                : 'bg-gray-100 text-gray-800 hover:bg-red-50'
                                                                                                }`}
                                                                                        >
                                                                                            Absent
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => recordManualAttendance(user.id, 'late')}
                                                                                            className={`px-2 py-1 text-xs rounded ${attendanceRecord?.status === 'late'
                                                                                                ? 'bg-yellow-100 text-yellow-800 border border-yellow-500'
                                                                                                : 'bg-gray-100 text-gray-800 hover:bg-yellow-50'
                                                                                                }`}
                                                                                        >
                                                                                            Late
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan="2" className="px-4 py-4 text-center text-sm text-gray-500">
                                                                            No users found.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-40">
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500 mb-2">Manual attendance is currently disabled for this meeting.</div>
                                                        <button
                                                            onClick={() => toggleAttendanceSettings(selectedMeeting.id, 'enableManualAttendance')}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Enable Manual Attendance
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* QR Attendance Section */}
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <h4 className="text-md font-medium text-gray-900 mb-4">QR Code Attendance</h4>

                                            {selectedMeeting.enableQrAttendance ? (
                                                <div>
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-600">
                                                            Share this QR code with members to scan for attendance.
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-center justify-center">
                                                        {/* Placeholder for QR code - in a real app, you'd generate a QR code */}
                                                        <div className="bg-white p-2 border border-gray-300 mb-3">
                                                            <div className="h-48 w-48 bg-gray-100 flex items-center justify-center">
                                                                <div className="text-center">
                                                                    <div className="text-sm text-gray-500 mb-2">QR Code</div>
                                                                    <div className="text-xs text-gray-400">
                                                                        (QR Code for meeting {selectedMeeting.id})
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="text-xs text-gray-500 mb-4">
                                                            URL: {qrUrl}
                                                        </div>

                                                        <button
                                                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Download QR Code
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center h-40">
                                                    <div className="text-center">
                                                        <div className="text-sm text-gray-500 mb-2">QR code attendance is currently disabled for this meeting.</div>
                                                        <button
                                                            onClick={() => toggleAttendanceSettings(selectedMeeting.id, 'enableQrAttendance')}
                                                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        >
                                                            Enable QR Code Attendance
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Attendance Summary */}
                                    <div className="mt-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-4">Attendance Summary</h4>

                                        {attendances.length > 0 ? (
                                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                                <div className="overflow-x-auto">
                                                    <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                            <tr>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Member
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Status
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Record Time
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Method
                                                                </th>
                                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                    Recorded By
                                                                </th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                            {attendances.map((attendance) => (
                                                                <tr key={attendance.id}>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm font-medium text-gray-900">{attendance.user_name}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                                            ${attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                                                                                attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                                                    'bg-yellow-100 text-yellow-800'}`}>
                                                                            {attendance.status}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-500">
                                                                            {new Date(attendance.createdAt).toLocaleString('id-ID')}
                                                                        </div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-500 capitalize">{attendance.method || 'manual'}</div>
                                                                    </td>
                                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                                        <div className="text-sm text-gray-500">{attendance.recorded_by}</div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-lg text-center">
                                                <p className="text-sm text-gray-500">No attendance records for this meeting yet.</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Export button */}
                                    <div className="mt-6 flex justify-end">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Export Attendance
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}