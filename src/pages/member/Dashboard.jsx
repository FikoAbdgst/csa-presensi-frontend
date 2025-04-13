import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';

export default function Dashboard() {
    const [attendances, setAttendances] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [attendanceNote, setAttendanceNote] = useState('');
    const [user, setUser] = useState({});
    const navigate = useNavigate();

    // Data dummy untuk absensi
    const DUMMY_ATTENDANCES = [
        {
            id: 1,
            user_id: 1,
            created_at: new Date(2025, 3, 12, 8, 30).toISOString(),
            note: "Hadir tepat waktu",
            status: "hadir"
        },
        {
            id: 2,
            user_id: 1,
            created_at: new Date(2025, 3, 11, 8, 15).toISOString(),
            note: "Diskusi project web absensi",
            status: "hadir"
        },
        {
            id: 3,
            user_id: 1,
            created_at: new Date(2025, 3, 10, 8, 45).toISOString(),
            note: "",
            status: "hadir"
        }
    ];

    useEffect(() => {
        // Get user data from localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        setUser(userData);

        // Redirect to appropriate dashboard based on role
        if (userData.role === 'admin') {
            navigate('/admin/dashboard');
            return;
        }

        // Simulate fetching attendance data

        // Simulasi pengambilan data dari API
        setTimeout(() => {
            setAttendances(DUMMY_ATTENDANCES);
            setIsLoading(false);
        }, 1000);
    }, [navigate]);

    const handleAttendance = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulasi pengiriman data ke API
        setTimeout(() => {
            const newAttendance = {
                id: attendances.length + 1,
                user_id: 1,
                created_at: new Date().toISOString(),
                note: attendanceNote,
                status: "hadir"
            };

            setAttendances([newAttendance, ...attendances]);
            setAttendanceNote('');
            setShowForm(false);
            setIsLoading(false);
        }, 800);
    };

    // Format tanggal
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Absensi</h1>
                    {/* Additional dashboard content here */}
                </div>

                {/* Display attendance records or other member-specific data */}
                {/* You can add more content as needed */}
            </div>
        </div>
    );
}