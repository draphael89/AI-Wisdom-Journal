import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">404 - Page Not Found</h1>
        <p className="mb-4 text-gray-600 dark:text-gray-400">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
          Go back to home
        </Link>
      </div>
    </div>
  );
}