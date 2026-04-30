"use client";

import { AttendanceRequest } from '../types/attendanceTypes';

interface AttendanceRequestsProps {
    requests: AttendanceRequest[];
}

export const AttendanceRequests = ({ requests }: AttendanceRequestsProps) => {
    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Attendance Requests</h3>
            </div>

            {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 mt-4 rounded-xl border border-dashed border-gray-600 bg-opacity-20 bg-gray-800">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>No requests found</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                                <th className="py-4 px-4 font-semibold text-xs tracking-wider uppercase">Type</th>
                                <th className="py-4 px-4 font-semibold text-xs tracking-wider uppercase">Date</th>
                                <th className="py-4 px-4 font-semibold text-xs tracking-wider uppercase">Reason</th>
                                <th className="py-4 px-4 font-semibold text-xs tracking-wider uppercase text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} className="transition-colors hover:bg-white/5" style={{ borderBottom: '1px solid var(--card-border)' }}>
                                    <td className="py-4 px-4 text-sm font-medium capitalize" style={{ color: 'var(--text-color)' }}>{req.type.replace(/-/g, ' ')}</td>
                                    <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>
                                        {new Date(req.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="py-4 px-4 text-sm" style={{ color: 'var(--text-muted)' }}>{req.reason}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full capitalize" style={{
                                            backgroundColor: req.status === 'approved' ? 'rgba(34,197,94,0.1)' : req.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(234,179,8,0.1)',
                                            color: req.status === 'approved' ? '#22c55e' : req.status === 'rejected' ? '#ef4444' : '#eab308'
                                        }}>
                                            {req.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};
