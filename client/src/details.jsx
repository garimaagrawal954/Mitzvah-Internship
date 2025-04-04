import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

function details() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Second Page</h1>
        <p className="text-gray-600 mb-8">
          You've successfully navigated to the second page! Feel free to go back to the home page.
        </p>
        <button
          onClick={() => navigate('/')}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <ArrowLeft size={20} />
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default details;