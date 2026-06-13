'use client';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, 
  Users, 
  Ticket as TicketIcon, 
  Search, 
  Plus, 
  X, 
  Activity, 
  User, 
  ScanLine, 
  ChevronRight, 
  AlertCircle 
} from 'lucide-react';

const mockFacilitiesData = [
  { _id: '60e5a60b9432f700150b6a3b', name: 'Hebbal Veterinary Hospital', type: 'Ward', currentQueueCount: 20, estWait: '5 Mins', status: 'Low', color: 'bg-green-500', pos: { top: '35%', left: '30%' } },
  { _id: '60e5a60b9432f700150b6a3c', name: 'KC General Hospital', type: 'OPD', currentQueueCount: 100, estWait: '45 Mins', status: 'Full', color: 'bg-red-400', pos: { top: '25%', left: '55%' } },
  { _id: '60e5a60b9432f700150b6a3d', name: 'Central Med', type: 'Emergency', currentQueueCount: 60, estWait: '20 Mins', status: 'Moderate', color: 'bg-yellow-500', pos: { top: '60%', left: '65%' } },
  { _id: '60e5a60b9432f700150b6a3e', name: 'Paws & Care', type: 'Lab', currentQueueCount: 15, estWait: '2 Mins', status: 'Low', color: 'bg-green-500', pos: { top: '75%', left: '25%' } },
];

interface Facility {
  _id: string;
  name?: string;
  type?: string;
  load?: number;
  currentQueueCount?: number;
  estWait?: string;
  status?: string;
  color?: string;
  pos?: { top: string; left: string };
}

interface Profile {
  _id: string;
  profileType?: string;
  name?: string;
  dob?: string;
  bloodGroup?: string;
  species?: string;
  breed?: string;
  vaccinations?: string;
}

interface Ticket {
  _id: string;
  patientId?: string;
  facility?: Facility;
  [key: string]: unknown;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'Map' | 'Profiles' | 'Tickets'>('Map');
  const [mapCategory, setMapCategory] = useState<'General Care' | 'Specialized & Emergency'>('General Care');
  
  // Data State
  const [facilities, setFacilities] = useState<Facility[]>(mockFacilitiesData as Facility[]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  
  // Modal & Selection State
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);
  const [isAddingProfile, setIsAddingProfile] = useState(false);

  // New Profile Form
  const [newProfileType, setNewProfileType] = useState('Human');
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileDob, setNewProfileDob] = useState('');
  const [newProfileExtra, setNewProfileExtra] = useState(''); // bloodGroup or species
  const [newProfileBreed, setNewProfileBreed] = useState('');

  const isFormValid = newProfileType === 'Human'
    ? !!(newProfileName && newProfileDob && newProfileExtra)
    : !!(newProfileName && newProfileExtra && newProfileBreed);

  useEffect(() => {
    const backendUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
      ? window.location.origin.replace('3000', '5000') 
      : 'http://localhost:5000';

    // Fetch profiles
    fetch(`${backendUrl}/api/profiles`, {
      headers: { 'Authorization': 'Bearer mock-auth-token-123' }
    })
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setProfiles(data);
          if (data.length > 0) {
            setSelectedProfileId(prev => prev || data[0]._id);
          }
        }
      })
      .catch(err => console.error('Error fetching profiles', err));

    const socket = io(backendUrl, { withCredentials: true });
    socket.on('load-updated', (data) => {
       if (data && data.facilityId) {
         setFacilities(prev => prev.map(f => f._id === data.facilityId ? { ...f, currentQueueCount: data.newLoad } : f));
       }
    });
    return () => { socket.disconnect(); };
  }, []);

  const handleAddProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const payload: Record<string, string> = { profileType: newProfileType, name: newProfileName, dob: newProfileDob || new Date().toISOString() };
    if (newProfileType === 'Human') {
      payload.bloodGroup = newProfileExtra || 'O+';
    } else {
      payload.species = newProfileExtra || 'Dog';
      payload.breed = newProfileBreed || 'Unknown';
      payload.vaccinations = 'Verified';
    }

    const backendUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin.replace('3000', '5000') : 'http://localhost:5000';

    try {
      const res = await fetch(`${backendUrl}/api/profiles`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-auth-token-123'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newProf = await res.json();
        setProfiles(prev => [...prev, newProf]);
        setIsAddingProfile(false);
        setNewProfileName('');
        setNewProfileDob('');
        setNewProfileExtra('');
        setNewProfileBreed('');
        setSelectedProfileId(newProf._id);
        if (selectedFacility) {
          setActiveTab('Map');
        }
      }
    } catch (err) {
      console.error('Failed to create profile', err);
    }
  };

  const handleBookAppointment = async () => {
    if (!selectedFacility || !selectedProfileId) return;
    
    const backendUrl = typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? window.location.origin.replace('3000', '5000') : 'http://localhost:5000';

    try {
      const res = await fetch(`${backendUrl}/api/appointments`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-auth-token-123'
        },
        body: JSON.stringify({ 
          patientId: selectedProfileId, 
          facilityId: selectedFacility._id, 
          userId: '60e5a60b9432f700150b6a2b' // Mock user for now
        })
      });
      if (res.ok) {
        const appointment = await res.json();
        setActiveTicket({ ...appointment, facility: selectedFacility });
        setSelectedFacility(null);
        setActiveTab('Tickets');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const getProfileDisplayInfo = (p: Profile) => {
    return {
      first: p.name ? p.name.split(' ')[0] : 'Unknown',
      second: p.profileType === 'Human' ? '(Human)' : '(Pet)'
    };
  };

  const renderTopNav = (title: string) => (
    <div className="flex justify-between items-center p-6 z-20 relative backdrop-blur-md bg-transparent border-b border-white/5">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-[var(--panel-solid)] border border-white/10 shadow-lg flex items-center justify-center">
          <Activity className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <span className="text-sm font-semibold tracking-wide text-white">{title}</span>
      </div>
      <div className="flex items-center space-x-4 text-[var(--meta)]">
        <div className="w-8 h-8 rounded-full bg-[var(--panel-solid)] border border-white/10 flex items-center justify-center hover:text-white transition-colors cursor-pointer">
          <User className="w-4 h-4" />
        </div>
        <div onClick={() => window.location.href = '/staff'} className="w-8 h-8 rounded-full bg-[var(--panel-solid)] border border-white/10 flex items-center justify-center hover:text-white transition-colors cursor-pointer shadow-lg">
          <ScanLine className="w-4 h-4" />
        </div>
      </div>
    </div>
  );

  const renderBottomNav = () => (
    <div className="absolute bottom-0 w-full pb-8 pt-4 bg-gradient-to-t from-[#030507] via-[#030507]/90 to-transparent flex justify-center items-center space-x-6 z-30 px-6">
      {[
        { id: 'Map', icon: MapIcon, label: 'Map' },
        { id: 'Profiles', icon: Users, label: 'Profiles' },
        { id: 'Tickets', icon: TicketIcon, label: 'Tickets' }
      ].map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'Map' | 'Profiles' | 'Tickets')} 
            className={`relative flex flex-col items-center justify-center w-24 h-16 rounded-2xl transition-all duration-300 ${isActive ? 'text-white' : 'text-[var(--meta)] hover:text-white hover:bg-white/5'}`}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-pill" 
                className="absolute inset-0 bg-white/10 border border-white/10 rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
              />
            )}
            <Icon className={`w-5 h-5 mb-1.5 z-10 transition-colors ${isActive ? 'text-[var(--accent)]' : ''}`} />
            <span className="text-[10px] font-semibold tracking-widest uppercase z-10">{tab.label}</span>
          </button>
        )
      })}
    </div>
  );

  return (
    <div className="relative w-full h-screen bg-[var(--background)] overflow-hidden font-sans border border-white/5 md:border-4 md:border-[#30363D] md:rounded-3xl m-auto md:my-4 shadow-2xl max-w-6xl">
      <AnimatePresence mode="wait">
        
        {/* ---------------- MAP VIEW ---------------- */}
        {activeTab === 'Map' && (
          <motion.div 
            key="map"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col z-10 bg-[#030507]"
          >
            {renderTopNav('Live Heatmap Dashboard')}

            <div className="relative flex-1 w-full h-[calc(100vh-8rem)] overflow-hidden flex flex-col map-bg">
              {/* Center Pill Switcher */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex bg-[var(--panel-solid)]/80 backdrop-blur-xl border border-white/10 rounded-full p-1.5 z-20 shadow-2xl">
                <button 
                  onClick={() => setMapCategory('General Care')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-300 ${mapCategory === 'General Care' ? 'bg-white text-black shadow-lg' : 'text-[var(--meta)] hover:text-white'}`}
                >
                  General Care
                </button>
                <button 
                  onClick={() => setMapCategory('Specialized & Emergency')}
                  className={`px-6 py-2.5 text-xs font-bold rounded-full transition-all duration-300 ${mapCategory === 'Specialized & Emergency' ? 'bg-white text-black shadow-lg' : 'text-[var(--meta)] hover:text-white'}`}
                >
                  Specialized & Emergency
                </button>
              </div>

              {/* Left Floating Cards */}
              <div className="absolute left-6 top-24 space-y-4 z-20 w-72 pointer-events-none hidden md:block">
                <div className="glass-panel p-5 pointer-events-auto">
                  <h3 className="text-sm font-semibold text-white mb-4">Live Queue Status</h3>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs text-[var(--meta)] tracking-wide">Congestion Level</span>
                    <span className="text-sm font-bold text-green-400">64%</span>
                  </div>
                  <div className="w-full h-1.5 bg-black/50 rounded-full mb-3 overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '64%' }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" 
                    />
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-[var(--meta)] flex items-center">
                    <Activity className="w-3 h-3 mr-1.5" />
                    Updated Live
                  </div>
                </div>
                
                <div className="glass-panel p-5 pointer-events-auto">
                  <h3 className="text-sm font-semibold text-white mb-4">Facility Search</h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-3 text-[var(--meta)]" />
                    <input type="text" placeholder="Search for Hospitals..." className="w-full bg-black/50 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-[var(--meta)] focus:outline-none focus:border-[var(--accent)] transition-colors shadow-inner" />
                  </div>
                </div>
              </div>

              {/* Map Nodes */}
              {Array.isArray(facilities) && facilities.filter(f => {
                if (!f?.type) return false;
                if (mapCategory === 'General Care') return ['OPD', 'Ward', 'Human', 'Pet'].includes(f.type);
                return ['Lab', 'Pharmacy', 'Emergency'].includes(f.type);
              }).map(f => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={f._id} 
                  className="absolute z-10 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" 
                  style={{ top: f.pos?.top || '50%', left: f.pos?.left || '50%' }} 
                  onClick={() => setSelectedFacility(f)}
                >
                  <div className="flex items-center space-x-2 bg-[var(--panel-solid)]/90 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 shadow-xl group-hover:border-[var(--accent)] group-hover:shadow-[0_0_20px_rgba(147,197,253,0.2)] transition-all">
                    <div className={`w-2.5 h-2.5 rounded-full ${f.color || 'bg-blue-500'} shadow-[0_0_10px_currentColor]`}></div>
                    <span className="text-[10px] font-bold tracking-wide text-white">{f.name || 'Unknown'} <span className="text-[var(--meta)] font-normal ml-1">&bull; Queue {f.currentQueueCount || f.load || 0}</span></span>
                  </div>
                  <div className="absolute left-1/2 bottom-[-6px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-white/10 transform -translate-x-1/2 group-hover:border-t-[var(--accent)] transition-colors"></div>
                </motion.div>
              ))}

              {/* Booking Modal Overlay */}
              <AnimatePresence>
                {selectedFacility && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 flex flex-col justify-end pb-32 px-4 items-center"
                  >
                    <motion.div 
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      className="w-full max-w-md glass-panel p-6 shadow-2xl relative overflow-hidden border border-white/10"
                    >
                      <button onClick={() => setSelectedFacility(null)} className="absolute top-4 right-4 p-2 text-[var(--meta)] hover:text-white hover:bg-white/5 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                      
                      <div className="mb-6 pr-10">
                        <div className="flex justify-between items-start mb-2">
                          <h2 className="text-xl font-bold text-white leading-tight tracking-tight">{selectedFacility.name}</h2>
                          <span className="flex items-center text-[10px] font-bold text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full uppercase tracking-wider border border-green-400/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-1.5 animate-pulse"></span> LIVE
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-[var(--meta)] font-medium">
                          <p>{selectedFacility.type} Care Unit</p>
                          <p className="text-[var(--accent)] whitespace-nowrap ml-2 bg-[var(--accent)]/10 px-2 py-0.5 rounded-md border border-[var(--accent)]/20">Est. Wait: {selectedFacility.estWait}</p>
                        </div>
                      </div>

                      <div className="mb-8">
                        <h3 className="text-[10px] font-bold text-[var(--meta)] uppercase tracking-widest mb-3">Select Patient Profile</h3>
                        <div className="flex space-x-3 overflow-x-auto pb-2 custom-scroll">
                          {/* Profiles */}
                          {Array.isArray(profiles) && profiles.map(prof => {
                            if (!prof || !prof.name) return null;
                            const info = getProfileDisplayInfo(prof);
                            const isSelected = selectedProfileId === prof._id;
                            return (
                              <motion.div 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                key={prof._id}
                                onClick={() => setSelectedProfileId(prof._id)}
                                className={`flex-shrink-0 w-24 h-28 rounded-2xl border flex flex-col items-center justify-center p-2 cursor-pointer transition-all duration-300 ${
                                  isSelected ? 'border-[var(--accent)] bg-[var(--accent)]/10 shadow-[0_0_15px_rgba(147,197,253,0.15)]' : 'border-white/10 bg-black/40 hover:border-white/30'
                                }`}
                              >
                                <div className={`w-12 h-12 rounded-full mb-3 flex items-center justify-center overflow-hidden border transition-colors ${isSelected ? 'bg-[var(--accent)]/20 border-[var(--accent)]/50 text-[var(--accent)]' : 'bg-white/5 border-white/10 text-[var(--meta)]'}`}>
                                   <User className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-semibold text-center leading-tight text-white tracking-wide">
                                  {info.first}<br/>
                                  <span className={`text-[9px] ${isSelected ? 'text-[var(--accent)]/80' : 'text-[var(--meta)]'}`}>{info.second}</span>
                                </span>
                              </motion.div>
                            )
                          })}
                          {/* New Profile Button */}
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => {
                              setIsAddingProfile(true);
                              setActiveTab('Profiles');
                            }}
                            className="flex-shrink-0 w-24 h-28 rounded-2xl border border-dashed border-white/20 bg-transparent flex flex-col items-center justify-center p-2 cursor-pointer hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all group"
                          >
                            <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-[var(--accent)]/10 mb-3 flex items-center justify-center transition-colors">
                              <Plus className="w-5 h-5 text-[var(--meta)] group-hover:text-[var(--accent)] transition-colors" />
                            </div>
                            <span className="text-[10px] font-medium text-[var(--meta)] group-hover:text-[var(--accent)] transition-colors tracking-wide">New Profile</span>
                          </motion.div>
                        </div>
                      </div>

                      <button 
                        onClick={handleBookAppointment}
                        className="w-full py-4 bg-white text-black hover:bg-gray-200 font-bold text-sm rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all disabled:opacity-50 disabled:shadow-none mb-4 tracking-wide"
                        disabled={!selectedProfileId}
                      >
                        <ScanLine className="w-4 h-4 mr-2" />
                        Generate Cryptographic Pass
                      </button>
                      <p className="text-center text-[10px] text-[var(--meta)] uppercase tracking-widest font-medium">Position locked for 15:00 minutes</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* ---------------- PROFILES VIEW ---------------- */}
        {activeTab === 'Profiles' && (
          <motion.div 
            key="profiles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#030507] flex flex-col z-10 overflow-y-auto pb-32"
          >
            {renderTopNav('Identity Management')}
            
            <div className="flex-1 p-6 max-w-md mx-auto w-full pt-8">
              <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Family Profiles</h2>
              
              <div className="space-y-4 mb-8">
                {Array.isArray(profiles) && profiles.map((p: Profile, idx: number) => {
                  if (!p) return null;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={p._id} 
                      className="glass-panel p-5 flex justify-between items-center cursor-pointer hover:border-white/30 hover:bg-white/5 transition-all group" 
                      onClick={() => { setSelectedProfileId(p._id); setActiveTab('Map'); }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center border border-white/10 group-hover:border-white/30 transition-colors">
                          <User className="w-5 h-5 text-[var(--meta)] group-hover:text-white transition-colors" />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-white tracking-wide">{p.name || 'Unknown'}</h3>
                          <p className="text-xs text-[var(--meta)] mt-0.5">{p.profileType || 'Patient'} Identity</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[var(--meta)] group-hover:text-white transition-colors" />
                    </motion.div>
                  );
                })}
              </div>

              {isAddingProfile ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass-panel p-6 border-white/20 shadow-2xl"
                >
                  <h3 className="text-lg font-bold text-white mb-6 tracking-tight">Register New Profile</h3>
                  <form onSubmit={handleAddProfile} className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-2">Profile Type</label>
                      <select value={newProfileType} onChange={(e) => setNewProfileType(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent)] outline-none transition-colors appearance-none shadow-inner">
                        <option value="Human">Human Care</option>
                        <option value="Pet">Veterinary Care</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-2">{newProfileType === 'Human' ? 'Full Name' : 'Pet Name'}</label>
                      <input required type="text" value={newProfileName} onChange={(e) => setNewProfileName(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent)] outline-none transition-colors shadow-inner" />
                    </div>
                    {newProfileType === 'Human' ? (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-2">Age / DOB</label>
                          <input required type="text" value={newProfileDob} onChange={(e) => setNewProfileDob(e.target.value)} placeholder="e.g. 1990-01-01" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent)] outline-none transition-colors shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-2">Blood Group</label>
                          <input required type="text" value={newProfileExtra} onChange={(e) => setNewProfileExtra(e.target.value)} placeholder="e.g. O+" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent)] outline-none transition-colors shadow-inner" />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-2">Species</label>
                          <input required type="text" value={newProfileExtra} onChange={(e) => setNewProfileExtra(e.target.value)} placeholder="e.g. Dog, Cat" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent)] outline-none transition-colors shadow-inner" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-2">Breed</label>
                          <input required type="text" value={newProfileBreed} onChange={(e) => setNewProfileBreed(e.target.value)} placeholder="e.g. Golden Retriever" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:border-[var(--accent)] outline-none transition-colors shadow-inner" />
                        </div>
                      </>
                    )}
                    <div className="pt-4 flex space-x-4">
                      <button type="button" onClick={() => setIsAddingProfile(false)} className="flex-1 py-3.5 border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-colors">Cancel</button>
                      <button type="submit" disabled={!isFormValid} className={`flex-[2] py-3.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isFormValid ? 'bg-white text-black hover:bg-gray-200 shadow-[0_0_15px_rgba(255,255,255,0.2)]' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}>Save Profile</button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <button onClick={() => setIsAddingProfile(true)} className="w-full py-5 border border-dashed border-white/20 rounded-2xl flex items-center justify-center text-sm font-semibold text-[var(--meta)] hover:text-white hover:border-white/50 hover:bg-white/5 transition-all">
                  <Plus className="w-5 h-5 mr-2" />
                  Register New Profile
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ---------------- TICKETS VIEW ---------------- */}
        {activeTab === 'Tickets' && (
          <motion.div 
            key="tickets"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#030507] flex flex-col z-10 overflow-y-auto pb-32"
          >
            {renderTopNav('Active Tokens')}
            
            {activeTicket ? (
              <div className="flex-1 flex flex-col items-center p-6 max-w-sm mx-auto w-full pt-8">
                <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 px-4 py-1.5 rounded-full mb-8 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live Check-in</span>
                </div>

                {/* QR Card */}
                <div className="glass-panel w-full p-8 mb-6 border-white/20 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                  
                  <div className="bg-white rounded-2xl aspect-square w-full mb-8 flex flex-col items-center justify-center p-6 shadow-inner relative z-10">
                     <QRCodeSVG value={String(activeTicket._id)} size={240} className="w-full h-full" bgColor="transparent" fgColor="#030507" />
                  </div>
                  
                  <div className="text-center text-[9px] text-[var(--meta)] uppercase tracking-widest mb-8 font-mono">
                    [ HASH: {activeTicket._id} | AES-256 ]
                  </div>

                  <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-6 relative z-10">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-1.5">Patient Identity</div>
                      <div className="text-base font-bold text-white tracking-wide">
                        {Array.isArray(profiles) ? profiles.find(p=>p && p._id === activeTicket.patientId)?.name || 'Unknown' : 'Unknown'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-1.5">Validity</div>
                      <div className="text-base font-bold text-white">15:00</div>
                    </div>
                  </div>

                  <div className="relative z-10">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-1.5">Target Node</div>
                    <div className="text-sm font-semibold text-white flex items-center bg-black/40 px-3 py-2 rounded-xl border border-white/5">
                      <MapIcon className="w-4 h-4 mr-2 text-[var(--accent)]" />
                      {activeTicket.facility?.name || 'Assigned Node'}
                    </div>
                  </div>
                </div>

                {/* Queue Position */}
                <div className="glass-panel w-full p-6 text-center mb-8 border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--meta)] mb-3">Estimated Wait: {activeTicket.facility?.estWait || '12 min'}</div>
                  <div className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest mb-2">Queue Position</div>
                  <div className="text-6xl font-bold text-white mb-5 font-mono tracking-tighter">#3</div>
                  <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '66%' }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full" 
                    />
                  </div>
                </div>

                <button className="w-full py-4 bg-transparent border border-red-500/30 text-red-400 font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center hover:bg-red-500/10 transition-colors">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Revoke Appointment
                </button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[var(--meta)] p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                  <TicketIcon className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm tracking-wide leading-relaxed">No active cryptographic tokens detected.<br/>Return to the Heatmap to request a pass.</p>
                <button onClick={() => setActiveTab('Map')} className="mt-8 px-8 py-3.5 border border-white/10 rounded-full text-xs font-bold uppercase tracking-widest text-white hover:bg-white/10 transition-colors shadow-lg">View Heatmap</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {renderBottomNav()}
    </div>
  );
}
