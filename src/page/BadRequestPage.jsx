import { Link } from 'react-router';

export default function BadRequestPage() {
  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-gray-100 px-4 py-10 text-center">
      <div className="break-words text-4xl font-bold text-gray-800 sm:text-6xl">Bad Request</div>
      <div className="mt-2 text-base text-gray-600 sm:text-xl">This page isn't working at this moment</div>
      <div className="mt-4">
        <Link to="/" className="text-blue-500 hover:text-blue-700">
          Go back to the homepage
        </Link>
      </div>
    </div>
  );
}
