/*import SigninForm2 from "@/components/SigninForm2";

export default function SignInPage() {
  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">
          <SigninForm2 />
        </div>
      </div>
  )
}

*/

/*import SigninForm from "@/app/(auth)/sign-in/SignInForm";

export default function SigninPage() {
    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Sign In</h1>
            <SigninForm />
        </main>
    );
}
*/

"use client";

import { useAuth } from "@/context/AuthContext";
import SignInForm from "./SignInForm";
import {useRouter} from "next/navigation";

export default function SignInPage() {
    const { loginUser } = useAuth();

    const router = useRouter(); // Next.js router for redirection

    const handleLogin = async (email: string, password: string) => {
        try {
            await loginUser(email, password); // Perform login
            router.push("/"); // Redirect to dashboard at "/"
        } catch (error) {
            console.error("Failed to login:", error);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md">
                <h1 className="text-2xl font-bold mb-4">Sign In</h1>
                <SignInForm onSubmit={loginUser} />
            </div>
        </div>
    );
}
