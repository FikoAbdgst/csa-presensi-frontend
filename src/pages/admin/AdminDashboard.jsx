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
    const navigate = useNavigate();

    useEffect(() => {
        // Check if admin
        const userData = JSON.parse(localStorage.getItem('user') || '{}');

        if (!userData) {
            navigate('/login');
            return;
        }


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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="flex space-x-3">
                        <a
                            href="/admin/users"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Manage Users
                        </a>
                        <a
                            href="/admin/announcements"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Manage Announcements
                        </a>
                        <a
                            href="/admin/meetings"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Manage Meetings
                        </a>
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
                                    {attendanceData.length > 0 ? (
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
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-500">
                                            No attendance data available
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Recent Attendances */}
                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Recent Attendances</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {stats.recentAttendances.length > 0 ? (
                                    stats.recentAttendances.map(attendance => (
                                        <div key={attendance.id} className="px-6 py-4">
                                            <div className="flex justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-900">{attendance.user_name}</p>
                                                    <p className="text-sm text-gray-500">{formatDate(attendance.createdAt || attendance.created_at)}</p>
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
                                    ))
                                ) : (
                                    <div className="px-6 py-4 text-center text-gray-500">
                                        No recent attendance records
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}