
import { useState, useEffect } from 'react';

function App() {
  const [health, setHealth] = useState<string>('');

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => setHealth(data.message))
      .catch(err => console.error('Health check failed:', err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your App
        </h1>
        <p className="text-gray-600 mb-2">Server Status: {health || 'Loading...'}</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700">Your full-stack Express + React app is ready!</p>
        </div>
      </div>
    </div>
  );
}

export default App;
