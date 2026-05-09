export const STORAGE_KEY = "active-upload-id";

export const setUploadSession = (uploadId: string) => {
    localStorage.setItem(STORAGE_KEY, uploadId);
};

export const getUploadSession = () => {
    return localStorage.getItem(STORAGE_KEY);
};

export const clearUploadSession = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const hasActiveUploadSession = () => {
    return !!localStorage.getItem(STORAGE_KEY);
};