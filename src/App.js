import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit2, Trash2, X, Upload, LogOut, User, Download, Share2, AlertCircle, CheckCircle, XCircle, HelpCircle, Printer, Moon, Sun, ArrowUpDown, RotateCcw, Menu, Wifi, WifiOff } from 'lucide-react';
import * as XLSX from 'xlsx';

// Supabase Config
const SUPABASE_URL = 'https://ektfrusvejghlbdxhdnf.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrdGZydXN2ZWpnaGxiZHhoZG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3MzE1NTEsImV4cCI6MjA4MTMwNzU1MX0.TTkCRH_z4Mlqza-c88dAzMi7e4aKkToCxxEFkVaXYdo';

class SupabaseClient {
  constructor(url, key) {
    this.url = url;
    this.key = key;
  }

  async getPeople(code) {
    const res = await fetch(`${this.url}/rest/v1/people?access_code=eq.${code}&select=*`, {
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
    });
    if (!res.ok) throw new Error('Fetch failed');
    return res.json();
  }

  async insertPerson(person) {
    const res = await fetch(`${this.url}/rest/v1/people`, {
      method: 'POST',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}`, 'Content-Type': 'application/json', 'Prefer': 'return=representation' },
      body: JSON.stringify(person)
    });
    if (!res.ok) throw new Error('Insert failed');
    return res.json();
  }

  async updatePerson(id, updates) {
    const res = await fetch(`${this.url}/rest/v1/people?id=eq.${id}`, {
      method: 'PATCH',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, updated_at: new Date().toISOString() })
    });
    if (!res.ok) throw new Error('Update failed');
  }

  async deletePerson(id) {
    const res = await fetch(`${this.url}/rest/v1/people?id=eq.${id}`, {
      method: 'DELETE',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  async bulkInsert(people) {
    const res = await fetch(`${this.url}/rest/v1/people`, {
      method: 'POST',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(people)
    });
    if (!res.ok) throw new Error('Bulk insert failed');
  }

  async bulkDelete(ids) {
    const res = await fetch(`${this.url}/rest/v1/people?id=in.(${ids.join(',')})`, {
      method: 'DELETE',
      headers: { 'apikey': this.key, 'Authorization': `Bearer ${this.key}` }
    });
    if (!res.ok) throw new Error('Bulk delete failed');
  }
}

const supabase = new SupabaseClient(SUPABASE_URL, SUPABASE_KEY);

const CustomAlert = ({ message, type = 'info', onClose }) => {
  const icons = { success: <CheckCircle className="text-green-600" size={24} />, error: <XCircle className="text-red-600" size={24} />, info: <AlertCircle className="text-blue-600" size={24} />, warning: <AlertCircle className="text-orange-600" size={24} /> };
  const colors = { success: 'bg-green-50 border-green-500', error: 'bg-red-50 border-red-500', info: 'bg-blue-50 border-blue-500', warning: 'bg-orange-50 border-orange-500' };
  
  useEffect(() => { 
    const t = setTimeout(onClose, 3500); 
    return () => clearTimeout(t); 
  }, [onClose]);
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className={`pointer-events-auto ${colors[type]} border-2 rounded-2xl p-6 max-w-md mx-4 shadow-2xl`}>
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">{icons[type]}</div>
          <div className="flex-1"><p className="text-gray-800 font-medium">{message}</p></div>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><X size={18} /></button>
        </div>
      </div>
    </div>
  );
};

const CustomConfirm = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
    <div className="bg-white border-2 border-purple-500 rounded-2xl p-6 max-w-md mx-4 shadow-2xl">
      <div className="flex items-start gap-4">
        <AlertCircle className="text-purple-600" size={24} />
        <p className="text-gray-800 font-medium flex-1">{message}</p>
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button onClick={onCancel} className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold">Cancel</button>
        <button onClick={onConfirm} className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold">Confirm</button>
      </div>
    </div>
  </div>
);

const HelpModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
      <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex justify-between items-center">
        <h2 className="text-2xl font-bold">📚 Help Guide</h2>
        <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full"><X size={24} /></button>
      </div>
      <div className="p-6 space-y-4">
        <div><h3 className="font-bold text-purple-600 mb-2">🚀 Getting Started</h3><p className="text-sm">Enter access code → Share with team → Real-time sync!</p></div>
        <div><h3 className="font-bold text-purple-600 mb-2">☁️ Cloud Sync</h3><p className="text-sm">All data stored in cloud • Auto-sync • Never lose data</p></div>
      </div>
    </div>
  </div>
);

const WelcomeModal = ({ onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl text-center">
        <div className="text-6xl mb-4">👋</div>
        <h2 className="text-2xl font-bold">Welcome to Ajinkya!</h2>
        <p className="text-sm mt-2">🌟 Cloud-Powered Directory 🌟</p>
      </div>
      <div className="p-6">
        <ul className="space-y-2 text-sm mb-4">
          <li>✅ 20,000+ contacts with photos</li>
          <li>✅ Real-time cloud sync</li>
          <li>✅ Excel import with translation</li>
          <li>✅ Share via WhatsApp</li>
        </ul>
        <button onClick={onClose} className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold">🚀 Start</button>
      </div>
    </div>
  </div>
);

const PeopleDirectoryApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [currentView, setCurrentView] = useState('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [alert, setAlert] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const showAlert = (message, type = 'info') => setAlert({ message, type });
  const showConfirm = (message) => new Promise((resolve) => {
    setConfirm({ message, onConfirm: () => { setConfirm(null); resolve(true); }, onCancel: () => { setConfirm(null); resolve(false); } });
  });

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); if (accessCode) loadData(); };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, [accessCode]);

  useEffect(() => {
    const session = localStorage.getItem('current_session');
    if (session) { const data = JSON.parse(session); setAccessCode(data.accessCode); setIsLoggedIn(true); }
    const seen = localStorage.getItem('hasSeenWelcome_v2');
    if (!seen) setShowWelcome(true);
  }, []);

  useEffect(() => { if (isLoggedIn && accessCode) loadData(); }, [isLoggedIn, accessCode]);
  useEffect(() => { applySortAndFilter(); }, [people, sortBy, sortOrder, searchQuery, searchField]);
  useEffect(() => {
    if (!isLoggedIn || !accessCode) return;
    const interval = setInterval(() => { if (isOnline) loadData(); }, 30000);
    return () => clearInterval(interval);
  }, [isLoggedIn, accessCode, isOnline]);

  const handleLogin = async (code) => {
    if (!code || !code.trim()) { showAlert('Please enter access code', 'warning'); return; }
    setLoading(true);
    try {
      const trimmed = code.trim();
      localStorage.setItem('current_session', JSON.stringify({ accessCode: trimmed }));
      setAccessCode(trimmed);
      setIsLoggedIn(true);
      showAlert('✅ Connected to cloud!', 'success');
    } catch (e) {
      showAlert('Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const confirmed = await showConfirm('Logout?');
    if (!confirmed) return;
    localStorage.removeItem('current_session');
    setIsLoggedIn(false);
    setAccessCode('');
    setCurrentView('search');
    setSelectedPerson(null);
    setPeople([]);
    setFilteredPeople([]);
  };

  const loadData = async () => {
    if (!isOnline) { showAlert('Offline', 'warning'); return; }
    setSyncing(true);
    try {
      const data = await supabase.getPeople(accessCode);
      const formatted = data.map(p => ({
        id: p.id, name: p.name, phone: p.phone || '', email: p.email || '', address: p.address || '',
        dob: p.dob || '', occupation: p.occupation || '', company: p.company || '', notes: p.notes || '',
        photo: p.photo || '', serialNumber: p.serial_number || '', voterListNumber: p.voter_list_number || '', createdAt: p.created_at
      }));
      setPeople(formatted);
    } catch (e) {
      showAlert('Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const applySortAndFilter = () => {
    let filtered = [...people];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => {
        if (searchField === 'all') return Object.values(p).some(v => v && v.toString().toLowerCase().includes(q));
        return p[searchField] && p[searchField].toLowerCase().includes(q);
      });
    }
    filtered.sort((a, b) => {
      let aVal = a[sortBy] || '', bVal = b[sortBy] || '';
      if (sortBy === 'createdAt') { aVal = new Date(aVal).getTime(); bVal = new Date(bVal).getTime(); }
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
    setFilteredPeople(filtered);
  };

  const convertMarathiDigits = (text) => {
    if (!text) return text;
    const map = {'०':'0','१':'1','२':'2','३':'3','४':'4','५':'5','६':'6','७':'7','८':'8','९':'9'};
    let s = String(text);
    Object.keys(map).forEach(k => s = s.replace(new RegExp(k,'g'), map[k]));
    return s;
  };

  const translateMarathi = async (text) => {
    if (!text || typeof text !== 'string' || !text.trim()) return text;
    if (/^[\d\s\+\-\(\)०-९]+$/.test(text) || /^[\w\.\-]+@[\w\.\-]+$/.test(text)) return convertMarathiDigits(text);
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=mr|en`);
      const data = await res.json();
      if (data.responseStatus === 200 && data.responseData?.translatedText) return data.responseData.translatedText.trim().replace(/^["']|["']$/g, '');
      return text;
    } catch (e) { return text; }
  };

  const handleExcelImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: 'binary' });
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '', header: 1 });
        if (data.length <= 1) { showAlert('Empty file', 'warning'); return; }
        const rows = data.slice(1);
        const shouldTranslate = await showConfirm(`Import ${rows.length} contacts with translation?`);
        setSyncing(true);
        const imported = [];
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          let name = String(row[0] || '').trim();
          const phone = convertMarathiDigits(String(row[1] || '').trim());
          let address = String(row[2] || '').trim();
          const serial = convertMarathiDigits(String(row[3] || '').trim());
          const list = convertMarathiDigits(String(row[4] || '').trim());
          let station = String(row[5] || '').trim();
          const voterId = String(row[6] || '').trim();
          if (!name && !phone) continue;
          if (shouldTranslate) {
            if (name) { name = await translateMarathi(name); await new Promise(r=>setTimeout(r,600)); }
            if (address) { address = await translateMarathi(address); await new Promise(r=>setTimeout(r,600)); }
            if (station) { station = await translateMarathi(station); await new Promise(r=>setTimeout(r,600)); }
          }
          imported.push({
            id: Date.now() + i + '', access_code: accessCode, name, phone, email: '', address, dob: '',
            occupation: station, company: voterId, notes: '', photo: '', serial_number: serial,
            voter_list_number: list, created_at: new Date().toISOString()
          });
        }
        await supabase.bulkInsert(imported);
        await loadData();
        setSyncing(false);
        showAlert(`✅ Imported ${imported.length} contacts!`, 'success');
      } catch (err) {
        setSyncing(false);
        showAlert('Import failed', 'error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) { showAlert('Select contacts', 'warning'); return; }
    const confirmed = await showConfirm(`Delete ${selectedIds.length} contacts?`);
    if (!confirmed) return;
    setSyncing(true);
    try {
      await supabase.bulkDelete(selectedIds);
      await loadData();
      setSelectedIds([]);
      setIsSelectionMode(false);
      showAlert('Deleted', 'success');
    } catch (e) {
      showAlert('Delete failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleAddPerson = async (personData) => {
    setSyncing(true);
    try {
      await supabase.insertPerson({
        id: Date.now().toString(), access_code: accessCode, name: personData.name, phone: personData.phone || '',
        email: personData.email || '', address: personData.address || '', dob: personData.dob || '',
        occupation: personData.occupation || '', company: personData.company || '', notes: personData.notes || '',
        photo: personData.photo || '', serial_number: personData.serialNumber || '',
        voter_list_number: personData.voterListNumber || '', created_at: new Date().toISOString()
      });
      await loadData();
      setCurrentView('search');
      showAlert('Added to cloud!', 'success');
    } catch (e) {
      showAlert('Add failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleEditPerson = async (personData) => {
    setSyncing(true);
    try {
      await supabase.updatePerson(personData.id, {
        name: personData.name, phone: personData.phone || '', email: personData.email || '',
        address: personData.address || '', dob: personData.dob || '', occupation: personData.occupation || '',
        company: personData.company || '', notes: personData.notes || '', photo: personData.photo || '',
        serial_number: personData.serialNumber || '', voter_list_number: personData.voterListNumber || ''
      });
      await loadData();
      setSelectedPerson(people.find(p => p.id === personData.id));
      setIsEditing(false);
      setCurrentView('profile');
      showAlert('Saved to cloud!', 'success');
    } catch (e) {
      showAlert('Update failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDeletePerson = async (id) => {
    const confirmed = await showConfirm('Delete this contact?');
    if (!confirmed) return;
    setSyncing(true);
    try {
      await supabase.deletePerson(id);
      await loadData();
      setSelectedPerson(null);
      setCurrentView('search');
      showAlert('Deleted', 'success');
    } catch (e) {
      showAlert('Delete failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(people.map(p => ({
      Name: p.name, Phone: p.phone, Email: p.email, Address: p.address, 'Voting Station': p.occupation,
      'Voter ID': p.company, 'Serial #': p.serialNumber, 'List #': p.voterListNumber
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'People');
    XLSX.writeFile(wb, `ajinkya-${new Date().toISOString().split('T')[0]}.xlsx`);
    showAlert('Exported', 'success');
  };

  const handleBackup = () => {
    const backup = { people, accessCode, date: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showAlert('Backup created', 'success');
  };

  const handleRestore = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const confirmed = await showConfirm('Restore will upload to cloud. Continue?');
    if (!confirmed) return;
    setSyncing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const backup = JSON.parse(evt.target.result);
        const toInsert = backup.people.map(p => ({
          id: p.id || Date.now() + Math.random() + '', access_code: accessCode, name: p.name,
          phone: p.phone || '', email: p.email || '', address: p.address || '', dob: p.dob || '',
          occupation: p.occupation || '', company: p.company || '', notes: p.notes || '', photo: p.photo || '',
          serial_number: p.serialNumber || '', voter_list_number: p.voterListNumber || '', created_at: new Date().toISOString()
        }));
        await supabase.bulkInsert(toInsert);
        await loadData();
        showAlert('Restored!', 'success');
      } catch (err) {
        showAlert('Restore failed', 'error');
      } finally {
        setSyncing(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} loading={loading} />;

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100'}`}>
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      {confirm && <CustomConfirm message={confirm.message} onConfirm={confirm.onConfirm} onCancel={confirm.onCancel} />}
      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showWelcome && <WelcomeModal onClose={() => { setShowWelcome(false); localStorage.setItem('hasSeenWelcome_v2', 'true'); }} />}

      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-5xl">✌️</div>
            <div>
              <h1 className="text-3xl font-black text-white">Ajinkya</h1>
              <p className="text-xs text-white/80">Cloud Directory</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4">
            {syncing && <p className="text-xs text-white/70">⟳ Syncing...</p>}
            {isOnline ? <Wifi size={16} className="text-green-300" /> : <WifiOff size={16} className="text-red-300" />}
            <button onClick={() => setShowHelp(true)} className="text-white/80 hover:text-white"><HelpCircle size={20} /></button>
            <button onClick={() => setDarkMode(!darkMode)} className="text-white/80 hover:text-white">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
            <span className="text-sm text-white/90 flex items-center gap-2 bg-white/20 px-3 py-2 rounded-full">
              <User size={16} />{accessCode}
            </span>
            <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2 bg-white/20 text-white rounded-full hover:bg-white/30">
              <LogOut size={16} />Logout
            </button>
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-white"><Menu size={24} /></button>
        </div>
        {showMobileMenu && (
          <div className="md:hidden bg-white/10 backdrop-blur-lg border-t border-white/20 p-4 space-y-2">
            <button onClick={() => { setShowHelp(true); setShowMobileMenu(false); }} className="w-full text-left text-white py-2 px-4 rounded hover:bg-white/20">📚 Help</button>
            <button onClick={() => { setDarkMode(!darkMode); setShowMobileMenu(false); }} className="w-full text-left text-white py-2 px-4 rounded hover:bg-white/20">{darkMode ? '☀️' : '🌙'} Theme</button>
            <button onClick={handleLogout} className="w-full text-left text-white py-2 px-4 rounded hover:bg-white/20">🚪 Logout</button>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'search' && (
          <SearchView
            searchQuery={searchQuery} searchField={searchField}
            onSearch={(q, f) => { setSearchQuery(q); setSearchField(f); }}
            filteredPeople={filteredPeople}
            onSelectPerson={(p) => { if (!isSelectionMode) { setSelectedPerson(p); setCurrentView('profile'); }}}
            onAddNew={() => setCurrentView('add')}
            onImport={handleExcelImport} onExport={handleExport}
            onBackup={handleBackup} onRestore={handleRestore}
            totalRecords={people.length}
            isSelectionMode={isSelectionMode} selectedIds={selectedIds}
            onToggleSelection={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])}
            onSelectAll={() => setSelectedIds(selectedIds.length === filteredPeople.length ? [] : filteredPeople.map(p => p.id))}
            onEnableSelection={() => setIsSelectionMode(true)}
            onCancelSelection={() => { setIsSelectionMode(false); setSelectedIds([]); }}
            onBulkDelete={handleBulkDelete}
            sortBy={sortBy} sortOrder={sortOrder}
            onSort={(field) => {
              if (sortBy === field) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              else { setSortBy(field); setSortOrder('asc'); }
            }}
            darkMode={darkMode}
          />
        )}

        {currentView === 'profile' && selectedPerson && !isEditing && (
          <ProfileView
            person={people.find(p => p.id === selectedPerson.id) || selectedPerson}
            onBack={() => { setSelectedPerson(null); setCurrentView('search'); }}
            onEdit={() => setIsEditing(true)}
            onDelete={handleDeletePerson}
            darkMode={darkMode}
          />
        )}

        {currentView === 'profile' && selectedPerson && isEditing && (
          <AddEditForm
            person={people.find(p => p.id === selectedPerson.id) || selectedPerson}
            onSave={handleEditPerson}
            onCancel={() => setIsEditing(false)}
            isEdit={true}
            darkMode={darkMode}
          />
        )}
        
        {currentView === 'add' && (
          <AddEditForm
            onSave={handleAddPerson}
            onCancel={() => setCurrentView('search')}
            darkMode={darkMode}
          />
        )}
      </div>

      <Footer darkMode={darkMode} totalRecords={people.length} isOnline={isOnline} />
    </div>
  );
};

const LoginScreen = ({ onLogin, loading }) => {
  const [code, setCode] = useState('');
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md border-4 border-purple-200">
        <div className="flex flex-col items-center mb-6">
          <div className="text-7xl mb-4">✌️</div>
          <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 mb-2">Ajinkya</h2>
          <p className="text-center text-gray-600 text-sm">Cloud Directory</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Access Code</label>
            <input 
              type="text" 
              value={code} 
              onChange={(e) => setCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && code.trim() && onLogin(code.trim())}
              className="w-full px-5 py-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-purple-500 transition text-lg"
              placeholder="Enter code" 
              disabled={loading} 
            />
            <p className="text-xs text-gray-500 mt-2">Same code = Same data!</p>
          </div>
          <button 
            onClick={() => code.trim() && onLogin(code.trim())} 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl hover:bg-indigo-700 font-bold text-lg disabled:opacity-50"
          >
            {loading ? 'Connecting...' : '☁️ Access Cloud'}
          </button>
        </div>
        <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-purple-200">
          <p className="text-sm text-gray-700 font-semibold mb-2">✨ First time?</p>
          <p className="text-xs text-gray-600">Enter any code. Share with team for instant sync!</p>
        </div>
      </div>
    </div>
  );
};

const SearchView = ({ searchQuery, searchField, onSearch, filteredPeople, onSelectPerson, onAddNew, onImport, onExport, onBackup, onRestore, totalRecords, isSelectionMode, selectedIds, onToggleSelection, onSelectAll, onEnableSelection, onCancelSelection, onBulkDelete, sortBy, sortOrder, onSort, darkMode }) => {
  const [showSort, setShowSort] = useState(false);
  const sortRef = useRef(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-6">
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg p-6 border-2 border-purple-100`}>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              value={searchField} 
              onChange={(e) => onSearch(searchQuery, e.target.value)}
              className={`px-4 py-3 border-2 rounded-xl font-semibold ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-700 border-gray-300'}`}
            >
              <option value="all">🔍 All</option>
              <option value="name">👤 Name</option>
              <option value="phone">📱 Phone</option>
              <option value="address">📍 Address</option>
            </select>
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3 text-purple-400" size={22} />
              <input 
                type="text" 
                value={searchQuery} 
                onChange={(e) => onSearch(e.target.value, searchField)}
                placeholder="Search..." 
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-300'}`} 
              />
            </div>
            <div className="relative" ref={sortRef}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSort(!showSort);
                }} 
                className="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold whitespace-nowrap"
              >
                <ArrowUpDown size={20} className="inline" /> Sort
              </button>
              {showSort && (
                <div className={`absolute right-0 mt-2 ${darkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-xl shadow-2xl border-2 p-2 z-10 min-w-48`}>
                  {['name', 'phone', 'createdAt'].map(f => (
                    <button 
                      key={f} 
                      onClick={(e) => { 
                        e.stopPropagation();
                        onSort(f); 
                        setShowSort(false); 
                      }}
                      className={`w-full text-left px-4 py-2 rounded ${sortBy === f ? (darkMode ? 'bg-purple-900 text-white' : 'bg-purple-100') + ' font-bold' : ''} ${darkMode ? 'text-white hover:bg-gray-700' : 'hover:bg-purple-50'}`}
                    >
                      {f === 'name' && '👤 Name'}{f === 'phone' && '📱 Phone'}{f === 'createdAt' && '📅 Date'}
                      {sortBy === f && (sortOrder === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          {!isSelectionMode ? (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onAddNew(); }} 
                className="px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold whitespace-nowrap"
              >
                <Plus size={20} className="inline" /> Add
              </button>
              <label className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 cursor-pointer font-bold whitespace-nowrap">
                <Upload size={20} className="inline" /> Import
                <input type="file" accept=".xlsx,.xls" onChange={onImport} className="hidden" />
              </label>
              <button 
                onClick={(e) => { e.stopPropagation(); onExport(); }} 
                className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold whitespace-nowrap"
              >
                <Download size={20} className="inline" /> Export
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onBackup(); }} 
                className="px-5 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-bold whitespace-nowrap"
              >
                💾 Backup
              </button>
              <label className="px-5 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 cursor-pointer font-bold whitespace-nowrap">
                <RotateCcw size={20} className="inline" /> Restore
                <input type="file" accept=".json" onChange={onRestore} className="hidden" />
              </label>
              <button 
                onClick={(e) => { e.stopPropagation(); onEnableSelection(); }} 
                className="px-5 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold whitespace-nowrap"
              >
                <Trash2 size={20} className="inline" /> Delete
              </button>
              <div className="ml-auto">
                <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">📊 {totalRecords}</span>
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); onSelectAll(); }} 
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-semibold"
              >
                {selectedIds.length === filteredPeople.length ? 'Deselect' : 'Select All'}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onBulkDelete(); }} 
                disabled={selectedIds.length === 0} 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 font-semibold"
              >
                <Trash2 size={20} className="inline" /> Delete {selectedIds.length}
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onCancelSelection(); }} 
                className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 font-semibold"
              >
                <X size={20} className="inline" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPeople.map(p => (
          <div 
            key={p.id} 
            onClick={(e) => {
              e.stopPropagation();
              isSelectionMode ? onToggleSelection(p.id) : onSelectPerson(p);
            }}
            className={`rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-2xl transition border-2 ${
              isSelectionMode && selectedIds.includes(p.id) 
                ? 'border-red-500 bg-red-50' 
                : darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-purple-100'
            }`}
          >
            {isSelectionMode && (
              <input 
                type="checkbox" 
                checked={selectedIds.includes(p.id)} 
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleSelection(p.id);
                }}
                className="float-right w-5 h-5" 
              />
            )}
            <div className="flex gap-4">
              {p.photo && <img src={p.photo} alt={p.name} className="w-16 h-16 rounded-full object-cover border-2 border-purple-300" />}
              <div className="flex-1">
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{p.name}</h3>
                <div className={`space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                  <p>📞 {p.phone}</p>
                  {p.occupation && <p>🗳️ {p.occupation}</p>}
                  {p.company && <p>🆔 {p.company}</p>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredPeople.length === 0 && (
        <div className={`text-center py-12 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl`}>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No results</p>
        </div>
      )}
    </div>
  );
};

const ProfileView = ({ person, onBack, onEdit, onDelete, darkMode }) => {
  const [isCapturing, setIsCapturing] = useState(false);
  const [alert, setAlert] = useState(null);
  const ref = useRef(null);

  const share = async () => {
    if (!ref.current) return;
    setIsCapturing(true);
    
    try {
      const html2canvas = await import('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/+esm').then(m => m.default);
      
      // Store original styles
      const originalWidth = ref.current.style.width;
      const originalMaxWidth = ref.current.style.maxWidth;
      
      // Hide buttons before capture
      const backButton = ref.current.querySelector('.back-button');
      const actionButtons = ref.current.querySelector('.action-buttons');
      if (backButton) backButton.style.display = 'none';
      if (actionButtons) actionButtons.style.display = 'none';
      
      // Set fixed width to prevent white borders
      ref.current.style.width = '800px';
      ref.current.style.maxWidth = '800px';
      
      // Capture with precise settings
      const canvas = await html2canvas(ref.current, { 
        backgroundColor: '#ffffff', 
        scale: 2,
        width: 800,
        windowWidth: 800,
        scrollX: 0,
        scrollY: 0,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      // Restore original styles
      ref.current.style.width = originalWidth;
      ref.current.style.maxWidth = originalMaxWidth;
      if (backButton) backButton.style.display = '';
      if (actionButtons) actionButtons.style.display = '';
      
      // Crop canvas to remove any extra white space
      const ctx = canvas.getContext('2d');
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const { width, height, data } = imageData;
      
      // Find actual content bounds (non-white pixels)
      let minX = width, minY = height, maxX = 0, maxY = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
          // Check if pixel is not pure white
          if (!(r === 255 && g === 255 && b === 255 && a === 255)) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      
      // Create cropped canvas
      const croppedWidth = maxX - minX + 1;
      const croppedHeight = maxY - minY + 1;
      const croppedCanvas = document.createElement('canvas');
      croppedCanvas.width = croppedWidth;
      croppedCanvas.height = croppedHeight;
      const croppedCtx = croppedCanvas.getContext('2d');
      croppedCtx.drawImage(canvas, minX, minY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);
      
      croppedCanvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], `${person.name.replace(/\s+/g, '_')}_contact.png`, { type: 'image/png' });
          
          // Try native share first (works on mobile)
          if (navigator.canShare?.({ files: [file] })) {
            try { 
              await navigator.share({ 
                files: [file], 
                title: `${person.name} - Contact Info`,
                text: `Contact details for ${person.name}`
              }); 
            } catch (e) { 
              if (e.name !== 'AbortError') download(croppedCanvas); 
            }
          } else {
            // Fallback to download
            download(croppedCanvas);
          }
        }
        setIsCapturing(false);
      }, 'image/png', 1.0);
    } catch (e) {
      setIsCapturing(false);
      setAlert({ message: 'Share failed', type: 'error' });
    }
  };

  const download = (canvas) => {
    const a = document.createElement('a');
    a.download = `${person.name.replace(/\s+/g, '_')}_contact.png`;
    a.href = canvas.toDataURL('image/png', 1.0);
    a.click();
    setAlert({ message: 'Downloaded!', type: 'success' });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      
      <div ref={ref} className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden border-2`}>
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
          <button 
            onClick={(e) => { e.stopPropagation(); onBack(); }} 
            className="back-button mb-4 text-white/80 hover:text-white flex items-center gap-2 font-semibold"
          >
            ← Back
          </button>
          <div className="flex items-center gap-6">
            {person.photo && <img src={person.photo} alt={person.name} className="w-24 h-24 rounded-full object-cover border-4 border-white" />}
            <h1 className="text-4xl font-bold">{person.name}</h1>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {person.phone && (
            <div>
              <label className="text-sm font-semibold text-purple-600">Phone</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.phone}</p>
            </div>
          )}
          {person.address && (
            <div>
              <label className="text-sm font-semibold text-purple-600">Address</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.address}</p>
            </div>
          )}
          {person.dob && (
            <div>
              <label className="text-sm font-semibold text-purple-600">DOB</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.dob}</p>
            </div>
          )}
          {person.email && (
            <div>
              <label className="text-sm font-semibold text-purple-600">Email</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.email}</p>
            </div>
          )}
          {person.serialNumber && (
            <div>
              <label className="text-sm font-semibold text-purple-600">Serial Number</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.serialNumber}</p>
            </div>
          )}
          {person.company && (
            <div>
              <label className="text-sm font-semibold text-purple-600">Voter ID</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.company}</p>
            </div>
          )}
          {person.voterListNumber && (
            <div>
              <label className="text-sm font-semibold text-purple-600">List Number</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.voterListNumber}</p>
            </div>
          )}
          {person.occupation && (
            <div>
              <label className="text-sm font-semibold text-purple-600">Station</label>
              <p className={`text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{person.occupation}</p>
            </div>
          )}
        </div>
        
        <div className={`action-buttons p-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} flex gap-3 justify-end flex-wrap`}>
          <button 
            onClick={(e) => { e.stopPropagation(); share(); }} 
            disabled={isCapturing} 
            className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 font-bold"
          >
            <Share2 size={18} className="inline" /> {isCapturing ? 'Capturing...' : 'Share'}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); window.print(); }} 
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold"
          >
            <Printer size={18} className="inline" /> Print
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(); }} 
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold"
          >
            <Edit2 size={18} className="inline" /> Edit
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(person.id); }} 
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-bold"
          >
            <Trash2 size={18} className="inline" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const AddEditForm = ({ person, onSave, onCancel, isEdit, darkMode }) => {
  const [formData, setFormData] = useState(person || { 
    name: '', phone: '', email: '', address: '', dob: '', 
    occupation: '', company: '', notes: '', photo: '', 
    serialNumber: '', voterListNumber: '' 
  });
  const [alert, setAlert] = useState(null);

  useEffect(() => { 
    if (person) setFormData(person); 
  }, [person]);

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { 
      setAlert({ message: 'Photo must be < 2MB', type: 'warning' }); 
      return; 
    }
    const reader = new FileReader();
    reader.onload = (evt) => setFormData(p => ({ ...p, photo: evt.target.result }));
    reader.readAsDataURL(file);
  };

  const takePhoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = handlePhoto;
    input.click();
  };

  const submit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!formData.name) { 
      setAlert({ message: 'Name required', type: 'warning' }); 
      return; 
    }
    onSave({ ...formData, id: formData.id || Date.now().toString() });
  };

  return (
    <div className="max-w-4xl mx-auto">
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8 border-2`}>
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-6">
          {isEdit ? 'Edit' : 'Add'} Person
        </h2>
        
        <form onSubmit={submit} className="space-y-6">
          <div className={`flex flex-col items-center gap-4 p-6 rounded-xl border-2 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'}`}>
            {formData.photo ? (
              <div className="relative">
                <img src={formData.photo} alt="Preview" className="w-32 h-32 rounded-full object-cover border-4 border-purple-500" />
                <button 
                  type="button" 
                  onClick={(e) => { e.stopPropagation(); setFormData(p => ({ ...p, photo: '' })); }} 
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-purple-100 flex items-center justify-center border-2 border-purple-300">
                <User size={48} className="text-purple-400" />
              </div>
            )}
            <div className="flex gap-3">
              <label className="cursor-pointer px-5 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold">
                📁 {formData.photo ? 'Change' : 'Choose'}
                <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
              </label>
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); takePhoto(); }} 
                className="px-5 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold"
              >
                📸 Take
              </button>
            </div>
            <p className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Max 2MB</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Name *" value={formData.name} onChange={(v) => setFormData(p => ({ ...p, name: v }))} darkMode={darkMode} />
            <FormField label="Phone" value={formData.phone} onChange={(v) => setFormData(p => ({ ...p, phone: v }))} darkMode={darkMode} />
            <FormField label="Email" type="email" value={formData.email} onChange={(v) => setFormData(p => ({ ...p, email: v }))} darkMode={darkMode} />
            <FormField label="DOB" type="date" value={formData.dob} onChange={(v) => setFormData(p => ({ ...p, dob: v }))} darkMode={darkMode} />
            <FormField label="Station" value={formData.occupation} onChange={(v) => setFormData(p => ({ ...p, occupation: v }))} darkMode={darkMode} />
            <FormField label="Voter ID" value={formData.company} onChange={(v) => setFormData(p => ({ ...p, company: v }))} darkMode={darkMode} />
            <FormField label="Serial #" value={formData.serialNumber} onChange={(v) => setFormData(p => ({ ...p, serialNumber: v }))} darkMode={darkMode} />
            <FormField label="List #" value={formData.voterListNumber} onChange={(v) => setFormData(p => ({ ...p, voterListNumber: v }))} darkMode={darkMode} />
          </div>
          
          <FormField label="Address" value={formData.address} onChange={(v) => setFormData(p => ({ ...p, address: v }))} fullWidth darkMode={darkMode} />
          
          <div className="flex gap-3 justify-end pt-4">
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); onCancel(); }} 
              className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold"
            >
              {isEdit ? '✅ Save' : '➕ Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const FormField = ({ label, value, onChange, type = 'text', fullWidth, darkMode }) => (
  <div className={fullWidth ? 'col-span-full' : ''}>
    <label className={`block text-sm font-bold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
      {label}
    </label>
    <input 
      type={type} 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 ${
        darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-purple-200'
      }`} 
    />
  </div>
);

const Footer = ({ darkMode, totalRecords, isOnline }) => (
  <footer className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} border-t mt-12`}>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-sm">
          <p className="font-semibold">© 2024 Ajinkya Directory</p>
          <p className="text-xs mt-1">{totalRecords} contacts • Cloud {isOnline ? '✓' : '✗'} • v2.0</p>
        </div>
        <div className="flex gap-4 text-sm">
          <a href="#" className="hover:text-purple-600">Privacy</a>
          <a href="#" className="hover:text-purple-600">Terms</a>
          <a href="#" className="hover:text-purple-600">Support</a>
        </div>
      </div>
    </div>
  </footer>
);

export default PeopleDirectoryApp;