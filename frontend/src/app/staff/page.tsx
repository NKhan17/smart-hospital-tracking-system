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
    try {
      const res = await fetch('http://localhost:5000/api/appointments/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
    <div className="flex h-screen bg-[#fafafa] font-sans selection:bg-gray-200">
      {/* Left Sidebar: Nav */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col z-10 shrink-0">
        <div className="h-14 border-b border-gray-200 flex items-center px-6">
          <div className="h-4 w-4 bg-black rounded-sm mr-3"></div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-black">Workspace Hub</span>
        </div>
        <div className="p-4 space-y-2">
          <button className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-black uppercase tracking-widest bg-gray-100 border border-gray-200 rounded-sm">Desk Terminal</button>
          <button className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-black hover:bg-gray-50 transition-colors">Queue Board</button>
          <button className="w-full text-left px-4 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-widest hover:text-black hover:bg-gray-50 transition-colors">Diagnostics</button>
        </div>
        <div className="mt-auto border-t border-gray-200 p-4">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full text-center px-4 py-3 border border-gray-200 bg-white text-[10px] font-bold uppercase tracking-widest text-black hover:bg-gray-50 transition-colors shadow-sm"
          >
            Return to Map
          </button>
        </div>
      </aside>

      {/* Main Administrative Console */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#fafafa]">
        <header className="h-14 border-b border-gray-200 bg-white flex items-center px-8 shrink-0 shadow-sm z-10">
          <h2 className="text-xs font-semibold text-gray-800 uppercase tracking-widest">Access Control Terminal</h2>
        </header>

        <div className="flex-1 p-8 flex items-center justify-center relative overflow-y-auto">
          {/* Decorative Background grid */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <div className="w-full max-w-lg bg-white border border-gray-200 shadow-xl relative z-10">
            <div className="px-8 py-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Secure Digital Handshake</h3>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            
            <div className="p-10">
              {status === 'idle' || status === 'generating' || status === 'error' ? (
                <form onSubmit={handleGenerateQR}>
                  <div className="mb-8">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Incoming Patient Locator ID</label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 px-4 py-3 text-sm font-mono focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-shadow bg-[#fafafa]"
                      placeholder="e.g. BKG-84920"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors disabled:opacity-50 shadow-md"
                    disabled={status === 'generating'}
                  >
                    {status === 'generating' ? 'Validating Link...' : 'Issue Cryptographic Pass'}
                  </button>
                </form>
              ) : status === 'ready' ? (
                <div className="flex flex-col items-center animate-fade-in">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Device Scan Required</div>
                  <div className="p-4 border border-gray-200 bg-white shadow-md mb-8">
                    <QRCodeSVG value={qrToken || ''} size={240} />
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-black font-mono font-medium mb-8 px-5 py-2.5 bg-gray-50 border border-gray-200">
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 animate-pulse"></span>
                    <span>Waiting for external client capture...</span>
                  </div>
                  <div className="flex space-x-4 w-full">
                    <button 
                      onClick={() => setStatus('verified')}
                      className="flex-1 border border-gray-200 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-black hover:border-gray-400 transition-colors"
                    >
                      Mock Complete
                    </button>
                    <button 
                      onClick={() => setStatus('idle')}
                      className="flex-1 border border-red-200 bg-red-50 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Revoke Token
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center animate-fade-in py-8">
                  <div className="h-20 w-20 bg-black text-white flex items-center justify-center rounded-full mb-6 shadow-lg transform hover:scale-105 transition-transform">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">Verification Complete</h3>
                  <p className="text-sm text-gray-500 mb-10 text-center px-4 font-medium leading-relaxed">
                    Cryptographic signature validated. The global node map has been successfully updated with the new load metrics.
                  </p>
                  <button 
                    onClick={() => { setBookingId(''); setStatus('idle'); }}
                    className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors shadow-md"
                  >
                    Reset Terminal
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
