"use client"
import React, { useState, useMemo } from 'react';
import { Clock, CheckCircle, PieChart, PlusCircle, History } from 'lucide-react';

const App = () => {
  // ------------------ STATE ------------------
  const [leaveHistory, setLeaveHistory] = useState([
    { id: 1, type: 'Sick Leave', start: '2024-03-10', end: '2024-03-12', days: 2, status: 'Approved' },
    { id: 2, type: 'Casual Leave', start: '2024-04-05', end: '2024-04-05', days: 1, status: 'Pending' },
  ]);

  const [reason, setReason] = useState('');

  const totalAllowance = 24;

  // ------------------ STATS ------------------
  const stats = useMemo(() => {
    const approved = leaveHistory
      .filter(item => item.status === 'Approved')
      .reduce((total, item) => total + item.days, 0);

    const pending = leaveHistory
      .filter(item => item.status === 'Pending')
      .reduce((total, item) => total + item.days, 0);

    return {
      total: totalAllowance,
      used: approved,
      pending: pending,
      remaining: totalAllowance - approved,
    };
  }, [leaveHistory]);

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
        <p className="text-slate-500 mb-8">Simple UI to track and apply leaves</p>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow">
            <PieChart className="text-emerald-600 mb-2" />
            <p className="text-sm text-slate-500">Remaining</p>
            <p className="text-xl font-bold">{stats.remaining} / {stats.total}</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <Clock className="text-amber-600 mb-2" />
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-xl font-bold">{stats.pending} Days</p>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <CheckCircle className="text-emerald-600 mb-2" />
            <p className="text-sm text-slate-500">Approved</p>
            <p className="text-xl font-bold">{stats.used} Days</p>
          </div>
        </div>

        {/* APPLY LEAVE */}
        <div className="bg-white p-6 rounded-xl shadow mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <PlusCircle /> Apply Leave
          </h2>

          <form className="space-y-4">
            <select className="w-full border p-2 rounded">
              <option>Sick Leave</option>
              <option>Casual Leave</option>
              <option>Earned Leave</option>
            </select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input type="date" className="border p-2 rounded" />
              <input type="date" className="border p-2 rounded" />
            </div>

            <textarea
              placeholder="Reason for leave"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border p-2 rounded"
              rows={3}
            />

            <button className="w-full bg-emerald-600 text-white py-2 rounded font-semibold">
              Submit
            </button>
          </form>
        </div>

        {/* HISTORY */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <div className="p-4 border-b flex items-center gap-2">
            <History /> <h2 className="font-semibold">Leave History</h2>
          </div>

          <table className="w-full text-left">
            <thead className="bg-slate-100 text-sm">
              <tr>
                <th className="p-3">Type</th>
                <th className="p-3">Days</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {leaveHistory.map(item => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.type}</td>
                  <td className="p-3">{item.days}</td>
                  <td className="p-3">{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
};

export default App;
