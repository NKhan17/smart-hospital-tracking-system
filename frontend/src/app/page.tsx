'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const initialFacilities = [
  { id: '1', name: 'Atria Health Hub', address: '124 Main Street, Bengaluru', type: 'Human', load: 30, estWait: '12 Mins' },
  { id: '2', name: 'Northside Medical Center', address: '88 Tech Park Road, Bengaluru', type: 'Human', load: 95, estWait: '90 Mins' },
  { id: '3', name: 'South End Emergency', address: '45 Ring Road, Bengaluru', type: 'Human', load: 60, estWait: '35 Mins' },
  { id: '4', name: 'Bengaluru Vet Clinic', address: '99 Pet Avenue, Bengaluru', type: 'Pet', load: 85, estWait: '45 Mins' },
  { id: '5', name: 'Apollo Animal Health', address: '12 Park Square, Bengaluru', type: 'Pet', load: 10, estWait: '5 Mins' },
];

const mockProfiles = {
  human: [
    { id: 'h1', name: 'John Doe', age: 34, bloodGroup: 'O+' },
    { id: 'h2', name: 'Jane Doe', age: 31, bloodGroup: 'A-' }
  ],
  pet: [
    { id: 'p1', name: 'Max', species: 'Dog', breed: 'Golden Retriever', vaccinations: 'Verified' },
    { id: 'p2', name: 'Luna', species: 'Cat', breed: 'Siamese', vaccinations: 'Verified' }
  ]
};

export default function Home() {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [category, setCategory] = useState<'Human' | 'Pet'>('Human');
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>('h1');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [selectedFacilityForAppt, setSelectedFacilityForAppt] = useState<any>(null);
  const [apptStatus, setApptStatus] = useState<'pending' | 'confirmed'>('pending');

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('load-updated', (data) => {
      setFacilities(prev => prev.map(f => {
        if (f.id === data.facilityId || data.facilityId) {
          const targetId = ['1','2','3','4','5'][Math.floor(Math.random() * 5)];
          if (f.id === targetId) {
            return { ...f, load: Math.min(f.load + 5, 100) };
          }
        }
        return f;
      }));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const getStatusDisplay = (load: number) => {
    if (load > 80) return { text: 'CRITICAL INFRASTRUCTURE SURGE', color: 'text-red-500', border: 'border-red-900', bg: 'bg-[#4a0f0f]/20' };
    if (load > 50) return { text: 'MODERATE SURGE', color: 'text-yellow-500', border: 'border-yellow-900', bg: 'bg-[#4a3f0f]/20' };
    return { text: 'LOW LOAD', color: 'text-green-500', border: 'border-green-900', bg: 'bg-[#0f4a2f]/20' };
  };

  const handleCategorySwitch = (cat: 'Human' | 'Pet') => {
    setCategory(cat);
    setSelectedProfileId(cat === 'Human' ? mockProfiles.human[0].id : mockProfiles.pet[0].id);
    setSearchQuery('');
  };

  const filteredFacilities = facilities.filter(f => 
    f.type === category && 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeProfiles = category === 'Human' ? mockProfiles.human : mockProfiles.pet;

  const handleRequestAppt = (f: any) => {
    setSelectedFacilityForAppt(f);
    setApptStatus('pending');
    setShowModal(true);
  };

  const confirmRequest = () => {
    setApptStatus('confirmed');
    setTimeout(() => {
      setShowModal(false);
    }, 3000);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] font-sans text-[var(--title)] selection:bg-[#30363D]">
      
      {/* Top Navbar Header */}
      <header className="absolute top-0 w-full h-14 border-b border-[var(--border)] bg-[var(--background)] flex items-center justify-between px-6 z-30">
        <div className="flex items-center space-x-3">
          <div className="h-4 w-4 bg-[var(--title)] rounded-none"></div>
          <h1 className="text-xs font-bold tracking-widest text-[var(--title)] uppercase">Smart Hospital Tracking and Appointment System</h1>
        </div>
        <button 
          onClick={() => window.location.href = '/staff'}
          className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 stitch-border hover:bg-[var(--panel)] transition-none text-[var(--meta)] hover:text-[var(--title)]"
        >
          Staff Terminal
        </button>
      </header>

      {/* 4-Panel Grid Layout */}
      <div className="flex w-full h-full pt-14">
        
        {/* PANEL 1: Unified Tracking Controller */}
        <aside className="w-72 border-r border-[var(--border)] bg-[var(--background)] flex flex-col shrink-0">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-4">View Controller</h2>
            {/* Segmented Tab Matrix */}
            <div className="flex w-full stitch-border p-1 bg-[var(--panel)]">
              <button
                onClick={() => handleCategorySwitch('Human')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-none ${category === 'Human' ? 'bg-[var(--background)] text-[var(--title)] stitch-border' : 'text-[var(--meta)] hover:text-[var(--title)] border border-transparent'}`}
              >
                [ Human Care ]
              </button>
              <button
                onClick={() => handleCategorySwitch('Pet')}
                className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-widest transition-none ${category === 'Pet' ? 'bg-[var(--background)] text-[var(--title)] stitch-border' : 'text-[var(--meta)] hover:text-[var(--title)] border border-transparent'}`}
              >
                [ Veterinary Care ]
              </button>
            </div>
          </div>
          
          {/* Square Search Bar */}
          <div className="p-6 border-b border-[var(--border)]">
            <label className="block text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-3">Target Zone Lookup</label>
            <input
              type="text"
              placeholder="Search facility..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full stitch-border px-4 py-2.5 text-xs font-mono focus:outline-none focus:border-[var(--title)] bg-[var(--panel)] placeholder-[var(--border)] text-[var(--title)]"
            />
          </div>
        </aside>

        {/* PANEL 2: Polymorphic Patient Sub-Profiles Deck */}
        <aside className="w-80 border-r border-[var(--border)] bg-[var(--background)] flex flex-col shrink-0 overflow-y-auto">
          <div className="p-6 border-b border-[var(--border)] bg-[var(--panel)]">
            <h2 className="text-[10px] font-bold text-[var(--title)] uppercase tracking-widest">Active Identity Tokens</h2>
          </div>
          <div className="p-6 space-y-4">
            {activeProfiles.map((p: any) => {
              const isSelected = selectedProfileId === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`p-4 cursor-pointer transition-none relative ${isSelected ? 'stitch-border border-[var(--title)] bg-[var(--panel)]' : 'stitch-border border-[var(--border)] bg-[var(--background)] hover:border-[var(--meta)]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[var(--title)]' : 'text-[var(--meta)]'}`}>{p.name}</span>
                    {isSelected && <span className="text-[10px] text-[var(--title)] font-mono">[SELECTED]</span>}
                  </div>
                  {category === 'Human' ? (
                    <div className="flex justify-between text-[10px] text-[var(--meta)] border-t border-[var(--border)] pt-3 mt-3">
                      <span>Age: <span className="mono font-bold text-[var(--title)]">{p.age}</span></span>
                      <span>Blood Group: <span className="mono font-bold text-[var(--title)]">{p.bloodGroup}</span></span>
                    </div>
                  ) : (
                    <div className="border-t border-[var(--border)] pt-3 mt-3">
                      <div className="flex justify-between text-[10px] text-[var(--meta)] mb-3">
                        <span>Species: <span className="font-bold text-[var(--title)]">{p.species}</span></span>
                        <span>Breed: <span className="font-bold text-[var(--title)]">{p.breed}</span></span>
                      </div>
                      <div className="inline-block border border-green-800 text-green-500 bg-[#0f4a2f]/20 text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        [ CRYPTOGRAPHIC VACCINATION CHECK VERIFIED ]
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* PANEL 3 & 4 Container */}
        <main className="flex-1 flex overflow-hidden">
          
          {/* PANEL 3: Real-Time Facility Metrics Stream */}
          <div className="flex-[1.5] border-r border-[var(--border)] bg-[var(--panel)] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
              <h2 className="text-[10px] font-bold text-[var(--title)] uppercase tracking-widest">Network Topology Stream</h2>
            </div>
            <div className="p-6 space-y-4">
              {filteredFacilities.length === 0 ? (
                <div className="p-8 stitch-border bg-[var(--background)] text-center text-[10px] text-[var(--meta)] uppercase tracking-widest">
                  Zero active nodes.
                </div>
              ) : (
                filteredFacilities.map(f => (
                  <div key={f.id} className="stitch-border bg-[var(--background)] p-0 flex items-stretch hover:border-[var(--meta)] transition-none h-28">
                    {/* Left: Facility Name and precise municipal location string */}
                    <div className="flex-[1.5] p-5 border-r border-[var(--border)] flex flex-col justify-center">
                      <h3 className="text-sm font-bold text-[var(--title)] mb-1 leading-snug">{f.name}</h3>
                      <p className="text-[10px] text-[var(--meta)] font-mono">{f.address}</p>
                    </div>
                    {/* Center: Occupancy percentage metric */}
                    <div className="flex-1 p-5 border-r border-[var(--border)] flex flex-col justify-center items-end bg-[var(--panel)]">
                       <div className="text-[10px] text-[var(--meta)] uppercase tracking-widest mb-2">Occupancy Vol.</div>
                       <div className="text-xl font-bold mono text-[var(--title)] tracking-tight">{f.load}%</div>
                    </div>
                    {/* Right: Live wait countdown values */}
                    <div className="flex-1 p-5 flex flex-col justify-center items-end bg-[var(--panel)]">
                       <div className="text-[10px] text-[var(--meta)] uppercase tracking-widest mb-2">Queue Estimate</div>
                       <div className="text-xl font-bold mono text-[var(--title)] tracking-tight">{f.estWait}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* PANEL 4: Active Congestion Status Thresholds */}
          <div className="flex-1 bg-[var(--background)] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)] bg-[var(--background)] sticky top-0 z-10">
              <h2 className="text-[10px] font-bold text-[var(--title)] uppercase tracking-widest">Threshold Triggers</h2>
            </div>
            <div className="p-6 space-y-4">
              {filteredFacilities.map(f => {
                const status = getStatusDisplay(f.load);
                return (
                  <div key={f.id} className="stitch-border bg-[var(--panel)] p-5 flex flex-col justify-between h-28">
                    <div className={`inline-block px-2 py-1.5 text-[9px] font-bold uppercase tracking-widest border ${status.border} ${status.color} ${status.bg} w-max mb-3`}>
                      {status.text}
                    </div>
                    <button 
                      onClick={() => handleRequestAppt(f)}
                      className="w-full stitch-border px-3 py-2.5 text-[9px] font-bold uppercase tracking-widest bg-[var(--title)] text-[var(--background)] hover:bg-[var(--meta)] transition-none text-center"
                    >
                      [ Request Appointment Token ]
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </main>
      </div>

      {/* Appointment Confirmation Modal */}
      {showModal && selectedFacilityForAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D1117]/90 backdrop-blur-sm">
          <div className="bg-[var(--panel)] stitch-border w-full max-w-lg shadow-2xl relative">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--background)]">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-[var(--title)]">Cryptographic Sequence</h3>
              {apptStatus === 'pending' && (
                <button onClick={() => setShowModal(false)} className="text-[var(--meta)] hover:text-[var(--title)] font-mono">
                  [X]
                </button>
              )}
            </div>
            {apptStatus === 'pending' ? (
              <div className="p-8">
                <p className="text-[11px] font-mono text-[var(--meta)] leading-relaxed mb-8">
                  Initiating secure token block for <strong className="text-[var(--title)]">{selectedFacilityForAppt.name}</strong>. This payload binds your selected profile identity to the live node array.
                </p>
                <div className="stitch-border p-4 bg-[var(--background)] mb-8 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--meta)]">Bound Identity</span>
                  <span className="text-xs font-bold text-[var(--title)] mono">
                    {category === 'Human' ? mockProfiles.human.find(p=>p.id===selectedProfileId)?.name : mockProfiles.pet.find(p=>p.id===selectedProfileId)?.name}
                  </span>
                </div>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 stitch-border py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] hover:text-[var(--title)] transition-none bg-[var(--background)]"
                  >
                    Abort
                  </button>
                  <button 
                    onClick={confirmRequest}
                    className="flex-[2] stitch-border py-3 text-[10px] font-bold uppercase tracking-widest bg-[var(--title)] text-[var(--background)] hover:bg-[var(--meta)] transition-none"
                  >
                    Confirm Payload
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center bg-[var(--background)]">
                <div className="text-green-500 text-2xl mb-4 font-mono">[ OK ]</div>
                <h3 className="text-sm font-bold text-[var(--title)] mb-2 uppercase tracking-widest">Token Sequence Active</h3>
                <p className="text-[11px] font-mono text-[var(--meta)] text-center mb-8">
                  Provide credentials at terminal.
                </p>
                <div className="w-full h-px bg-[var(--border)] overflow-hidden">
                  <div className="h-full bg-green-500 animate-[progress_3s_linear_forwards]"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}} />
    </div>
  );
}
