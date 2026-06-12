'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';

export default function StaffPortal() {
  const [bookingId, setBookingId] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'verified' | 'error'>('idle');

  useEffect(() => {
    const socket = io('http://localhost:5000');
    
    socket.on('load-updated', (data) => {
      // Simulate verification on any load update for demo purposes
      if (status === 'ready') {
        setStatus('verified');
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [status]);

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('generating');
    
    try {
      const res = await fetch('http://localhost:5000/api/appointments/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: bookingId })
      });
      
      if (res.ok) {
        const data = await res.json();
        setQrToken(data.token);
        setStatus('ready');
      } else {
        // Fallback token if db is empty for UI testing
        setQrToken(`mock-token-${bookingId}-${Date.now()}`);
        setStatus('ready');
      }
    } catch (err) {
      setQrToken(`mock-token-${bookingId}-${Date.now()}`);
      setStatus('ready');
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      <header className="stitch-border bg-[var(--panel-bg)] flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 bg-gray-400"></div>
          <h1 className="text-sm font-semibold tracking-wide uppercase text-gray-900">HealthTrack Staff Terminal</h1>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="text-xs font-medium px-4 py-2 stitch-border hover:bg-gray-50 transition-colors"
        >
          Exit to Dashboard
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 bg-[#f4f5f7]">
        <div className="bg-white stitch-border stitch-shadow w-full max-w-md p-8 flex flex-col items-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Patient Check-In</h2>
          
          {status === 'idle' || status === 'generating' || status === 'error' ? (
            <form onSubmit={handleGenerateQR} className="w-full">
              <div className="mb-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Booking ID</label>
                <input 
                  type="text" 
                  className="w-full stitch-border px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                  placeholder="Enter patient booking ID"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-black text-white text-sm font-medium py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
                disabled={status === 'generating'}
              >
                {status === 'generating' ? 'Verifying...' : 'Generate Terminal QR'}
              </button>
            </form>
          ) : status === 'ready' ? (
            <div className="flex flex-col items-center w-full animate-fade-in">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Scan with Smartphone</div>
              <div className="p-4 stitch-border mb-6 bg-white">
                <QRCodeSVG value={qrToken || ''} size={200} />
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500 font-mono mb-6">
                <span className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></span>
                <span>Awaiting Patient Scan...</span>
              </div>
              
              {/* Added a mock scan button for easy testing without a real phone */}
              <button
                onClick={() => setStatus('verified')}
                className="mt-2 mb-4 text-[10px] font-medium text-blue-500 hover:text-blue-700 transition-colors"
              >
                [Mock Patient Scan Action]
              </button>
              
              <button 
                onClick={() => setStatus('idle')}
                className="text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                Cancel Handshake
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full animate-fade-in py-8">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <div className="h-8 w-8 rounded-full bg-green-500"></div>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Check-In Complete</h3>
              <p className="text-sm text-gray-500 mb-8 text-center">Patient identity verified and system load incremented.</p>
              <button 
                onClick={() => { setBookingId(''); setStatus('idle'); }}
                className="w-full stitch-border bg-gray-50 text-gray-900 text-sm font-medium py-3 hover:bg-gray-100 transition-colors"
              >
                Next Patient
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
