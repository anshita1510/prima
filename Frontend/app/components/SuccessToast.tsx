import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle, X } from 'lucide-react';

interface SuccessToastProps {
    title?: string;
    message: string;
    onClose: () => void;
}

export default function SuccessToast({ title = "Success!", message, onClose }: SuccessToastProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const timer = setTimeout(onClose, 8000); // Auto-dismiss after 8 seconds
        return () => clearTimeout(timer);
    }, [onClose]);

    if (!mounted) return null;

    return createPortal(
        <div
            className="fixed top-6 right-6 z-[9999] flex items-start gap-3 px-5 py-4 rounded-xl shadow-lg border"
            style={{
                backgroundColor: '#f0fdf4',
                borderColor: '#86efac',
                minWidth: '320px',
                maxWidth: '420px',
                animation: 'slideIn 0.3s ease-out',
            }}
        >
            <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>

            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
            <div className="flex-1">
                <p className="font-semibold text-sm" style={{ color: '#15803d' }}>{title}</p>
                <p className="text-sm mt-0.5" style={{ color: '#166534' }}>{message}</p>
            </div>
            <button
                onClick={onClose}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
                style={{ color: '#16a34a' }}
            >
                <X className="w-4 h-4" />
            </button>
        </div>,
        document.body
    );
}
