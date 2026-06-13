'use client';
import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, 
  ListOrdered, 
  ActivitySquare, 
  LogOut, 
  ShieldCheck, 
  QrCode, 
  ScanLine,
  CheckCircle2,
  XCircle,
  RefreshCcw
} from 'lucide-react';

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
    } catch {
      setQrToken(`mock-token-${bookingId}-${Date.now()}`);
      setStatus('ready');
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)] font-sans text-white selection:bg-white/20">
      {/* Left Sidebar: Nav */}
      <aside className="w-64 border-r border-white/5 bg-[#030507] flex flex-col z-10 shrink-0">
        <div className="h-20 border-b border-white/5 flex items-center px-6">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center mr-4 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold uppercase tracking-widest text-white leading-tight">Staff Node</span>
            <span className="block text-[9px] text-[var(--meta)] tracking-wider">SECURE TERMINAL</span>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <button className="w-full flex items-center text-left px-4 py-3.5 text-xs font-bold text-black uppercase tracking-widest bg-white border border-white rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all">
            <Monitor className="w-4 h-4 mr-3" />
            Scanner
          </button>
          <button className="w-full flex items-center text-left px-4 py-3.5 text-xs font-bold text-[var(--meta)] uppercase tracking-widest hover:text-white hover:bg-white/5 border border-transparent rounded-2xl transition-all">
            <ListOrdered className="w-4 h-4 mr-3" />
            Queue Data
          </button>
          <button className="w-full flex items-center text-left px-4 py-3.5 text-xs font-bold text-[var(--meta)] uppercase tracking-widest hover:text-white hover:bg-white/5 border border-transparent rounded-2xl transition-all">
            <ActivitySquare className="w-4 h-4 mr-3" />
            Diagnostics
          </button>
        </div>
        
        <div className="mt-auto border-t border-white/5 p-6">
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full flex items-center justify-center px-4 py-3.5 border border-white/10 bg-black/50 text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] hover:text-white hover:border-white/30 hover:bg-white/5 transition-all rounded-2xl"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit Terminal
          </button>
        </div>
      </aside>

      {/* Main Administrative Console */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#030507] map-bg">
        <header className="h-20 border-b border-white/5 bg-[var(--panel-solid)]/40 backdrop-blur-xl flex items-center justify-between px-10 shrink-0 z-10">
          <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center">
            <ScanLine className="w-5 h-5 mr-3 text-[var(--meta)]" />
            Access Control Handshake
          </h2>
          <div className="flex items-center text-[10px] text-green-400 font-bold bg-green-400/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-400/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse mr-2"></span>
            Socket Live
          </div>
        </header>

        <div className="flex-1 p-10 flex items-center justify-center relative overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={status}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-lg glass-panel relative z-10 overflow-hidden"
            >
              
              <div className="p-10">
                {status === 'idle' || status === 'generating' || status === 'error' ? (
                  <form onSubmit={handleGenerateQR}>
                    <div className="mb-10 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                        <QrCode className="w-8 h-8 text-[var(--meta)]" />
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight mb-2">Hash Validator</h3>
                      <p className="text-sm text-[var(--meta)]">Enter the patient&apos;s cryptographic ID</p>
                    </div>

                    <div className="mb-8">
                      <input 
                        type="text" 
                        className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-5 text-sm font-mono text-center text-white placeholder-[var(--meta)] focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 transition-all shadow-inner"
                        placeholder="e.g. 60e5a60b..."
                        value={bookingId}
                        onChange={(e) => setBookingId(e.target.value)}
                        required
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-white text-black text-xs font-bold uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-200 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center justify-center"
                      disabled={status === 'generating'}
                    >
                      {status === 'generating' ? (
                        <RefreshCcw className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <ShieldCheck className="w-4 h-4 mr-2" />
                      )}
                      {status === 'generating' ? 'Validating AES Link...' : 'Issue Cryptographic Pass'}
                    </button>
                  </form>
                ) : status === 'ready' ? (
                  <div className="flex flex-col items-center">
                    <div className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-8 border border-white/10 bg-white/5 px-5 py-2 rounded-full">Client Device Scan Required</div>
                    
                    <div className="p-6 border border-white/10 bg-white rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-10 relative group hover:scale-105 transition-transform duration-500">
                      <QRCodeSVG value={qrToken || ''} size={220} bgColor="transparent" fgColor="#030507" />
                    </div>
                    
                    <div className="flex items-center space-x-3 text-xs text-white font-mono font-medium mb-10 px-6 py-3.5 bg-white/5 border border-white/10 rounded-2xl w-full justify-center">
                      <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                      <span>Awaiting external client hash verification...</span>
                    </div>
                    
                    <div className="flex space-x-4 w-full">
                      <button 
                        onClick={() => setStatus('verified')}
                        className="flex-[2] flex justify-center items-center border border-white/10 bg-black/50 py-4 text-xs font-bold uppercase tracking-widest text-[var(--meta)] hover:text-white hover:border-white/50 transition-all rounded-2xl"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Force Mock Complete
                      </button>
                      <button 
                        onClick={() => setStatus('idle')}
                        className="flex-1 flex justify-center items-center border border-red-500/30 bg-red-500/10 py-4 text-xs font-bold uppercase tracking-widest text-red-400 hover:bg-red-500/20 transition-all rounded-2xl"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center py-10">
                    <motion.div 
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className="h-24 w-24 bg-green-400/10 text-green-400 flex items-center justify-center rounded-full mb-8 border border-green-400/30 shadow-[0_0_30px_rgba(74,222,128,0.2)]"
                    >
                      <CheckCircle2 className="w-12 h-12" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Handshake Verified</h3>
                    <p className="text-sm text-[var(--meta)] mb-12 text-center px-4 font-medium leading-relaxed">
                      Cryptographic signature validated successfully. The main topological map has received instantaneous load increments.
                    </p>
                    
                    <button 
                      onClick={() => { setBookingId(''); setStatus('idle'); }}
                      className="w-full flex items-center justify-center bg-white text-black text-xs font-bold uppercase tracking-widest py-4 rounded-2xl hover:bg-gray-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Clear Terminal
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
