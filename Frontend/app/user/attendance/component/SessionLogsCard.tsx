"use client";

import { useState } from 'react';
import { attendanceService } from '../../../services/attendanceService';

interface SessionLogsCardProps {
    timeSlots: any[];
}

export const SessionLogsCard = ({ timeSlots }: SessionLogsCardProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 3;

    if (!timeSlots || timeSlots.length === 0) {
        return null;
    }

    const totalPages = Math.ceil(timeSlots.length / itemsPerPage);
    const paginatedSlots = timeSlots.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="rounded-xl overflow-hidden"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
            <div className="p-4 sm:p-5 flex items-center justify-between border-b" style={{ borderColor: 'var(--card-border)' }}>
                <h2 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-color)' }}>Session Records</h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md" style={{ backgroundColor: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                    {timeSlots.length} Total
                </span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
                            <th className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">Name</th>
                            <th className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">In</th>
                            <th className="py-3 px-4 font-semibold text-xs tracking-wider uppercase">Out</th>
                            <th className="py-3 px-4 font-semibold text-xs tracking-wider uppercase text-right">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSlots.map((slot: any, i: number) => {
                            const actualIndex = (currentPage - 1) * itemsPerPage + i;
                            const duration = slot.checkOut
                                ? attendanceService.calculateWorkingHours(slot.checkIn, slot.checkOut)
                                : attendanceService.calculateCurrentSessionTime([slot]) / 60;

                            return (
                                <tr key={actualIndex} className="transition-colors hover:bg-white/[0.02]" style={{ borderBottom: '1px solid var(--card-border)' }}>
                                    <td className="py-3 px-4 text-xs font-semibold" style={{ color: 'var(--text-color)' }}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: slot.checkOut ? 'var(--text-muted)' : '#22c55e', boxShadow: slot.checkOut ? 'none' : '0 0 6px #22c55e' }}></div>
                                            Session {actualIndex + 1}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                        {new Date(slot.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="py-3 px-4 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                        {slot.checkOut ? new Date(slot.checkOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-xs font-bold tracking-tight" style={{ color: slot.checkOut ? 'var(--text-color)' : '#22c55e' }}>
                                                {attendanceService.formatWorkingHours(duration)}
                                            </span>
                                            {slot.checkOut ? (
                                                <span className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Finished</span>
                                            ) : (
                                                <span className="text-[9px] uppercase tracking-wider font-semibold animate-pulse" style={{ color: '#22c55e' }}>Active</span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between p-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
                        style={{
                            backgroundColor: currentPage === 1 ? 'transparent' : 'var(--card-border)',
                            color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-color)',
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        Prev
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded transition-colors"
                        style={{
                            backgroundColor: currentPage === totalPages ? 'transparent' : 'var(--card-border)',
                            color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-color)',
                            opacity: currentPage === totalPages ? 0.5 : 1
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};
