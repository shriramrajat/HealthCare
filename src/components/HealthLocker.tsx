import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { storageService } from '../firebase/storage';
import { firestoreService } from '../firebase/firestore'; // You need to add get/add methods here later
import { useNotifications } from '../contexts/NotificationContext';
import { MedicalDocument } from '../types';
import { Upload, FileText, Trash2, Eye, X, Loader } from 'lucide-react';

const HealthLocker: React.FC = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();

    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [uploading, setUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial documents
    useEffect(() => {
        if (!user) return;
        loadDocuments();
    }, [user]);

    const loadDocuments = async () => {
        try {
            if (user?.id) {
                const docs = await firestoreService.getMedicalDocuments(user.id);
                setDocuments(docs);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error loading documents:', error);
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !user) return;

        const file = e.target.files[0];
        // 5MB limit
        if (file.size > 5 * 1024 * 1024) {
            addNotification({
                title: 'File too large',
                message: 'Please select a file smaller than 5MB',
                type: 'error'
            });
            return;
        }

        setUploading(true);
        try {
            // 1. Upload to Storage
            // We use a helper from storageService
            const path = `medical-records/${user.id}/${Date.now()}_${file.name}`;
            const url = await storageService.uploadFile(file, path);

            // 2. Save Metadata to Firestore
            const newDoc: Omit<MedicalDocument, 'id'> = {
                userId: user.id,
                name: file.name,
                type: 'lab_report', // You could add a UI selector for this
                url: url,
                path: path,
                size: file.size,
                uploadedAt: new Date().toISOString()
            };

            await firestoreService.addMedicalDocument(newDoc);

            addNotification({
                title: 'Upload Successful',
                message: 'Your document has been securely stored.',
                type: 'success'
            });

            loadDocuments(); // Refresh list
        } catch (error) {
            console.error('Upload error:', error);
            addNotification({
                title: 'Upload Failed',
                message: 'Could not upload your document',
                type: 'error'
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <FileText className="h-6 w-6 text-blue-600 mr-2" />
                    Health Locker
                </h2>
                <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center">
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Upload Record</span>
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileUpload}
                        accept=".pdf,.jpg,.jpeg,.png"
                        disabled={uploading}
                    />
                </label>
            </div>

            {uploading && (
                <div className="mb-4 p-4 bg-blue-50 text-blue-700 rounded-lg flex items-center">
                    <Loader className="animate-spin h-5 w-5 mr-3" />
                    Uploading your file...
                </div>
            )}

            <div className="space-y-3">
                {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">{doc.name}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(doc.uploadedAt).toLocaleDateString()} • {(doc.size / 1024).toFixed(1)} KB
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-blue-600">
                                <Eye className="h-4 w-4" />
                            </a>
                            <button className="p-2 text-gray-400 hover:text-red-600">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}

                {documents.length === 0 && !isLoading && (
                    <div className="text-center py-8 text-gray-500">
                        No documents uploaded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default HealthLocker;