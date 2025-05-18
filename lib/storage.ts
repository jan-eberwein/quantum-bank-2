import { storage } from "@/lib/appwrite";

const BUCKET_ID = process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID!;

export function getProfileImageUrl(fileId: string): string {
    return storage.getFilePreview(BUCKET_ID, fileId);
}
