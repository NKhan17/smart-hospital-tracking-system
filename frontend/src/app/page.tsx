'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const initialFacilities = [
  { id: '1', name: 'Central City Hospital', type: 'Human', load: 30, estWait: '14 Mins', pos: { top: '25%', left: '30%' } },
  { id: '2', name: 'Bengaluru Vet Clinic', type: 'Pet', load: 85, estWait: '45 Mins', pos: { top: '45%', left: '55%' } },
  { id: '3', name: 'Northside Medical', type: 'Human', load: 95, estWait: '90 Mins', pos: { top: '15%', left: '65%' } },
  { id: '4', name: 'Apollo Animal Health', type: 'Pet', load: 10, estWait: '5 Mins', pos: { top: '65%', left: '20%' } },
  { id: '5', name: 'South End Emergency', type: 'Human', load: 60, estWait: '35 Mins', pos: { top: '75%', left: '50%' } },
];

export default function Home() {
  const [filter, setFilter] = useState('All');
  const [facilities, setFacilities] = useState(initialFacilities);

  useEffect(() => {
    const socket = io('http://localhost:5000');

    socket.on('load-updated', (data) => {
      console.log('Real-time load update received:', data);
      setFacilities(prev => prev.map(f => {
        // Since we are mocking IDs in frontend (1,2,3,4,5) and backend returns Mongo ObjectIDs,
        // For demonstration, we'll just increment a random facility's load, or if IDs match, update it.
        // We will mock it by updating 'Central City Hospital' (id '1') for the demo if ID doesn't match perfectly.
        if (f.id === data.facilityId || data.facilityId) {
          // If we want to simulate visually for the demo:
          // Just randomly pick one to increase its load if actual DB IDs aren't hooked up to this mock list
          const targetId = ['1','2','3','4','5'][Math.floor(Math.random() * 5)];
          if (f.id === targetId) {
            return { ...f, load: Math.min(f.load + 10, 100) }; // Increase by 10% for visual effect
          }
        }
        return f;
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getLoadColor = (load: number) => {
    if (load > 80) return 'bg-red-500';
    if (load > 50) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const filteredFacilities = facilities.filter(f => filter === 'All' || f.type === filter);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--background)]">
      {/* Top Navbar */}
      <header className="stitch-border bg-[var(--panel-bg)] flex items-center justify-between px-6 py-4 z-20 relative">
        <div className="flex items-center space-x-4">
          <div className="h-4 w-4 bg-black"></div>
          <h1 className="text-sm font-semibold tracking-wide uppercase text-gray-900">HealthTrack</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => window.location.href = '/staff'}
            className="text-xs font-medium px-4 py-2 stitch-border hover:bg-gray-50 transition-colors"
          >
            Staff Portal
          </button>
          <button className="text-xs font-medium px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors">
            Book Appointment
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <aside className="w-80 stitch-border border-t-0 border-b-0 bg-[var(--panel-bg)] flex flex-col z-10 shadow-xl shadow-black/5 relative">
          <div className="p-6 stitch-border border-x-0 border-t-0">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">View Filters</h2>
            <div className="flex flex-col space-y-2">
              {['All', 'Human', 'Pet'].map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-left px-3 py-2 text-xs transition-colors stitch-border ${filter === type ? 'bg-gray-100 font-semibold text-black' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {type === 'All' ? 'Global Directory' : type === 'Human' ? 'Human Emergency Hospitals' : 'Veterinary Clinics'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Facility Directory</h2>
            <div className="space-y-4">
              {filteredFacilities.map(f => (
                <div key={f.id} className="stitch-border p-4 hover:border-gray-400 transition-colors bg-white cursor-pointer group">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight group-hover:text-black">{f.name}</h3>
                    <span className={`h-2 w-2 shrink-0 rounded-full ${getLoadColor(f.load)} mt-1 transition-colors duration-500`}></span>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                      {f.type === 'Human' ? 'Human Care' : 'Vet Clinic'}
                    </div>
                    <div className="text-[10px] font-mono text-gray-900 bg-gray-100 px-2 py-1 rounded-sm stitch-border">
                      Wait: {f.estWait}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Canvas / Map View */}
        <main className="flex-1 relative bg-[#f4f5f7] overflow-hidden">
          {/* Decorative Map Grid */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
          
          <div className="relative w-full h-full p-12">
            {filteredFacilities.map((f) => (
              <div 
                key={f.id} 
                className="absolute map-node flex items-center justify-center group cursor-pointer"
                style={{ top: f.pos.top, left: f.pos.left }}
              >
                <div className="relative flex flex-col items-center">
                  <div className={`h-5 w-5 rounded-full border-4 border-white stitch-shadow z-10 ${getLoadColor(f.load)} group-hover:scale-110 transition-all duration-500`}></div>
                  <div className="absolute top-6 mt-1 px-3 py-1.5 bg-white stitch-border stitch-shadow text-[10px] font-bold uppercase tracking-wide text-gray-900 z-20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {f.name} &middot; {f.estWait}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-6 right-6 px-4 py-2 bg-white stitch-border text-[10px] text-gray-500 font-mono flex items-center space-x-2">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
            <span>Live System: Node BLR-01</span>
          </div>
        </main>
      </div>
    </div>
  );
}
