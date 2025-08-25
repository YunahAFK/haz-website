// src/lib/cloudinary.ts
export const cloudinaryConfig = {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dphrqp6a3',
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || 'haz-image-upload',
    folder: 'lectures',
    maxFileSize: 25, // MB
    allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
};