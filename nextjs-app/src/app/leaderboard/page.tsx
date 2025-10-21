'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LeaderboardEntry {
  username: string;
  score: number;
  date: string; // Assuming date is a string from the backend
}

const LeaderboardPage = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [username, setUsername] = useState(''); // State to store username

  useEffect(() => {
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/leaderboard');
      const data = await response.json();

      if (response.ok) {
        setLeaderboardData(data);
      } else {
        setError(data.detail || 'Không thể tải bảng xếp hạng.');
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Đã xảy ra lỗi khi tải bảng xếp hạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('username'); // Clear username from local storage
    router.push('/login'); // Redirect to login page
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="absolute right-4 top-4">
        <button
          onClick={handleLogout}
          className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Đăng xuất
        </button>
      </div>
      <div className="absolute left-4 top-4">
        {username && (
          <div className="rounded-lg bg-emerald-100 p-3 shadow-lg">
            <p className="text-xl font-semibold text-emerald-800">Người chơi: {username}</p>
          </div>
        )}
      </div>
      <div className="w-full max-w-4xl rounded-lg bg-white p-10 shadow-md">
        <h1 className="mb-8 text-center text-4xl font-bold text-gray-900">Bảng xếp hạng</h1>

        

        {isLoading && <p className="text-center text-lg text-gray-600">Đang tải bảng xếp hạng...</p>}
        {error && <p className="text-center text-lg text-red-600">Lỗi: {error}</p>}

        {!isLoading && !error && leaderboardData.length > 0 && (
          <div className="overflow-x-auto mb-8">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium uppercase tracking-wider text-gray-500">Hạng</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium uppercase tracking-wider text-gray-500">Tên người dùng</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium uppercase tracking-wider text-gray-500">Điểm</th>
                  <th scope="col" className="px-8 py-4 text-left text-sm font-medium uppercase tracking-wider text-gray-500">Ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {leaderboardData.map((player, index) => (
                  <tr
                    key={player.username}
                    className={`transition-all duration-200 rounded-lg mb-2 border-b-2
                      ${player.username === username
                        ? 'bg-blue-100 border-blue-500 shadow-lg'
                        : 'bg-gray-50 border-gray-300 shadow-sm'}
                      ${index % 2 === 0 ? '' : ''} // Optional: alternating row colors, currently off
                    `}
                  >
                    <td className="whitespace-nowrap px-8 py-5 text-base font-medium text-gray-900">{index + 1}</td>
                    <td className="whitespace-nowrap px-8 py-5 text-base text-gray-700">{player.username}</td>
                    <td className="whitespace-nowrap px-8 py-5 text-base text-gray-700">{player.score}</td>
                    <td className="whitespace-nowrap px-8 py-5 text-base text-gray-700">{new Date(player.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && !error && leaderboardData.length === 0 && (
          <p className="text-center text-lg text-gray-600">Bảng xếp hạng đang trống.</p>
        )}

        <div className="mt-10 flex justify-center space-x-6">
          <button
            onClick={() => router.push('/question')}
            className="rounded-md bg-indigo-600 px-8 py-4 text-lg text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Quay lại chỗ trả lời câu hỏi
          </button>
          
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
