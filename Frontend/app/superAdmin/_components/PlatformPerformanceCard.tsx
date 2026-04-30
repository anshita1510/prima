"use client";
import { useState, useEffect } from 'react';
import { AreaChart, Area, YAxis, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Info } from 'lucide-react';

type TimeFrame = 'weekly' | 'monthly' | 'yearly';

export default function PlatformPerformanceCard({ performanceData }: { performanceData?: any }) {
    const [timeframe, setTimeframe] = useState<TimeFrame>('monthly');
    const [count, setCount] = useState(0);

    const currentData = performanceData ? performanceData[timeframe] : null;

    useEffect(() => {
        if (!currentData) return;
        let startTime: number;
        const duration = 1500;
        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(easeProgress * currentData.target));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [currentData?.target, timeframe]);

    // custom tooltip for Recharts
    const customTooltipStyle = {
        backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '8px', color: 'var(--text-color)', fontSize: '12px', padding: '6px 10px',
        boxShadow: 'var(--shadow-sm)'
    };

    return (
        <div
            className="relative p-5 rounded-2xl transition-all duration-300 group overflow-visible col-span-1 sm:col-span-2"
            style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--shadow-sm)'
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(34,197,94,0.1)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,197,94,0.4)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)';
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--card-border)';
            }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl pointer-events-none"
                style={{ background: `linear-gradient(145deg, transparent 40%, #22c55e 100%)` }} />

            <div className="flex flex-col h-full gap-4 relative z-10">

                {/* Top Header Row with Title and Timeframe Toggle */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Business Growth</span>
                        <div className="relative group/tooltip cursor-help">
                            <Info size={14} style={{ color: 'var(--text-muted)' }} />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2.5 py-1.5 rounded-lg text-xs opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all pointer-events-none shadow-lg"
                                style={{ backgroundColor: 'var(--text-color)', color: 'var(--bg-color)', zIndex: 50 }}>
                                Monthly Recurring Revenue (MRR)
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{ borderTopColor: 'var(--text-color)' }} />
                            </div>
                        </div>
                    </div>

                    {/* Timeframe Toggle Buttons */}
                    <div className="flex items-center p-1 rounded-lg border" style={{ backgroundColor: 'var(--bg-color)', borderColor: 'var(--card-border)' }}>
                        <button onClick={() => setTimeframe('weekly')} className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${timeframe === 'weekly' ? 'bg-[#22c55e] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}>Weekly</button>
                        <button onClick={() => setTimeframe('monthly')} className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${timeframe === 'monthly' ? 'bg-[#22c55e] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}>Monthly</button>
                        <button onClick={() => setTimeframe('yearly')} className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${timeframe === 'yearly' ? 'bg-[#22c55e] text-white shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-color)]'}`}>Yearly</button>
                    </div>
                </div>

                {/* Content Row */}
                <div className="flex flex-col sm:flex-row gap-6 lg:gap-12 h-full w-full">

                    {/* Left Text Panel */}
                    <div className="w-fit flex-shrink-0 flex flex-col justify-center">
                        <div>
                            <div className="flex items-end gap-3 text-left">
                                <p className="text-4xl lg:text-5xl font-bold tracking-tight text-[var(--text-color)] tabular-nums">
                                    ${currentData ? count.toLocaleString() : '...'}
                                </p>
                                <div className="flex items-center gap-1 mb-2 px-2 py-1 rounded-md" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
                                    <TrendingUp size={14} color="#22c55e" />
                                    <span className="text-sm font-bold text-[#22c55e]">{currentData ? currentData.trend : '-'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5">
                            <p className="text-sm font-medium text-[#22c55e]">{currentData ? currentData.sub : 'Calculating...'}</p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Stable and consistent upward expansion.</p>
                        </div>
                    </div>

                    {/* Highly Flexible Expanding Graph */}
                    <div className="flex-grow w-full h-48 sm:h-56 min-h-[160px]">
                        <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
                            <AreaChart data={currentData ? currentData.data : []} margin={{ top: 10, right: 18, left: 18, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={1} />
                                    </linearGradient>
                                    <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                                        <stop offset="100%" stopColor="#22c55e" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>

                                {/* Tooltip for hover numbers */}
                                <Tooltip
                                    contentStyle={customTooltipStyle}
                                    formatter={(value: any) => [`$${value?.toLocaleString() || 0}`, 'Revenue']}
                                    labelStyle={{ color: 'var(--text-muted)', marginBottom: '4px' }}
                                    cursor={{ stroke: 'rgba(34,197,94,0.5)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />

                                {/* XAxis for weekly/monthly/yearly labels */}
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                                    dy={5}
                                    minTickGap={5}
                                    interval="preserveStartEnd"
                                />

                                <YAxis hide domain={['dataMin - 500', 'dataMax + 500']} />

                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="url(#sparkGradient)"
                                    fill="url(#fillGradient)"
                                    strokeWidth={3}
                                    dot={{ fill: '#22c55e', strokeWidth: 2, r: 3, stroke: 'var(--card-bg)' }}
                                    activeDot={{ r: 5, fill: '#16a34a', strokeWidth: 0 }}
                                    isAnimationActive={true}
                                    animationDuration={1000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
