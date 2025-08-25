import { useState } from "react";
import type { UploadedImage } from "../types/uploadedImage";

export function useCloudinaryUpload() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [progress, setProgress] = useState<number>(0);

    const uploadToCloudinary = (file: File) => {
        return new Promise<string>((resolve, reject) => {
            const url = `https://api.cloudinary.com/v1_1/<your-cloud-name>/upload`;
            const xhr = new XMLHttpRequest();
            const fd = new FormData();

            fd.append("file", file);
            fd.append("upload_preset", "<your-upload-preset>");

            xhr.open("POST", url);

            xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                    const percent = (e.loaded / e.total) * 100;
                    setProgress(percent);
                }
            });

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve(response.secure_url);
                    } else {
                        reject("Upload failed");
                    }
                }
            };

            xhr.send(fd);
        });
    };

    const addImage = async (file: File) => {
        const newImage: UploadedImage = { file, uploading: true };
        setImages((prev) => [...prev, newImage]);

        try {
            const url = await uploadToCloudinary(file);
            setImages((prev) =>
                prev.map((img) =>
                    img.file === file ? { ...img, url, uploading: false } : img
                )
            );
        } catch (err) {
            setImages((prev) =>
                prev.map((img) =>
                    img.file === file ? { ...img, uploading: false, error: String(err) } : img
                )
            );
        }
    };

    const removeImage = (file: File) => {
        setImages((prev) => prev.filter((img) => img.file !== file));
    };

    return { images, progress, addImage, removeImage };
}
