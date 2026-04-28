"use client";

import { useState, useEffect } from 'react';

type CallLog = {
  _id: string;
  phoneNumber: string;
  agentId: string;
  status: string;
  createdAt: string;
};

export default function Home() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<CallLog[]>([]);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/get-calls');
      const data = await res.json();
      if (res.ok) {
        setHistory(data.calls);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch logs';
      console.error(message);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      await fetchLogs();
    };

    void loadLogs();
  }, []);

  const handleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/trigger-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      });

      if (!res.ok) {
        throw new Error('Failed to trigger call');
      }

      setStatus('success');
      setMessage('Call triggered successfully!');
      await fetchLogs();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setStatus('error');
      setMessage(message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-12 bg-gray-50">
      {/* Trigger Form */}
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border mb-10">
        <h1 className="text-xl font-bold mb-4 text-gray-800">AI Voice Assistant</h1>
        <form onSubmit={handleCall} className="space-y-4">
          <input 
            type="text" 
            placeholder="+919006177968" 
            className="w-full border p-3 rounded-lg text-black focus:ring-2 focus:ring-blue-500 outline-none"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <button 
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {status === 'loading' ? 'Calling...' : 'Call Me Now'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-center font-medium text-green-600">{message}</p>}
      </div>

      {/* History Table */}
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-md border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="font-bold text-gray-700">Recent Call Activity</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-100 text-gray-600 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-3">Phone Number</th>
              <th className="px-6 py-3">Agent ID</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {history.map((call) => (
              <tr key={call._id} className="text-sm text-gray-700">
                <td className="px-6 py-4 font-medium">{call.phoneNumber}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{call.agentId}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold">
                    {call.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">
                  {new Date(call.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}