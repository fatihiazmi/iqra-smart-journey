'use client'

import { useState } from 'react'
import { login } from './actions'

type Tab = 'teacher' | 'student'

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<Tab>('teacher')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6 drop-shadow-sm">
          Selamat Datang
        </h1>

        {/* Tab Toggle */}
        <div className="flex rounded-2xl bg-gray-100 p-1 mb-8" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'teacher'}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all min-h-[44px] ${
              activeTab === 'teacher'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('teacher')}
          >
            Guru / Admin
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'student'}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all min-h-[44px] ${
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base bg-white"
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-base bg-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 min-h-[44px] bg-blue-500 hover:bg-blue-600 hover:scale-105 active:scale-95 text-white text-lg font-bold rounded-xl shadow-md transition-all"
            >
              Log Masuk
            </button>
          </form>
        )}

        {/* Student Login Link */}
        {activeTab === 'student' && (
          <div className="text-center space-y-4">
            <p className="text-gray-600 text-base">
              Pelajar log masuk dengan avatar dan PIN
            </p>
            <a
              href="/login/student"
              className="inline-block flex items-center justify-center w-full min-h-[64px] bg-purple-600 hover:bg-purple-700 hover:scale-105 active:scale-95 text-white text-2xl font-extrabold rounded-2xl shadow-lg transition-all text-center"
            >
              Log Masuk Pelajar
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
