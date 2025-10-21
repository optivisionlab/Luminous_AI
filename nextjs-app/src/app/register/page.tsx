'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }), // Backend only expects username and password
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        router.push('/login'); // Redirect to login page on successful registration
      } else {
        setMessage(data.detail || 'Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setMessage('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">Đăng ký</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">Tên người dùng</label>
            <input
              type="text"
              id="username"
              name="username"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              placeholder="Nhập tên người dùng của bạn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none"
              placeholder="Nhập mật khẩu của bạn"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {message && (
            <div className={`mb-4 p-3 rounded-md ${message.includes('thành công') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {message}
            </div>
          )}
          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Đăng ký
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Đã có tài khoản? <a href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Đăng nhập</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
