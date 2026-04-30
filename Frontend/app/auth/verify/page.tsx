'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../../../lib/axios';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('Verification token is missing.');
            return;
        }

        const verifyToken = async () => {
            try {
                // Request to the auth route mapped in server.ts -> auth.routes.ts mapping
                const res = await api.post('/api/users/verify', { token });
                setStatus('success');
                setMessage(res.data.message || 'Account verified successfully!');
                setTimeout(() => {
                    router.push('/login');
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.response?.data?.error || 'Invalid or expired verification link.');
            }
        };

        verifyToken();
    }, [token, router]);

    return (
        <div className="flex items-center justify-center min-h-screen background-dark text-white p-4" style={{ backgroundColor: '#0a0a0a' }}>
            <div className="p-8 rounded-2xl shadow-xl max-w-md w-full text-center" style={{ backgroundColor: '#171717', border: '1px solid #262626' }}>
                {status === 'loading' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="animate-spin" style={{ color: '#3b82f6' }} />
                        <h2 className="text-xl font-semibold text-white">Verifying Account</h2>
                        <p style={{ color: '#a3a3a3' }}>{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4">
                        <CheckCircle size={56} style={{ color: '#22c55e' }} />
                        <h2 className="text-2xl font-bold text-white">Verified!</h2>
                        <p style={{ color: '#d4d4d4' }}>{message}</p>
                        <p className="text-sm mt-2" style={{ color: '#737373' }}>Redirecting to login...</p>
                        <button onClick={() => router.push('/login')} className="mt-4 px-6 py-2 rounded-lg font-semibold transition-colors"
                            style={{ backgroundColor: '#2563eb', color: 'white' }}>
                            Go to Login
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4">
                        <XCircle size={56} style={{ color: '#ef4444' }} />
                        <h2 className="text-2xl font-bold text-white">Verification Failed</h2>
                        <p style={{ color: '#d4d4d4' }}>{message}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 rounded-lg font-semibold transition-colors"
                            style={{ backgroundColor: '#3f3f46', color: 'white' }}>
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center"><Loader2 size={40} className="animate-spin text-blue-500" /></div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
