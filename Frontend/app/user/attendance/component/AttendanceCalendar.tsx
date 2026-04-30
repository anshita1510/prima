"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AttendanceRecord } from '../types/attendanceTypes';

interface AttendanceCalendarProps {
    records: AttendanceRecord[];
}

export const AttendanceCalendar = ({ records }: AttendanceCalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Group records by date string using local time
    const recordsByDate = records.reduce((acc, record) => {
        const d = new Date(record.date);
        const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        acc[dateStr] = record;
        return acc;
    }, {} as Record<string, AttendanceRecord>);

    const calendarDays = [];

    // Fill empty spaces before the first day
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="p-2 border border-transparent"></div>);
    }

    // Fill the days
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        const record = recordsByDate[dateStr];

        let dotColor = 'transparent';
        let bgColor = 'var(--card-bg)';

        if (record) {
            if (record.status === 'present') {
                dotColor = '#22c55e'; // Green
                bgColor = 'rgba(34,197,94,0.05)';
            } else if (record.status === 'absent') {
                dotColor = '#ef4444'; // Red
                bgColor = 'rgba(239,68,68,0.05)';
            } else if (record.status === 'late') {
                dotColor = '#eab308'; // Yellow
                bgColor = 'rgba(234,179,8,0.05)';
            } else if (record.status === 'half-day') {
                dotColor = '#f97316'; // Orange
                bgColor = 'rgba(249,115,22,0.05)';
            } else if (record.status === 'holiday') {
                dotColor = '#8b5cf6'; // Purple 
                bgColor = 'rgba(139,92,246,0.05)';
            }
        }

        calendarDays.push(
            <div key={day} className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all"
                style={{ backgroundColor: bgColor, border: '1px solid var(--card-border)' }}>
                <span className="text-sm font-medium mb-2" style={{ color: 'var(--text-color)' }}>{day}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColor }}></div>
                {record && record.effectiveHours && record.effectiveHours !== "0h 0m" && (
                    <span className="text-[10px] mt-1 font-medium hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                        {record.effectiveHours}
                    </span>
                )}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold" style={{ color: 'var(--text-color)' }}>Attendance Calendar</h3>
                <div className="flex items-center gap-4 bg-opacity-50 px-4 py-2 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                    <button onClick={prevMonth} className="p-1 rounded-lg transition-colors hover:bg-opacity-50" style={{ color: 'var(--text-muted)' }}>
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-semibold min-w-32 text-center" style={{ color: 'var(--text-color)' }}>
                        {monthNames[month]} {year}
                    </span>
                    <button onClick={nextMonth} className="p-1 rounded-lg transition-colors hover:bg-opacity-50" style={{ color: 'var(--text-muted)' }}>
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4">
                {days.map(day => (
                    <div key={day} className="text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 sm:gap-4">
                {calendarDays}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 p-4 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }}>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#22c55e' }}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Present</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#eab308' }}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Late</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f97316' }}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Half Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Absent</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-color)' }}>Holiday</span>
                </div>
            </div>
        </div>
    );
};
