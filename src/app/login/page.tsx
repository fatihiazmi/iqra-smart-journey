'use client'

import { useState } from 'react'
import { login } from './actions'

type Tab = 'teacher' | 'student'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>('teacher')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Selamat Datang
        </h1>

        {/* Tab Toggle */}
        <div className="flex rounded-2xl bg-gray-100 p-1 mb-8" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'teacher'}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'teacher'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('teacher')}
          >
            Guru / Admin
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'student'}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
              activeTab === 'student'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('student')}
          >
            Pelajar
          </button>
        </div>

        {/* Teacher/Admin Login Form */}
        {activeTab === 'teacher' && (
          <form action={login} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mel
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                placeholder="cikgu@sekolah.edu.my"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Kata Laluan
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-lg"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl transition-colors"
            >
              Log Masuk
            </button>
          </form>
        )}

        {/* Student Login Link */}
        {activeTab === 'student' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-lg">
              Pelajar log masuk dengan avatar dan PIN
            </p>
            <a
              href="/login/student"
              className="inline-block w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl transition-colors text-center"
            >
              Log Masuk Pelajar
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
