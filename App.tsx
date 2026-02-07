
import React, { useState, useEffect } from 'react';
import { GKConfig, TeleportPoint, TeleportCategory, TeleportSubCategory, GenerationType } from './types';
import { generateL2JFiles } from './services/geminiService';
import { L2Button } from './components/L2Button';
import { L2DialogPreview } from './components/L2DialogPreview';

const STORAGE_KEY = 'l2j_gk_config_backup';

const INITIAL_CONFIG: GKConfig = {
  npcId: "90001",
  npcName: "Global GK",
  npcTitle: "Teleporter",
  categories: [
    {
      id: "cat_1",
      name: "Town Areas",
      points: [],
      subCategories: [
        {
          id: "sub_1",
          name: "Giran",
          points: [
            { id: "tp_1", name: "Town Center", x: 82698, y: 148638, z: -3473, price: 0 },
            { id: "tp_2", name: "Weapon Shop", x: 82220, y: 149200, z: -3470, price: 0 }
          ]
        }
      ]
    }
  ]
};

const App: React.FC = () => {
  // Načtení z localStorage při startu
  const [config, setConfig] = useState<GKConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_CONFIG;
  });

  const [activeTab, setActiveTab] = useState<'editor' | 'preview' | 'code'>('editor');
  const [generatedCode, setGeneratedCode] = useState<{ [key in GenerationType]?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeCodeType, setActiveCodeType] = useState<GenerationType>('HTML');

  // Automatické ukládání při každé změně
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }, [config]);

  const updateNpcField = (field: keyof GKConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    const newCat: TeleportCategory = { id: `cat_${Date.now()}`, name: "New Category", subCategories: [], points: [] };
    setConfig(prev => ({ ...prev, categories: [...prev.categories, newCat] }));
  };

  const removeCategory = (catId: string) => {
    setConfig(prev => ({ ...prev, categories: prev.categories.filter(c => c.id !== catId) }));
  };

  const addSubCategory = (catId: string) => {
    const newSub: TeleportSubCategory = { id: `sub_${Date.now()}`, name: "New Sub-Category", points: [] };
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, subCategories: [...c.subCategories, newSub] } : c)
    }));
  };

  const addTeleportToSub = (catId: string, subId: string) => {
    const newPoint: TeleportPoint = { id: `tp_${Date.now()}`, name: "New Spot", x: 0, y: 0, z: 0, price: 0 };
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? {
        ...c,
        subCategories: c.subCategories.map(s => s.id === subId ? { ...s, points: [...s.points, newPoint] } : s)
      } : c)
    }));
  };

  const addTeleportToCat = (catId: string) => {
    const newPoint: TeleportPoint = { id: `tp_${Date.now()}`, name: "Direct Spot", x: 0, y: 0, z: 0, price: 0 };
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, points: [...c.points, newPoint] } : c)
    }));
  };

  const updatePointInSub = (catId: string, subId: string, ptId: string, field: keyof TeleportPoint, value: any) => {
    setConfig(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? {
        ...c,
        subCategories: c.subCategories.map(s => s.id === subId ? {
          ...s,
          points: s.points.map(p => p.id === ptId ? { ...p, [field]: value } : p)
        } : s)
      } : c)
    }));
  };

  const handleGenerate = async (type: GenerationType) => {
    setIsGenerating(true);
    const code = await generateL2JFiles(config, type);
    setGeneratedCode(prev => ({ ...prev, [type]: code }));
    setActiveCodeType(type);
    setActiveTab('code');
    setIsGenerating(false);
  };

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `gk_config_${config.npcId}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0f172a]">
      <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-10V4m0 10V4m0 10h1m-1 4h1m-1 4h1" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 leading-tight">L2J Global GK Architect</h1>
              <span className="text-[10px] text-blue-400 font-mono">MOBÍUS INTERLUDE COMPATIBLE</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
              {['editor', 'preview', 'code'].map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-4 md:px-6 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
            <button onClick={exportConfig} className="p-2 text-slate-400 hover:text-white transition-colors" title="Export Config to JSON">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <section className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                <h2 className="text-lg font-semibold text-slate-100 mb-4">NPC Meta Data</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">NPC ID</label>
                    <input type="text" value={config.npcId} onChange={(e) => updateNpcField('npcId', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1 uppercase">NPC Name</label>
                    <input type="text" value={config.npcName} onChange={(e) => updateNpcField('npcName', e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:ring-2 focus:ring-blue-500/50" />
                  </div>
                </div>
              </section>
              <div className="bg-blue-900/20 border border-blue-900/30 p-4 rounded-xl">
                <p className="text-sm text-slate-300">Aplikace se automaticky ukládá. Můžete ji bez obav zavřít a později pokračovat tam, kde jste skončili.</p>
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-slate-100">Hierarchy Editor</h2>
                <L2Button label="+ Main Category" onClick={addCategory} />
              </div>

              {config.categories.map((cat) => (
                <div key={cat.id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden mb-6">
                  <div className="bg-slate-800/80 px-4 py-3 flex justify-between items-center border-b border-slate-700">
                    <input className="bg-transparent border-none focus:ring-0 text-blue-400 font-bold text-lg w-full" value={cat.name} onChange={(e) => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, name: e.target.value} : c)}))} />
                    <div className="flex gap-2 shrink-0">
                      <L2Button label="+ Sub" onClick={() => addSubCategory(cat.id)} variant="secondary" className="px-3 py-1 text-xs" />
                      <L2Button label="+ Spot" onClick={() => addTeleportToCat(cat.id)} variant="secondary" className="px-3 py-1 text-xs bg-emerald-700/50 hover:bg-emerald-600/50" />
                      <L2Button label="Delete" onClick={() => removeCategory(cat.id)} variant="danger" className="px-3 py-1 text-xs" />
                    </div>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Direct Points in Category */}
                    {cat.points.map((p) => (
                      <div key={p.id} className="grid grid-cols-6 gap-2 bg-emerald-900/10 p-2 rounded border border-emerald-900/30">
                         <input className="col-span-2 bg-slate-800 border-none text-xs rounded px-2" value={p.name} onChange={(e) => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, points: c.points.map(pt => pt.id === p.id ? {...pt, name: e.target.value} : pt)} : c)}))} placeholder="Spot Name" />
                         <input type="number" className="bg-slate-800 border-none text-xs rounded px-1" value={p.x} onChange={(e) => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, points: c.points.map(pt => pt.id === p.id ? {...pt, x: parseInt(e.target.value)} : pt)} : c)}))} placeholder="X" />
                         <input type="number" className="bg-slate-800 border-none text-xs rounded px-1" value={p.y} onChange={(e) => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, points: c.points.map(pt => pt.id === p.id ? {...pt, y: parseInt(e.target.value)} : pt)} : c)}))} placeholder="Y" />
                         <input type="number" className="bg-slate-800 border-none text-xs rounded px-1" value={p.z} onChange={(e) => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, points: c.points.map(pt => pt.id === p.id ? {...pt, z: parseInt(e.target.value)} : pt)} : c)}))} placeholder="Z" />
                         <button onClick={() => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, points: c.points.filter(pt => pt.id !== p.id)} : c)}))} className="text-red-500 hover:text-red-400 flex items-center justify-center">×</button>
                      </div>
                    ))}

                    {/* Sub-categories */}
                    {cat.subCategories.map((sub) => (
                      <div key={sub.id} className="ml-6 border-l-2 border-slate-700 pl-4 space-y-3">
                        <div className="flex justify-between items-center">
                           <input className="bg-transparent border-none focus:ring-0 text-emerald-400 font-medium w-full" value={sub.name} onChange={(e) => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, subCategories: c.subCategories.map(s => s.id === sub.id ? {...s, name: e.target.value} : s)} : c)}))} />
                           <div className="flex gap-2 shrink-0">
                              <L2Button label="+ Spot" onClick={() => addTeleportToSub(cat.id, sub.id)} variant="secondary" className="px-2 py-0.5 text-[10px]" />
                              <button onClick={() => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, subCategories: c.subCategories.filter(s => s.id !== sub.id)} : c)}))} className="text-red-400 hover:text-red-300 text-xs">Remove</button>
                           </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {sub.points.map((p) => (
                            <div key={p.id} className="grid grid-cols-6 gap-2 bg-slate-900/40 p-2 rounded border border-slate-800">
                               <input className="col-span-2 bg-slate-800 border-none text-xs rounded px-2" value={p.name} onChange={(e) => updatePointInSub(cat.id, sub.id, p.id, 'name', e.target.value)} placeholder="Spot Name" />
                               <input type="number" className="bg-slate-800 border-none text-xs rounded px-1" value={p.x} onChange={(e) => updatePointInSub(cat.id, sub.id, p.id, 'x', parseInt(e.target.value))} placeholder="X" />
                               <input type="number" className="bg-slate-800 border-none text-xs rounded px-1" value={p.y} onChange={(e) => updatePointInSub(cat.id, sub.id, p.id, 'y', parseInt(e.target.value))} placeholder="Y" />
                               <input type="number" className="bg-slate-800 border-none text-xs rounded px-1" value={p.z} onChange={(e) => updatePointInSub(cat.id, sub.id, p.id, 'z', parseInt(e.target.value))} placeholder="Z" />
                               <button onClick={() => setConfig(prev => ({...prev, categories: prev.categories.map(c => c.id === cat.id ? {...c, subCategories: c.subCategories.map(s => s.id === sub.id ? {...s, points: s.points.filter(pt => pt.id !== p.id)} : s)} : c)}))} className="text-red-500 hover:text-red-400 flex items-center justify-center">×</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in duration-300">
             <div className="text-center mb-12">
                <h2 className="text-2xl font-bold text-slate-100 mb-2">In-Game UI Simulation</h2>
                <p className="text-slate-400 text-sm italic">Click on category buttons to test the navigation!</p>
             </div>
             <div className="relative p-8 md:p-16 rounded-[40px] bg-[#1a1a1a] shadow-2xl border border-white/5 overflow-hidden">
                <L2DialogPreview config={config} />
             </div>
          </div>
        )}

        {activeTab === 'code' && (
          <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
            <div className="flex flex-wrap gap-3">
              {(['HTML', 'NPC_XML', 'TELEPORT_XML', 'JAVA'] as GenerationType[]).map((type) => (
                <L2Button key={type} label={isGenerating && activeCodeType === type ? `Generating...` : `Generate ${type}`} onClick={() => handleGenerate(type)} variant={activeCodeType === type ? 'primary' : 'secondary'} className="min-w-[140px]" />
              ))}
            </div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="bg-slate-800 px-4 py-2 flex justify-between items-center border-b border-slate-700">
                <span className="text-xs font-mono text-blue-500 font-bold uppercase">{activeCodeType} OUTPUT</span>
              </div>
              <textarea readOnly className="w-full h-[500px] bg-[#0a0f1d] text-emerald-400 font-mono text-sm p-6 focus:outline-none resize-none overflow-y-auto" value={generatedCode[activeCodeType] || "Select a file type to generate code..."} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
