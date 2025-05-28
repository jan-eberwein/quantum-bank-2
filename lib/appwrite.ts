// lib/appwrite.ts
import { Client, Account, Databases, Storage, ID as AppwriteID } from "appwrite";

//
// —–– 1) initialize the client
//
const client = new Client();
if (typeof window !== "undefined") {
  client
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);
}

//
// —–– 2) export the Appwrite services
//
export const account  = new Account(client);
export const database = new Databases(client);
export const storage  = new Storage(client);

//
// —–– 3) pull in the Appwrite ID helper
//
export const ID = AppwriteID;

//
// —–– 4) map your .env.local var
//        (NEXT_PUBLIC_APPWRITE_STORAGE_ID) → BUCKET_ID
//
export const BUCKET_ID = process.env
    .NEXT_PUBLIC_APPWRITE_STORAGE_ID!;  // ← non-nullable assertion, will throw at build time if missing

export default client;
