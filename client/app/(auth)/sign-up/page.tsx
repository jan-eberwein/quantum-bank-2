/*import SignupForm2 from '@/components/SignupForm2'

export default function SignUpPage() {
  return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md">
          <SignupForm2 />
        </div>
      </div>
  )
}
*/
import SignupForm from "./SignupForm";

export default function SignupPage() {
    return (
        <main className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
            <SignupForm />
        </main>
    );
}

