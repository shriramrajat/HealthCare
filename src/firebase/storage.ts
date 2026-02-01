import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
    listAll
} from 'firebase/storage';
import { storage } from './config';

export interface StorageUploadResult {
    url: string;
    path: string;
}

export const storageService = {
    /**
     * Upload a file to Firebase Storage
     * @param file The file object to upload
     * @param path The path in storage where the file should be saved (e.g., 'users/userId/avatar.jpg')
     * @returns Promise resolving to the download URL
     */
    async uploadFile(file: File, path: string): Promise<string> {
        try {
            const storageRef = ref(storage, path);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    /**
     * Upload a profile picture specifically
     * @param userId The user's ID
     * @param file The image file
     * @returns Promise resolving to the download URL
     */
    async uploadProfilePicture(userId: string, file: File): Promise<string> {
        const extension = file.name.split('.').pop() || 'jpg';
        const path = `users/${userId}/profile.${extension}`;
        return this.uploadFile(file, path);
    },

    /**
     * Upload a medical record document
     * @param userId The user's ID
     * @param file The document file
     * @returns Promise resolving to the download URL
     */
    async uploadMedicalRecord(userId: string, file: File): Promise<string> {
        const timestamp = Date.now();
        const path = `medical-records/${userId}/${timestamp}_${file.name}`;
        return this.uploadFile(file, path);
    },

    /**
     * Delete a file from storage
     * @param path The full path of the file to delete
     */
    async deleteFile(path: string): Promise<void> {
        try {
            const storageRef = ref(storage, path);
            await deleteObject(storageRef);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    },

    /**
     * Get the download URL for a given path
     * @param path The storage path
     */
    async getFileUrl(path: string): Promise<string> {
        try {
            const storageRef = ref(storage, path);
            return await getDownloadURL(storageRef);
        } catch (error) {
            console.error('Error getting file URL:', error);
            throw error;
        }
    }
};
