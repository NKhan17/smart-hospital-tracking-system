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
    if (load > 80) return { text: '[CRITICAL SATURATION]', color: 'text-red-600', border: 'border-red-600', bg: 'bg-red-50' };
    if (load > 50) return { text: '[MODERATE SURGE]', color: 'text-yellow-600', border: 'border-yellow-600', bg: 'bg-yellow-50' };
    return { text: '[LOW CAPACITY]', color: 'text-green-600', border: 'border-green-600', bg: 'bg-green-50' };
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
    <div className="flex h-screen overflow-hidden bg-[var(--backdrop)] font-sans text-[var(--title)] selection:bg-gray-200">
      
      {/* Left Sidebar Workspace Pane */}
      <aside className="w-80 bg-[var(--background)] stitch-border border-y-0 border-l-0 flex flex-col shrink-0 z-10 relative shadow-sm">
        
        {/* Header Section */}
        <div className="p-6 border-b border-[var(--border)]">
          <h1 className="text-sm font-bold tracking-tight text-[var(--title)] mb-6 leading-snug">
            Smart Hospital Tracking<br/>and Appointment System
          </h1>
          
          {/* Segmented Tab Matrix */}
          <div className="flex w-full stitch-border p-1 bg-[var(--backdrop)]">
            <button
              onClick={() => handleCategorySwitch('Human')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-none ${category === 'Human' ? 'bg-[var(--background)] text-[var(--title)] stitch-border shadow-sm' : 'text-[var(--meta)] hover:text-[var(--title)] border border-transparent'}`}
            >
              [ Human Care ]
            </button>
            <button
              onClick={() => handleCategorySwitch('Pet')}
              className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-none ${category === 'Pet' ? 'bg-[var(--background)] text-[var(--title)] stitch-border shadow-sm' : 'text-[var(--meta)] hover:text-[var(--title)] border border-transparent'}`}
            >
              [ Veterinary Care ]
            </button>
          </div>
        </div>

        {/* Polymorphic Profile Switcher */}
        <div className="p-6 border-b border-[var(--border)] overflow-y-auto min-h-[16rem]">
          <h2 className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-4">Active System Profiles</h2>
          <div className="space-y-3">
            {activeProfiles.map((p: any) => {
              const isSelected = selectedProfileId === p.id;
              return (
                <div 
                  key={p.id}
                  onClick={() => setSelectedProfileId(p.id)}
                  className={`p-4 cursor-pointer transition-none relative group ${isSelected ? 'stitch-border border-[var(--title)] bg-[var(--backdrop)]' : 'stitch-border border-[var(--border)] bg-[var(--background)] hover:border-[var(--meta)]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs font-bold ${isSelected ? 'text-[var(--title)]' : 'text-[var(--meta)] group-hover:text-[var(--title)]'}`}>{p.name}</span>
                    {isSelected && <span className="h-2 w-2 rounded-full bg-[var(--title)]"></span>}
                  </div>
                  {category === 'Human' ? (
                    <div className="flex justify-between text-[10px] text-[var(--meta)] border-t border-[var(--border)] pt-2 mt-2">
                      <span>Age: <span className="mono font-bold text-[var(--title)]">{p.age}</span></span>
                      <span>Blood: <span className="mono font-bold text-[var(--title)]">{p.bloodGroup}</span></span>
                    </div>
                  ) : (
                    <div className="border-t border-[var(--border)] pt-2 mt-2">
                      <div className="flex justify-between text-[10px] text-[var(--meta)] mb-2">
                        <span>Species: <span className="font-bold text-[var(--title)]">{p.species}</span></span>
                        <span>Breed: <span className="font-bold text-[var(--title)]">{p.breed}</span></span>
                      </div>
                      <div className="inline-block border border-green-600 text-green-700 bg-green-50 text-[9px] font-bold uppercase tracking-widest px-2 py-1">
                        Vaccination Status Verified
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Immediate Search/Filter Matrix */}
        <div className="p-6 mt-auto border-t border-[var(--border)] bg-[var(--background)]">
          <label className="block text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-2">Facility Search Hook</label>
          <input
            type="text"
            placeholder="Search by name or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full stitch-border px-3 py-2 text-xs font-mono focus:outline-none focus:border-[var(--title)] focus:ring-1 focus:ring-[var(--title)] bg-[var(--backdrop)] placeholder-[var(--meta)]"
          />
        </div>
      </aside>

      {/* Right Main Stream Viewport Layout */}
      <main className="flex-1 overflow-y-auto relative bg-[var(--backdrop)]">
        {/* Top Action Bar */}
        <div className="sticky top-0 bg-[var(--background)] border-b border-[var(--border)] px-8 py-4 flex justify-between items-center z-10 shadow-sm">
           <h2 className="text-[11px] font-bold text-[var(--meta)] uppercase tracking-widest">Network Facility Grid &middot; Node BLR-01</h2>
           <button 
             onClick={() => window.location.href = '/staff'}
             className="stitch-border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest bg-white text-[var(--title)] hover:bg-[var(--backdrop)] transition-none"
           >
             Terminal Portal Access
           </button>
        </div>

        <div className="p-8 max-w-6xl mx-auto space-y-5 pb-24">
          {filteredFacilities.length === 0 ? (
            <div className="p-12 stitch-border bg-[var(--background)] text-center">
              <span className="text-xs font-bold text-[var(--meta)] uppercase tracking-widest">Zero facilities matching filter criteria</span>
            </div>
          ) : (
            filteredFacilities.map(f => {
              const status = getStatusDisplay(f.load);
              return (
                <div key={f.id} className="stitch-border bg-[var(--background)] p-6 flex items-stretch justify-between hover:border-[var(--meta)] transition-none group shadow-sm">
                  
                  {/* Left Column: Name & Address */}
                  <div className="flex-[1.5] pr-8 border-r border-[var(--border)] flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-[var(--title)] leading-tight mb-2 group-hover:underline underline-offset-4 decoration-[var(--border)]">{f.name}</h3>
                    <p className="text-xs text-[var(--meta)] font-medium">{f.address}</p>
                  </div>
                  
                  {/* Middle Column: Live Congestion Threshold Index */}
                  <div className="flex-1 px-8 border-r border-[var(--border)] flex flex-col justify-center items-start">
                    <div className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-3">Capacity Threshold State</div>
                    <div className={`inline-block px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest border ${status.border} ${status.color} ${status.bg}`}>
                      {status.text}
                    </div>
                  </div>
                  
                  {/* Right Column: Wait Time & Action */}
                  <div className="flex-1 pl-8 flex flex-col justify-between items-end">
                    <div className="text-right mb-6">
                      <div className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-2">Real-Time Queue Wait</div>
                      <div className="text-xl font-bold mono text-[var(--title)] tracking-tight">Est. {f.estWait}</div>
                    </div>
                    <button 
                      onClick={() => handleRequestAppt(f)}
                      className="w-full stitch-border px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest bg-[var(--title)] text-white hover:bg-black transition-none shadow-md"
                    >
                      [ Request Token ]
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Appointment Confirmation Modal */}
      {showModal && selectedFacilityForAppt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#24292F]/60 backdrop-blur-sm">
          <div className="bg-[var(--background)] stitch-border w-full max-w-lg shadow-2xl relative">
            
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--backdrop)]">
              <h3 className="text-[11px] font-bold uppercase tracking-widest text-[var(--title)]">Initialization Handshake</h3>
              {apptStatus === 'pending' && (
                <button onClick={() => setShowModal(false)} className="text-[var(--meta)] hover:text-[var(--title)] p-1 border border-transparent hover:border-[var(--border)]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              )}
            </div>

            {apptStatus === 'pending' ? (
              <div className="p-8">
                <p className="text-xs font-medium text-[var(--meta)] leading-relaxed mb-8">
                  You are generating a secure cryptographic token request for <strong className="text-[var(--title)] underline decoration-[var(--border)] underline-offset-2">{selectedFacilityForAppt.name}</strong>. This token block will reserve your identity position in the node schema prior to physical arrival.
                </p>
                
                <div className="stitch-border p-4 bg-[var(--backdrop)] mb-8 flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--meta)]">Selected Binding Profile</span>
                  <span className="text-xs font-bold text-[var(--title)] mono">
                    {category === 'Human' ? mockProfiles.human.find(p=>p.id===selectedProfileId)?.name : mockProfiles.pet.find(p=>p.id===selectedProfileId)?.name}
                  </span>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 stitch-border py-3 text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] bg-[var(--background)] hover:bg-[var(--backdrop)] hover:text-[var(--title)] transition-none"
                  >
                    Abort Payload
                  </button>
                  <button 
                    onClick={confirmRequest}
                    className="flex-[2] stitch-border py-3 text-[10px] font-bold uppercase tracking-widest bg-[var(--title)] text-white hover:bg-black transition-none shadow-sm"
                  >
                    Confirm & Execute Request
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-10 flex flex-col items-center">
                <div className="h-12 w-12 bg-green-100 border border-green-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h3 className="text-sm font-bold text-[var(--title)] mb-2">Token Request Initialized</h3>
                <p className="text-xs font-medium text-[var(--meta)] text-center max-w-xs mb-8">
                  Present this binding context to the front desk terminal upon arrival.
                </p>
                <div className="w-full h-1 bg-[var(--backdrop)]">
                  <div className="h-full bg-green-600 animate-[progress_3s_linear_forwards]"></div>
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
