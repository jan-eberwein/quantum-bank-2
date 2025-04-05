// app/(auth)/layout.tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <header className="mb-8">
                <h1 className="text-4xl font-bold">Welcome to Auth</h1>
            </header>
            <main className="w-full max-w-md bg-white p-6 rounded shadow-md">{children}</main>
        </div>
    );
}



/*import { useUserContext } from "@/context/AuthContext";
import { redirect } from 'next/navigation';

export default function AuthLayout({
                                     children,
                                   }: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useUserContext();

  if (isAuthenticated) {
    redirect('/');
  }

  return (
      <section className="flex flex-1 justify-center items-center flex-col py-10">
        {children}
        <img
            src="/assets/images/quantum.jpeg"
            alt="side image"
            className="hidden xl:block h-screen w-1/2 object-cover bg-no-repeat fixed right-0 top-0"
        />
      </section>
  )
}
*/