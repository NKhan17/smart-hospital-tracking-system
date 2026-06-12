'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const initialFacilities = [
  { id: '1', name: 'Central City Hospital', type: 'Human', load: 30, estWait: '14 Mins', pos: { top: '35%', left: '40%' } },
  { id: '2', name: 'Bengaluru Vet Clinic', type: 'Pet', load: 85, estWait: '45 Mins', pos: { top: '55%', left: '60%' } },
  { id: '3', name: 'Northside Medical', type: 'Human', load: 95, estWait: '90 Mins', pos: { top: '20%', left: '70%' } },
  { id: '4', name: 'Apollo Animal Health', type: 'Pet', load: 10, estWait: '5 Mins', pos: { top: '75%', left: '30%' } },
  { id: '5', name: 'South End Emergency', type: 'Human', load: 60, estWait: '35 Mins', pos: { top: '80%', left: '55%' } },
];

const mockProfiles = {
  human: { name: 'John Doe', age: 34, bloodGroup: 'O+', allergies: 'Penicillin', conditions: 'None' },
  pet: { name: 'Max', species: 'Dog', breed: 'Golden Retriever', vaccinations: 'Up to Date' }
};

export default function Home() {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);
  const [profileType, setProfileType] = useState('Human Profiles');
  const [showDrawer, setShowDrawer] = useState(false);

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

  const getStatusColor = (load: number) => {
    if (load > 80) return 'bg-red-500';
    if (load > 50) return 'bg-yellow-400';
    return 'bg-green-500';
  };

  const getStatusText = (load: number) => {
    if (load > 80) return 'Severe Saturation';
    if (load > 50) return 'Moderate Surge';
    return 'Low Capacity';
  };

  const handleFacilityClick = (f: any) => {
    setSelectedFacility(f);
    setShowDrawer(true);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white text-gray-900 font-sans selection:bg-gray-200">
      {/* Top Navbar: Stitch Precision */}
      <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 z-30 relative shrink-0">
        <div className="flex items-center space-x-3">
          <div className="h-4 w-4 bg-black rounded-sm"></div>
          <h1 className="text-sm font-semibold tracking-wide text-black uppercase">HealthTrack Interface</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.href = '/staff'}
            className="text-xs font-medium px-4 py-1.5 border border-gray-200 hover:bg-gray-50 transition-colors rounded-sm text-black"
          >
            Staff Portal
          </button>
        </div>
      </header>

      {/* Main Full-Bleed Canvas */}
      <main className="flex-1 relative bg-[#fafafa] overflow-hidden">
        {/* Map Decorative Grid */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none" 
          style={{ 
            backgroundImage: 'linear-gradient(#d1d5db 1px, transparent 1px), linear-gradient(90deg, #d1d5db 1px, transparent 1px)', 
            backgroundSize: '48px 48px' 
          }}
        ></div>

        {/* Map Nodes */}
        <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
          {facilities.map((f) => (
            <div 
              key={f.id} 
              onClick={() => handleFacilityClick(f)}
              className="absolute map-node flex items-center justify-center group cursor-pointer"
              style={{ top: f.pos.top, left: f.pos.left, transform: 'translate(-50%, -50%)' }}
            >
              <div className="relative flex flex-col items-center">
                <div className={`h-6 w-6 rounded-full border-4 border-white shadow-sm z-10 ${getStatusColor(f.load)} group-hover:scale-110 transition-all duration-300`}></div>
                <div className="absolute top-8 px-3 py-1.5 bg-white border border-gray-200 shadow-sm text-[10px] font-bold text-gray-900 z-20 whitespace-nowrap opacity-0 group-hover:opacity-100 group-hover:translate-y-1 transition-all">
                  {f.name}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Profile Widget */}
        <div className="absolute top-6 left-6 w-80 bg-white border border-gray-200 shadow-sm z-20 flex flex-col">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Profile Context</h2>
          </div>
          <div className="p-4">
            {/* Segmented Control */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-sm border border-gray-200 mb-4">
              {['Human Profiles', 'Pet Profiles'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setProfileType(tab)}
                  className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all ${
                    profileType === tab ? 'bg-white text-black shadow-sm border border-gray-200' : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            {/* Profile Data Key-Value Table */}
            <div className="space-y-2 pt-2">
              {profileType === 'Human Profiles' ? (
                <>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-2 mb-2">
                    <span className="text-gray-500 font-medium">Name</span>
                    <span className="font-bold text-gray-900">{mockProfiles.human.name}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-2 mb-2">
                    <span className="text-gray-500 font-medium">Blood Group</span>
                    <span className="font-bold text-gray-900">{mockProfiles.human.bloodGroup}</span>
                  </div>
                  <div className="flex justify-between text-xs pb-1">
                    <span className="text-gray-500 font-medium">Allergies (Encrypted)</span>
                    <span className="font-bold text-gray-900">{mockProfiles.human.allergies}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-2 mb-2">
                    <span className="text-gray-500 font-medium">Name</span>
                    <span className="font-bold text-gray-900">{mockProfiles.pet.name}</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-2 mb-2">
                    <span className="text-gray-500 font-medium">Species/Breed</span>
                    <span className="font-bold text-gray-900">{mockProfiles.pet.species} &middot; {mockProfiles.pet.breed}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-1">
                    <span className="text-gray-500 font-medium">Vaccinations</span>
                    <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-sm font-bold text-[10px] uppercase border border-green-200">
                      {mockProfiles.pet.vaccinations}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Sliding Right Drawer Panel */}
        <div 
          className={`absolute top-0 right-0 h-full w-96 bg-white border-l border-gray-200 shadow-2xl z-30 transform transition-transform duration-500 ease-in-out ${
            showDrawer ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedFacility && (
            <div className="flex flex-col h-full">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Facility Diagnostics</h3>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="text-gray-400 hover:text-black transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>

              <div className="p-8 flex-1 flex flex-col">
                <h2 className="text-2xl font-bold text-gray-900 mb-1">{selectedFacility.name}</h2>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">{selectedFacility.type} Dedicated Facility</div>
                
                {/* Live Metrics UI */}
                <div className="bg-[#fafafa] border border-gray-200 p-6 rounded-sm flex items-center justify-between mb-8">
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Queue Estimate</div>
                    <div className="text-3xl font-mono font-medium text-black tracking-tight">{selectedFacility.estWait}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Live Capacity</div>
                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 border rounded-sm ${
                      selectedFacility.load > 80 ? 'bg-red-50 border-red-200 text-red-700' : 
                      selectedFacility.load > 50 ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                      'bg-green-50 border-green-200 text-green-700'
                    }`}>
                      <span className={`h-2 w-2 rounded-full ${getStatusColor(selectedFacility.load)} animate-pulse`}></span>
                      <span className="text-[10px] font-bold uppercase tracking-widest">{getStatusText(selectedFacility.load)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8 border-t border-gray-100">
                  <button className="w-full bg-black text-white text-[11px] font-bold uppercase tracking-widest py-4 hover:bg-gray-800 transition-colors shadow-md">
                    Secure Appointment Block
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
