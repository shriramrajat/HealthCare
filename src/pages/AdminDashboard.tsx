import React, { useState, useEffect } from 'react';
import { Shield, Check, X, CheckCircle } from 'lucide-react';
import { firestoreService } from '../firebase/firestore';
import { User } from '../types';
import { useNotifications } from '../contexts/NotificationContext';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
    // Hooks
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    // Local State
    const [pendingDocs, setPendingDocs] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [verifyInProgress, setVerifyInProgress] = useState<string | null>(null);

    // Initial load of data
    useEffect(() => {
        if (!user) return;

        // Load the list of doctors waiting for verification
        const loadPendingRequest = async () => {
            try {
                const results = await firestoreService.getPendingDoctors();
                setPendingDocs(results);
            } catch (err) {
                console.error("Could not fetch pending doctors:", err);
                addNotification({
                    title: "System Error",
                    message: "Unable to load the verification queue.",
                    type: "error"
                });
            } finally {
                setIsLoading(false);
            }
        };

        loadPendingRequest();
    }, [user, addNotification]);

    // Handlers
    const approveDoctor = async (doctorId: string) => {
        setVerifyInProgress(doctorId);
        try {
            await firestoreService.verifyDoctor(doctorId);
            // Optimistic update
            setPendingDocs(current => current.filter(doc => doc.id !== doctorId));

            addNotification({
                title: "Success",
                message: "Doctor account verified and active.",
                type: "success"
            });
        } catch (err) {
            console.error("Verification error:", err);
            addNotification({
                title: "Operation Failed",
                message: "Could not verify this account. Check console.",
                type: "error"
            });
        } finally {
            setVerifyInProgress(null);
        }
    };

    const rejectDoctor = (_docId: string) => {
        // TODO: Implement actual user deletion or rejection logic here
        addNotification({
            title: "Feature Unavailable",
            message: "Rejection is currently disabled to prevent data loss in demo.",
            type: "warning"
        });
    };

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center space-x-3 mb-8">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        Admin Dashboard
                        <span className={`text-xs px-2 py-1 rounded-full border ${user?.role === 'admin'
                            ? 'bg-green-100 text-green-800 border-green-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                            }`}>
                            {user?.role === 'admin' ? 'Admin Access' : 'View Only'}
                        </span>
                    </h1>
                    <p className="text-gray-600">Verification Queue & System Status</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {pendingDocs.length} Waiting
                    </span>
                </div>

                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Refreshing queue...</div>
                ) : pendingDocs.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">All Clear</h3>
                        <p className="text-gray-500">There are no pending verifications at this time.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {pendingDocs.map((doc) => (
                            <div key={doc.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-4">
                                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                                        {doc.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900">{doc.name}</h3>
                                        <p className="text-sm text-gray-500">{doc.email}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                                {doc.specialization || 'General Practitioner'}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                ID: {doc.id.slice(0, 8)}...
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => rejectDoctor(doc.id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Reject Application"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => approveDoctor(doc.id)}
                                        disabled={!!verifyInProgress}
                                        className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                        {verifyInProgress === doc.id ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Check className="h-4 w-4" />
                                                <span>Approve</span>
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
