import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="text-6xl font-bold text-gray-800">404</div>
      <div className="text-xl text-gray-600">Page Not Found</div>
      <div className="mt-4">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Go back to the homepage
        </Link>
      </div>
    </div>
  );
}