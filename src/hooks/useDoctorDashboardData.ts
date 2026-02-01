import { useState, useEffect, useCallback } from 'react';
import { firestoreService } from '../firebase/firestore';
import { Appointment, Review } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const useDoctorDashboardData = () => {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchDashboardData = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);
            setError(null);

            // Fetch Appointments (assuming user is a doctor)
            const fetchedAppointments = await firestoreService.getAppointments(user.id, 'doctor');

            // Fetch Reviews
            const fetchedReviews = await firestoreService.getReviews(user.id);

            setAppointments(fetchedAppointments);
            setReviews(fetchedReviews);
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            setError(err.message || 'Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const confirmAppointment = async (appointmentId: string) => {
        try {
            await firestoreService.updateAppointment(appointmentId, { status: 'confirmed' });
            await fetchDashboardData(); // Refresh data to ensure sync
        } catch (err: any) {
            console.error('Error confirming appointment:', err);
            throw err;
        }
    };

    const cancelAppointment = async (appointmentId: string) => {
        try {
            await firestoreService.updateAppointment(appointmentId, { status: 'cancelled' });
            await fetchDashboardData(); // Refresh data
        } catch (err: any) {
            console.error('Error cancelling appointment:', err);
            throw err;
        }
    };

    // Calculate Stats
    const today = new Date().toISOString().split('T')[0];

    const stats = {
        // Unique patients count based on appointments
        totalPatients: new Set(appointments.map(a => a.patientId)).size,
        todayAppointments: appointments.filter(a => a.date.startsWith(today)).length,
        pendingAppointments: appointments.filter(a => a.status === 'pending').length,
        averageRating: reviews.length > 0
            ? Number((reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1))
            : 0
    };

    return {
        appointments,
        reviews,
        stats,
        loading,
        error,
        confirmAppointment,
        cancelAppointment,
        refresh: fetchDashboardData
    };
};