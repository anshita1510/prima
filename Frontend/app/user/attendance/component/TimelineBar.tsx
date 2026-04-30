interface BackendTimeSlot {
  checkIn: string;
  checkOut?: string;
}

interface TimelineBarProps {
  slots: BackendTimeSlot[];
  className?: string;
}

const timeToPercent = (t: string): number => {
  const d = new Date(t);
  const total = d.getHours() * 60 + d.getMinutes();
  const start = 9 * 60 + 30;
  const end = 18 * 60 + 30;
  return Math.max(0, Math.min(100, ((total - start) / (end - start)) * 100));
};

const formatTime = (t: string) =>
  new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

export const TimelineBar = ({ slots, className }: TimelineBarProps) => {
  if (!slots?.length) {
    return (
      <div className={`h-3 rounded-full ${className || ''}`} style={{ backgroundColor: 'var(--bg-subtle)' }}>
        <div className="text-xs text-center mt-1" style={{ color: 'var(--text-muted)' }}>No entries</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className={`relative h-3 rounded-full overflow-hidden ${className || ''}`}
        style={{ backgroundColor: 'var(--bg-subtle)' }}>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="absolute top-0 w-px h-full opacity-30"
            style={{ left: `${(i / 9) * 100}%`, backgroundColor: 'var(--card-border)' }} />
        ))}
        {slots.map((slot, i) => {
          const start = timeToPercent(slot.checkIn);
          const end = slot.checkOut ? timeToPercent(slot.checkOut) : 100;
          const width = Math.max(2, end - start);
          return (
            <div key={i}
              className={`absolute top-0 h-full transition-all duration-300 ${!slot.checkOut ? 'animate-pulse' : ''}`}
              style={{
                left: `${start}%`, width: `${width}%`,
                backgroundColor: slot.checkOut ? '#14b8a6' : '#22c55e',
              }}
              title={`Session ${i + 1}: ${formatTime(slot.checkIn)} - ${slot.checkOut ? formatTime(slot.checkOut) : 'Active'}`}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
        <span>9:30</span>
        <span>{slots.length} session{slots.length !== 1 ? 's' : ''}</span>
        <span>18:30</span>
      </div>
    </div>
  );
};
