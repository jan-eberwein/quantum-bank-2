import { Client, Account, Databases, Storage, ID as AppwriteID } from "appwrite";

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);

export const account  = new Account(client);
export const database = new Databases(client);
export const storage  = new Storage(client);

export const ID = AppwriteID;

export const BUCKET_ID = process.env
    .NEXT_PUBLIC_APPWRITE_STORAGE_ID!;

export default client;
