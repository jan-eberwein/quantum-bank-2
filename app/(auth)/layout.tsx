// app/(auth)/layout.tsx
export default function AuthLayout({
                                     children,
                                   }: Readonly<{ children: React.ReactNode }>) {
  return (
      <main className="flex items-center justify-center w-full min-h-screen px-6 bg-gray-50">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
  );
}