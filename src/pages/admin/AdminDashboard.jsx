import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Navbar from '../../components/Navbar';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalAttendances: 0,
        totalMeetings: 0,
        recentAttendances: []
    });
    const [attendanceData, setAttendanceData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    // Dummy data
    const DUMMY_STATS = {
        totalMembers: 25,
        totalAttendances: 156,
        totalMeetings: 12,
        recentAttendances: [
            {
                id: 1,
                user_name: "Fiko Sujadi",
                created_at: new Date(2025, 3, 12, 8, 30).toISOString(),
                status: "hadir"
            },
            {
                id: 2,
                user_name: "John Doe",
                created_at: new Date(2025, 3, 12, 8, 35).toISOString(),
                status: "hadir"
            },
            {
                id: 3,
                user_name: "Jane Smith",
                created_at: new Date(2025, 3, 12, 9, 15).toISOString(),
                status: "izin"
            },
            {
                id: 4,
                user_name: "Alice Johnson",
                created_at: new Date(2025, 3, 11, 8, 30).toISOString(),
                status: "hadir"
            },
            {
                id: 5,
                user_name: "Bob Wilson",
                created_at: new Date(2025, 3, 11, 8, 40).toISOString(),
                status: "sakit"
            }
        ]
    };

    // Dummy attendance data for chart
    const DUMMY_ATTENDANCE_DATA = [
        {
            date: '2025-04-08',
            hadir: 18,
            izin: 3,
            sakit: 2,
            alfa: 2
        },
        {
            date: '2025-04-09',
            hadir: 20,
            izin: 1,
            sakit: 3,
            alfa: 1
        },
        {
            date: '2025-04-10',
            hadir: 15,
            izin: 5,
            sakit: 1,
            alfa: 4
        },
        {
            date: '2025-04-11',
            hadir: 22,
            izin: 2,
            sakit: 1,
            alfa: 0
        },
        {
            date: '2025-04-12',
            hadir: 19,
            izin: 2,
            sakit: 2,
            alfa: 2
        },
        {
            date: '2025-04-13',
            hadir: 23,
            izin: 1,
            sakit: 0,
            alfa: 1
        },
        {
            date: '2025-04-14',
            hadir: 21,
            izin: 2,
            sakit: 1,
            alfa: 1
        }
    ];

    useEffect(() => {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // Redirect if not admin
        if (userData.role !== 'admin') {
            navigate('/dashboard');
            return;
        }

        // Simulate fetching stats
        setTimeout(() => {
            setStats(DUMMY_STATS);
            setAttendanceData(DUMMY_ATTENDANCE_DATA);
            setIsLoading(false);
        }, 1000);
    }, [navigate]);

    // Format date
    const formatDate = (dateString) => {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    };

    // Format chart date for x-axis
    const formatChartDate = (dateString) => {
        const date = new Date(dateString);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    // Navigation helper for quick access
    const navigateTo = (path) => {
        navigate(path);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigateTo('/admin/users')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Manage Users
                        </button>
                        <button
                            onClick={() => navigateTo('/admin/announcements')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Manage Announcements
                        </button>
                        <button
                            onClick={() => navigateTo('/admin/meetings')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Manage Meetings
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Total Members</h2>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalMembers}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Total Attendances</h2>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalAttendances}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-gray-500 text-sm font-medium uppercase tracking-wide mb-2">Total Meetings</h2>
                                <p className="text-3xl font-bold text-gray-900">{stats.totalMeetings}</p>
                            </div>
                        </div>

                        {/* Attendance Chart */}
                        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Daily Attendance Chart</h2>
                            </div>
                            <div className="p-6">
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={attendanceData}
                                            margin={{
                                                top: 5,
                                                right: 30,
                                                left: 20,
                                                bottom: 5,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" tickFormatter={formatChartDate} />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="hadir" name="Hadir" fill="#3B82F6" />
                                            <Bar dataKey="izin" name="Izin" fill="#10B981" />
                                            <Bar dataKey="sakit" name="Sakit" fill="#F59E0B" />
                                            <Bar dataKey="alfa" name="Alfa" fill="#EF4444" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Recent Attendances */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Recent Attendances</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {stats.recentAttendances.map(attendance => (
                                    <div key={attendance.id} className="px-6 py-4">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{attendance.user_name}</p>
                                                <p className="text-sm text-gray-500">{formatDate(attendance.created_at)}</p>
                                            </div>
                                            <div>
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize
                                                    ${attendance.status === 'hadir' ? 'bg-green-100 text-green-800' :
                                                        attendance.status === 'izin' ? 'bg-blue-100 text-blue-800' :
                                                            attendance.status === 'sakit' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'}`}>
                                                    {attendance.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}