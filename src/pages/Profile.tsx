import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';

import { storageService } from '../firebase/storage';
import { User, Mail, Phone, Camera, Stethoscope, Activity, Save, Loader } from 'lucide-react';

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuth();
    const { addNotification } = useNotifications();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        specialization: user?.specialization || '',
        conditions: user?.conditions?.join(', ') || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const file = e.target.files[0];
        // Validate file size (e.g., max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            addNotification({
                title: 'File too large',
                message: 'Please select an image under 2MB',
                type: 'error'
            });
            return;
        }

        setUploadingAvatar(true);
        try {
            // Upload to storage
            const path = `avatars/${user.id}/${Date.now()}_${file.name}`;
            const url = await storageService.uploadFile(file, path);

            // Update user profile
            await updateProfile({ avatar: url });

            addNotification({
                title: 'Photo Updated',
                message: 'Your profile photo has been updated successfully',
                type: 'success'
            });
        } catch (error) {
            console.error('Error uploading avatar:', error);
            addNotification({
                title: 'Upload Failed',
                message: 'Failed to upload profile photo',
                type: 'error'
            });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsLoading(true);
        try {
            const updates: any = {
                name: formData.name,
                phone: formData.phone
            };

            if (user.role === 'doctor') {
                updates.specialization = formData.specialization;
            } else {
                updates.conditions = formData.conditions.split(',').map(c => c.trim()).filter(Boolean);
            }

            await updateProfile(updates);



            setIsEditing(false);
            addNotification({
                title: 'Profile Updated',
                message: 'Your profile details have been saved.',
                type: 'success'
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            addNotification({
                title: 'Update Failed',
                message: 'Failed to update user profile',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header Background */}
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>

                <div className="px-8 pb-8">
                    {/* Avatar Section */}
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="relative group">
                            <div className="h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden flex items-center justify-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                                        {user.name.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {uploadingAvatar && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <Loader className="h-8 w-8 text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            <label
                                htmlFor="avatar-upload"
                                className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                                title="Change profile photo"
                            >
                                <Camera className="h-5 w-5 text-gray-600" />
                                <input
                                    id="avatar-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    disabled={uploadingAvatar}
                                />
                            </label>
                        </div>

                        <div className="flex space-x-3">
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                >
                                    Edit Profile
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Profile Details */}
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                <p className="text-gray-600 flex items-center space-x-2 mt-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                    <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs uppercase font-medium text-gray-600">
                                        {user.role}
                                    </span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${!isEditing && 'bg-gray-50 text-gray-500'}`}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            placeholder={!isEditing && !formData.phone ? 'Not set' : ''}
                                            className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${!isEditing && 'bg-gray-50 text-gray-500'}`}
                                        />
                                    </div>
                                </div>

                                {user.role === 'doctor' && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Specialization</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Stethoscope className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="specialization"
                                                value={formData.specialization}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="e.g. Cardiologist, General Practitioner"
                                                className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${!isEditing && 'bg-gray-50 text-gray-500'}`}
                                            />
                                        </div>
                                    </div>
                                )}

                                {user.role === 'patient' && (
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <Activity className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <input
                                                type="text"
                                                name="conditions"
                                                value={formData.conditions}
                                                onChange={handleInputChange}
                                                disabled={!isEditing}
                                                placeholder="e.g. Diabetes, Hypertension (comma separated)"
                                                className={`pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 ${!isEditing && 'bg-gray-50 text-gray-500'}`}
                                            />
                                        </div>
                                        {isEditing && (
                                            <p className="text-xs text-gray-500">Separate multiple conditions with commas</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {isEditing && (
                                <div className="flex justify-end pt-6 border-t border-gray-100">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                                    >
                                        {isLoading ? (
                                            <Loader className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Save className="h-5 w-5" />
                                        )}
                                        <span>Save Changes</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
