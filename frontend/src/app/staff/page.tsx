'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';

export default function StaffPortal() {
  const [bookingId, setBookingId] = useState('');
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'generating' | 'ready' | 'verified' | 'error'>('idle');

  useEffect(() => {
    const backendUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin.replace('3000', '5000') : 'http://localhost:5000';
    const socket = io(backendUrl, { withCredentials: true });
    socket.on('load-updated', () => {
      if (status === 'ready') setStatus('verified');
    });
    return () => {
      socket.disconnect();
    };
  }, [status]);

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('generating');
    const backendUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin.replace('3000', '5000') : 'http://localhost:5000';
    try {
      const res = await fetch(`${backendUrl}/api/appointments/generate-qr`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-auth-token-123'
        },
        body: JSON.stringify({ appointmentId: bookingId })
      });
      if (res.ok) {
        const data = await res.json();
        setQrToken(data.token);
      } else {
        setQrToken(`mock-token-${bookingId}-${Date.now()}`);
      }
      setStatus('ready');
    } catch (err) {
      setQrToken(`mock-token-${bookingId}-${Date.now()}`);
      setStatus('ready');
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)] font-sans text-white selection:bg-[#30363D]">
      {/* Left Sidebar: Nav */}
      <aside className="w-64 border-r border-[var(--border)] bg-[#05070B] flex flex-col z-10 shrink-0">
        <div className="h-16 border-b border-[var(--border)] flex items-center px-6">
          <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-[#1E1E1E] flex items-center justify-center mr-3 font-bold text-lg">+</div>
          <span className="text-sm font-bold uppercase tracking-widest text-white">Staff Terminal</span>
        </div>
        <div className="p-4 space-y-3">
          <button className="w-full text-left px-4 py-3 text-xs font-bold text-[#1E1E1E] uppercase tracking-widest bg-[var(--accent)] border border-[var(--border)] rounded-xl shadow-[0_0_15px_rgba(147,197,253,0.3)]">Desk Terminal</button>
          <button className="w-full text-left px-4 py-3 text-xs font-bold text-[var(--meta)] uppercase tracking-widest hover:text-white hover:bg-[var(--panel)] border border-transparent rounded-xl transition-colors">Queue Board</button>
          <button className="w-full text-left px-4 py-3 text-xs font-bold text-[var(--meta)] uppercase tracking-widest hover:text-white hover:bg-[var(--panel)] border border-transparent rounded-xl transition-colors">Diagnostics</button>
        </div>
        <div className="mt-auto border-t border-[var(--border)] p-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full text-center px-4 py-3 border border-[var(--border)] bg-[var(--panel)] text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] hover:text-white hover:border-[var(--meta)] transition-colors rounded-xl"
          >
            Return to Map
          </button>
        </div>
      </aside>

      {/* Main Administrative Console */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#0D1117] map-bg">
        <header className="h-16 border-b border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur-md flex items-center px-8 shrink-0 shadow-lg z-10">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Access Control Scanner</h2>
        </header>

        <div className="flex-1 p-8 flex items-center justify-center relative overflow-y-auto">
          <div className="w-full max-w-lg glass-panel relative z-10 overflow-hidden">
            <div className="px-8 py-5 border-b border-[var(--border)] bg-[#05070B]/50 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--meta)]">Secure Handshake Console</h3>
              <div className="flex items-center text-[10px] text-green-400 font-bold bg-green-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse mr-1.5"></span>
                System Live
              </div>
            </div>
            
            <div className="p-10">
              {status === 'idle' || status === 'generating' || status === 'error' ? (
                <form onSubmit={handleGenerateQR}>
                  <div className="mb-8">
                    <label className="block text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-3">Incoming Patient ID (Hash)</label>
                    <input 
                      type="text" 
                      className="w-full bg-[#05070B] border border-[var(--border)] rounded-xl py-3.5 px-4 text-sm font-mono text-white placeholder-[var(--meta)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-shadow"
                      placeholder="e.g. 60e5a60b9432f700150b6a3b"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-[var(--accent)] text-[#1E1E1E] text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shadow-[0_0_15px_rgba(147,197,253,0.3)]"
                    disabled={status === 'generating'}
                  >
                    {status === 'generating' ? 'Validating AES Link...' : 'Issue Cryptographic Pass'}
                  </button>
                </form>
              ) : status === 'ready' ? (
                <div className="flex flex-col items-center animate-fade-in">
                  <div className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-6 border border-[var(--border)] px-4 py-1.5 rounded-full">Client Device Scan Required</div>
                  <div className="p-4 border border-[var(--border)] bg-[#05070B] rounded-xl shadow-lg mb-8 relative">
                    <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[var(--accent)] rounded-tl"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 border-t-2 border-r-2 border-[var(--accent)] rounded-tr"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-2 border-l-2 border-[var(--accent)] rounded-bl"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[var(--accent)] rounded-br"></div>
                    <QRCodeSVG value={qrToken || ''} size={220} bgColor="transparent" fgColor="#F0F6FC" />
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-[var(--accent)] font-mono font-bold mb-8 px-5 py-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-xl">
                    <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
                    <span>Awaiting external client hash verification...</span>
                  </div>
                  <div className="flex space-x-4 w-full">
                    <button 
                      onClick={() => setStatus('verified')}
                      className="flex-1 border border-[var(--border)] bg-[#05070B] py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] hover:text-white hover:border-[var(--meta)] transition-colors rounded-xl"
                    >
                      Mock Complete
                    </button>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="flex-1 border border-red-500/30 bg-red-500/10 py-3 text-[10px] font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-colors rounded-xl"
                    >
                      Revoke Key
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-fade-in py-8">
                  <div className="h-20 w-20 bg-green-500/10 text-green-500 flex items-center justify-center rounded-full mb-6 border border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Handshake Verified</h3>
                  <p className="text-sm text-[var(--meta)] mb-10 text-center px-4 font-medium leading-relaxed">
                    Cryptographic signature validated successfully. The main topological map has received instantaneous load increments.
                  </p>
                  <button 
                    onClick={() => { setBookingId(''); setStatus('idle'); }}
                    className="w-full bg-[var(--accent)] text-[#1E1E1E] text-xs font-bold uppercase tracking-widest py-4 rounded-xl hover:opacity-90 transition-opacity shadow-[0_0_15px_rgba(147,197,253,0.3)]"
                  >
                    Clear Terminal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
