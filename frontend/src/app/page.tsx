'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const facilitiesData = [
  { id: '1', name: 'Hebbal Veterinary Hospital', type: 'Pet', load: 20, estWait: '5 Mins', status: 'Low', color: 'bg-green-500', pos: { top: '35%', left: '30%' } },
  { id: '2', name: 'KC General Hospital', type: 'Human', load: 100, estWait: '45 Mins', status: 'Full', color: 'bg-red-400', pos: { top: '25%', left: '55%' } },
  { id: '3', name: 'Central Med', type: 'Human', load: 60, estWait: '20 Mins', status: 'Moderate', color: 'bg-yellow-500', pos: { top: '60%', left: '65%' } },
  { id: '4', name: 'Paws & Care', type: 'Pet', load: 15, estWait: '2 Mins', status: 'Low', color: 'bg-green-500', pos: { top: '75%', left: '25%' } },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'Map' | 'Profiles' | 'Tickets'>('Map');
  const [mapCategory, setMapCategory] = useState<'Human Hospitals' | 'Veterinary Clinics'>('Human Hospitals');
  
  // Modal State
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>('Bruno (Pet)');
  
  // Real-time
  const [facilities, setFacilities] = useState(facilitiesData);

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('load-updated', () => {
       // Mock update
       setFacilities([...facilities]);
    });
    return () => { socket.disconnect(); };
  }, [facilities]);

  const renderTopNav = (title: string) => (
    <div className="flex justify-between items-center p-4 z-20 relative">
      <div className="flex items-center space-x-4">
        <svg className="w-5 h-5 text-[var(--meta)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
        <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center">
          <svg className="w-4 h-4 text-[var(--meta)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
        </div>
        <span className="text-sm font-medium text-[var(--meta)]">{title}</span>
      </div>
      <div className="flex items-center space-x-4 text-[var(--meta)]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path></svg>
      </div>
    </div>
  );

  const renderBottomNav = () => (
    <div className="absolute bottom-0 w-full h-20 bg-[var(--background)] border-t border-[var(--border)] flex justify-center items-center space-x-16 z-30 px-6">
      <button onClick={() => setActiveTab('Map')} className={`flex flex-col items-center justify-center w-20 h-12 rounded-full ${activeTab === 'Map' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--meta)]'}`}>
        <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293L14 1.586v12.828l2.293 2.293A1 1 0 0018 16V6a1 1 0 00-.293-.707z" clipRule="evenodd"></path></svg>
        <span className="text-[10px] font-medium">Map</span>
      </button>
      <button onClick={() => setActiveTab('Profiles')} className={`flex flex-col items-center justify-center w-20 h-12 rounded-full ${activeTab === 'Profiles' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'text-[var(--meta)]'}`}>
        <svg className="w-5 h-5 mb-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
        <span className="text-[10px] font-medium">Profiles</span>
      </button>
      <button onClick={() => setActiveTab('Tickets')} className={`flex flex-col items-center justify-center w-20 h-12 rounded-full ${activeTab === 'Tickets' ? 'bg-[var(--accent)] text-[#1E1E1E]' : 'text-[var(--meta)]'}`}>
        <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"></path></svg>
        <span className="text-[10px] font-bold">Tickets</span>
      </button>
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-[var(--background)] overflow-hidden font-sans border-4 border-indigo-500/20 rounded-xl m-auto my-2 shadow-2xl max-w-6xl">
      
      {/* ---------------- MAP VIEW ---------------- */}
      {activeTab === 'Map' && (
        <div className="absolute inset-0 map-bg">
          {renderTopNav('Live Heatmap Dashboard')}

          {/* Center Pill Switcher */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex bg-[var(--panel)] border border-[var(--border)] rounded-full p-1 z-20 shadow-lg">
            <button 
              onClick={() => setMapCategory('Human Hospitals')}
              className={`px-6 py-2 text-xs font-semibold rounded-full transition-colors ${mapCategory === 'Human Hospitals' ? 'bg-[var(--accent)] text-[#1E1E1E]' : 'text-[var(--meta)] hover:text-white'}`}
            >
              Human Hospitals
            </button>
            <button 
              onClick={() => setMapCategory('Veterinary Clinics')}
              className={`px-6 py-2 text-xs font-semibold rounded-full transition-colors ${mapCategory === 'Veterinary Clinics' ? 'bg-[var(--accent)] text-[#1E1E1E]' : 'text-[var(--meta)] hover:text-white'}`}
            >
              Veterinary Clinics
            </button>
          </div>

          {/* Left Floating Cards */}
          <div className="absolute left-6 top-24 space-y-4 z-20 w-64">
            <div className="glass-panel p-4">
              <h3 className="text-sm font-bold text-white mb-4">Live Queue Status</h3>
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs text-[var(--meta)]">Current Crowd Level</span>
                <span className="text-sm font-bold text-green-400">64%</span>
              </div>
              <div className="w-full h-1 bg-[var(--border)] rounded-full mb-3">
                <div className="h-full bg-green-400 rounded-full" style={{width: '64%'}}></div>
              </div>
              <div className="text-[10px] text-[var(--meta)] flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Updated 2m ago
              </div>
            </div>
            
            <div className="glass-panel p-4">
              <h3 className="text-sm font-bold text-white mb-3">Live Queue Status</h3>
              <div className="relative">
                <svg className="w-4 h-4 absolute left-3 top-2.5 text-[var(--meta)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                <input type="text" placeholder="Search for Hospitals or Ve..." className="w-full bg-[#0D1117] border border-[var(--border)] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder-[var(--meta)] focus:outline-none focus:border-[var(--accent)]" />
              </div>
            </div>
          </div>

          {/* Floating Action Buttons (Right) */}
          <div className="absolute right-6 bottom-28 space-y-3 z-20 flex flex-col">
             <button className="w-10 h-10 bg-[var(--accent)] rounded-2xl flex items-center justify-center text-[#1E1E1E] shadow-lg">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
             </button>
             <button className="w-10 h-10 bg-[var(--panel)] border border-[var(--border)] rounded-2xl flex items-center justify-center text-white shadow-lg">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
             </button>
          </div>

          {/* Map Nodes (Filtered by Category) */}
          {facilities.filter(f => mapCategory.includes(f.type)).map(f => (
            <div key={f.id} className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style={{ top: f.pos.top, left: f.pos.left }} onClick={() => setSelectedFacility(f)}>
              <div className="flex items-center space-x-2 bg-[var(--panel)] border border-[var(--border)] rounded-full px-3 py-1.5 shadow-lg group-hover:border-[var(--accent)] transition-colors">
                <div className={`w-2.5 h-2.5 rounded-full ${f.color}`}></div>
                <span className="text-[10px] font-medium text-white">{f.name}: {f.status}</span>
              </div>
              <div className="absolute left-1/2 bottom-[-8px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[var(--panel)] transform -translate-x-1/2 group-hover:border-t-[var(--accent)] transition-colors"></div>
            </div>
          ))}

          {/* Booking Modal Overlay */}
          {selectedFacility && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col justify-end pb-24 items-center animate-fade-in">
              <div className="w-full max-w-md glass-panel p-6 shadow-2xl relative overflow-hidden">
                <button onClick={() => setSelectedFacility(null)} className="absolute top-4 right-4 text-[var(--meta)] hover:text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <div className="mb-6 pr-8">
                  <div className="flex justify-between items-start mb-1">
                    <h2 className="text-lg font-bold text-white leading-tight">{selectedFacility.name}</h2>
                    <span className="flex items-center text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span> LIVE
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-[var(--meta)]">
                    <p>General OPD & Veterinary Consultation &bull; {selectedFacility.estWait} Wait Time</p>
                    <p className="font-bold text-[var(--accent)] whitespace-nowrap ml-2">Est. Wait: {selectedFacility.estWait}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-3">Select Patient Profile</h3>
                  <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                    {/* Mock Profiles */}
                    {['Self (Human)', 'Mother (Human)', 'Bruno (Pet)'].map(prof => (
                      <div 
                        key={prof}
                        onClick={() => setSelectedProfile(prof)}
                        className={`flex-shrink-0 w-24 h-28 rounded-xl border flex flex-col items-center justify-center p-2 cursor-pointer transition-colors ${
                          selectedProfile === prof ? 'border-[var(--accent)] bg-[var(--accent)]/10' : 'border-[var(--border)] bg-[#0D1117] hover:border-[var(--meta)]'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full bg-[var(--panel)] mb-3 flex items-center justify-center overflow-hidden border border-[var(--border)]">
                           <svg className="w-6 h-6 text-[var(--meta)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                        </div>
                        <span className="text-[11px] font-medium text-center leading-tight">
                          {prof.split(' ')[0]}<br/>
                          <span className="text-[9px] text-[var(--meta)]">{prof.split(' ')[1]}</span>
                        </span>
                      </div>
                    ))}
                    {/* New Profile */}
                    <div className="flex-shrink-0 w-24 h-28 rounded-xl border border-dashed border-[var(--border)] bg-transparent flex flex-col items-center justify-center p-2 cursor-pointer hover:border-[var(--meta)]">
                      <div className="w-8 h-8 rounded-full bg-[var(--panel)] mb-3 flex items-center justify-center">
                        <svg className="w-4 h-4 text-[var(--meta)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                      </div>
                      <span className="text-[10px] text-[var(--meta)]">New Profile</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setActiveTab('Tickets');
                    setSelectedFacility(null);
                  }}
                  className="w-full py-3.5 bg-[var(--accent)] text-[#1E1E1E] font-bold text-sm rounded-xl flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity mb-3"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                  Scan QR
                </button>
                <p className="text-center text-[10px] text-[var(--meta)]">Your position in queue will be locked for 15:00 minutes</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- TICKETS VIEW ---------------- */}
      {activeTab === 'Tickets' && (
        <div className="absolute inset-0 bg-[#05070B] flex flex-col z-10 overflow-y-auto pb-24">
          {renderTopNav('Active Scanning Pass')}
          
          <div className="flex-1 flex flex-col items-center p-6 max-w-sm mx-auto w-full">
            <div className="inline-flex items-center space-x-1.5 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Active Check-in</span>
            </div>

            {/* QR Card */}
            <div className="glass-panel w-full p-6 mb-6">
              <div className="bg-[#0D1117] rounded-xl aspect-square w-full mb-6 flex flex-col items-center justify-center border border-[var(--border)] border-dashed relative">
                 {/* QR Corner Markers */}
                 <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[var(--meta)] rounded-tl"></div>
                 <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[var(--meta)] rounded-tr"></div>
                 <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[var(--meta)] rounded-bl"></div>
                 <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[var(--meta)] rounded-br"></div>
                 
                 <svg className="w-8 h-8 text-[var(--meta)] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"></path></svg>
                 <span className="text-xs font-medium text-[var(--meta)] tracking-widest uppercase">Align QR Code</span>
              </div>
              
              <div className="text-center text-[8px] text-[var(--meta)] uppercase tracking-widest mb-6">
                [ ENCRYPTED VIA AES-256 | VALID FOR 15 MINS ]
              </div>

              <div className="flex justify-between items-start mb-6 border-b border-[var(--border)] pb-4">
                <div>
                  <div className="text-[10px] text-[var(--meta)] mb-1">Patient Name</div>
                  <div className="text-sm font-bold text-white">Bruno (Pet)</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-[var(--meta)] mb-1">Check-In Window</div>
                  <div className="text-sm font-bold text-white">14:30 - 14:45</div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-[var(--meta)] mb-1">Facility</div>
                <div className="text-sm font-medium text-white flex items-center">
                  <svg className="w-4 h-4 mr-1.5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                  Cessna Lifeline Vet Hospital
                </div>
              </div>
            </div>

            {/* Queue Position */}
            <div className="glass-panel w-full p-6 text-center mb-6">
              <div className="text-[10px] text-[var(--meta)] mb-2 font-medium">Estimated Wait: 12 min</div>
              <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-1">Your Position</div>
              <div className="text-5xl font-bold text-white mb-4 mono">#3</div>
              <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full w-2/3"></div>
              </div>
            </div>

            <button className="w-full py-3.5 bg-transparent border border-red-500/30 text-red-400 font-medium text-xs rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Cancel Appointment
            </button>
          </div>
        </div>
      )}

      {/* Profiles View Placeholder */}
      {activeTab === 'Profiles' && (
        <div className="absolute inset-0 bg-[#05070B] flex items-center justify-center z-10 text-[var(--meta)]">
          Profile Management View (Select Map or Tickets)
        </div>
      )}

      {renderBottomNav()}
    </div>
  );
}
