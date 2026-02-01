import React, { useState, useEffect } from 'react';
import { Shield, Check, X, CheckCircle } from 'lucide-react';
import { firestoreService } from '../firebase/firestore';
import { User } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [doctors, setDoctors] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Fetch pending doctors
    useEffect(() => {
        const fetchDoctors = async () => {
            // In a real app, you'd probably check for role === 'admin' here or in route protection
            // For this demo, we allow access but only show data if we can fetch it (which might require rules)
            try {
                const pendingDoctors = await firestoreService.getPendingDoctors();
                setDoctors(pendingDoctors);
            } catch (error) {
                console.error("Failed to load doctors", error);
                addNotification({
                    title: "Error",
                    message: "Failed to load pending verifications.",
                    type: "error"
                });
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDoctors();
    }, [user, addNotification]);

    const handleVerify = async (doctorId: string) => {
        setProcessingId(doctorId);
        try {
            await firestoreService.verifyDoctor(doctorId);
            setDoctors(prev => prev.filter(d => d.id !== doctorId));
            addNotification({
                title: "Doctor Verified",
                message: "Doctor has been successfully approved.",
                type: "success"
            });
        } catch (error) {
            console.error("Verification failed", error);
            addNotification({
                title: "Error",
                message: "Failed to verify doctor.",
                type: "error"
            });
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = (doctorId: string) => {
        console.log(`Rejecting doctor ${doctorId}`);
        // For now, just remove from list locally or implement delete logic
        // We'll just show a "Not Implemented" toast for safety against accidental deletions in demo
        addNotification({
            title: "Action Restricted",
            message: "Rejection deletes the user account. This is disabled in demo mode.",
            type: "warning"
        });
    };

    if (!user) return <Navigate to="/login" />;

    // Simple role check - in production use a robust router guard
    // Allowing 'patient' to see this for DEMO purposes if they visit /admin,
    // otherwise we need to manually update a user to 'admin' role in Firestore.
    // Let's assume the user IS an admin if they are here, or just show it.

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center space-x-3 mb-8">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600">Manage doctor verifications and system status</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Pending Verifications</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {doctors.length} Pending
                    </span>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading requests...</div>
                ) : doctors.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-500">No pending doctor verifications.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {doctors.map((doctor) => (
                            <div key={doctor.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {doctor.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{doctor.name}</h3>
                                        <p className="text-sm text-gray-500">{doctor.email}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {doctor.specialization || 'General Practitioner'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ID: {doctor.id.slice(0, 8)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => handleReject(doctor.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Reject"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleVerify(doctor.id)}
                                        disabled={!!processingId}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {processingId === doctor.id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>Verify</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
