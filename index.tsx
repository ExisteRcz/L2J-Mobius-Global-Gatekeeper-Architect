import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- TYPES ---
interface TeleportPoint { id: string; name: string; x: number; y: number; z: number; price: number; }
interface TeleportSubCategory { id: string; name: string; points: TeleportPoint[]; }

type CategoryItem = 
  | { type: 'point', data: TeleportPoint }
  | { type: 'sub', data: TeleportSubCategory };

interface TeleportCategory { id: string; name: string; items: CategoryItem[]; }
interface GKConfig { npcId: string; npcName: string; npcTitle: string; skinId: string; categories: TeleportCategory[]; }
type GenerationType = 'HTML' | 'NPC_XML' | 'TELEPORT_XML' | 'JAVA';

const STORAGE_KEY = 'l2j_gk_monolith_v4';
const INITIAL_CONFIG: GKConfig = {
  npcId: "90001", npcName: "Global Gatekeeper", npcTitle: "Teleporter", skinId: "20001",
  categories: [
    { 
      id: "cat_1", 
      name: "Town Areas", 
      items: [
        {
          type: 'point',
          data: { id: "p_init", name: "Giran Harbor", x: 47450, y: 186638, z: -3473, price: 5000 }
        },
        {
          type: 'sub',
          data: { 
            id: "sub_1", 
            name: "Hunting Grounds", 
            points: [
              { id: "tp_1", name: "Dragon Valley", x: 147450, y: 26741, z: -2208, price: 10000 }
            ] 
          }
        }
      ] 
    }
  ]
};

// --- HELPERS ---
const moveInArray = (arr: any[], index: number, direction: 'up' | 'down') => {
  const newArr = [...arr];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex >= 0 && targetIndex < newArr.length) {
    [newArr[index], newArr[targetIndex]] = [newArr[targetIndex], newArr[index]];
  }
  return newArr;
};

// --- COMPONENTS ---
const MoveButtons: React.FC<{ onUp: () => void; onDown: () => void; isFirst: boolean; isLast: boolean }> = ({ onUp, onDown, isFirst, isLast }) => (
  <div className="flex gap-1 shrink-0">
    <button disabled={isFirst} onClick={onUp} title="Move Up" className="w-7 h-7 flex items-center justify-center bg-slate-800 border border-slate-700 rounded hover:bg-slate-600 disabled:opacity-10 text-slate-400 hover:text-white transition-all">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 15l7-7 7 7"></path></svg>
    </button>
    <button disabled={isLast} onClick={onDown} title="Move Down" className="w-7 h-7 flex items-center justify-center bg-slate-800 border border-slate-700 rounded hover:bg-slate-600 disabled:opacity-10 text-slate-400 hover:text-white transition-all">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
    </button>
  </div>
);

const L2Button: React.FC<{ label: string; onClick: () => void; variant?: 'primary' | 'secondary' | 'danger' | 'orange' | 'blue'; className?: string }> = ({ label, onClick, variant = 'primary', className = '' }) => {
  const v = { 
    primary: "bg-blue-600 hover:bg-blue-500 text-white border-blue-700", 
    secondary: "bg-slate-700/50 hover:bg-slate-600 text-slate-300 border-slate-600", 
    danger: "bg-red-900/60 hover:bg-red-800 text-red-100 border-red-800",
    orange: "bg-[#f59e0b] hover:bg-[#fbbf24] text-white border-[#d97706]",
    blue: "bg-[#2563eb] hover:bg-[#3b82f6] text-white border-[#1d4ed8]"
  };
  return <button onClick={onClick} className={`px-4 py-1.5 rounded-md font-bold text-[11px] border shadow-sm transition-all uppercase tracking-tight ${v[variant]} ${className}`}>{label}</button>;
};

const L2InGameButton: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
  <div className="relative group cursor-pointer w-full h-[22px] mb-1" onClick={onClick}>
    <div className="absolute inset-0 border border-[#5c5440] bg-[#0b0b0b]"></div>
    <div className="absolute inset-[1px] border border-[#1a1a1a] bg-gradient-to-b from-[#2a3038] to-[#12151a] group-hover:from-[#3a424d] group-hover:to-[#1a1f26] flex items-center justify-center px-1">
      <span className="text-[#cebb9a] text-[10px] font-medium truncate group-hover:text-white uppercase l2-font tracking-tighter">{label}</span>
    </div>
  </div>
);

const L2DialogPreview: React.FC<{ config: GKConfig }> = ({ config }) => {
  const [navPath, setNavPath] = useState<string[]>([]); // [catId, subId]
  
  const currentCat = config.categories.find(c => c.id === navPath[0]);
  const currentSubItem = currentCat?.items.find(item => item.type === 'sub' && item.data.id === navPath[1]);
  const currentSub = currentSubItem?.type === 'sub' ? currentSubItem.data : null;

  const items = !navPath[0] 
    ? config.categories 
    : !navPath[1] 
      ? currentCat?.items.map(i => i.data) 
      : currentSub?.points;

  const handleBack = () => setNavPath(p => p.slice(0, -1));

  return (
    <div className="flex flex-col items-center gap-6 w-full py-12">
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold text-white uppercase tracking-widest">In-Game UI</h2>
        <p className="text-slate-500 text-xs">Verify your menu hierarchy and layout</p>
      </div>

      <div className="relative bg-[#000]/95 border border-[#383d44] w-[320px] shadow-[0_0_60px_rgba(0,0,0,0.9)] select-none l2-font overflow-hidden rounded-sm">
        <div className="bg-gradient-to-b from-[#2a3749] to-[#0b0b0b] h-[22px] flex items-center px-2 justify-between border-b border-[#1c1e22]">
          <div className="flex items-center gap-1">
             <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[6px] border-l-[#b09868]"></div>
             <span className="text-[#f0f0f0] text-[9px] font-bold">Gatekeeper</span>
          </div>
          <button className="text-white text-[10px] opacity-40">×</button>
        </div>

        <div className="p-3 min-h-[440px] flex flex-col bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]">
          <div className="flex justify-between items-center mb-6 mt-1 px-1">
            <button onClick={() => setNavPath([])} className="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 text-[#cebb9a] text-[8px] hover:text-white transition-colors uppercase">Main</button>
            <div className="flex flex-col items-center flex-1 mx-2">
                <span className="text-[#e1c16e] text-[11px] font-bold uppercase truncate max-w-[140px] leading-tight text-center drop-shadow-sm">{config.npcName}</span>
                <span className="text-[#a0a0a0] text-[8px] uppercase tracking-tighter leading-none">{config.npcTitle}</span>
            </div>
            <button onClick={handleBack} className="bg-[#1a1a1a] border border-[#333] px-2 py-0.5 text-[#cebb9a] text-[8px] hover:text-white transition-colors uppercase">Back</button>
          </div>

          <div className="flex-1 px-3">
             <div className="grid grid-cols-2 gap-x-2 gap-y-1">
               {items?.map((item: any) => (
                 <L2InGameButton 
                    key={item.id} 
                    label={item.name} 
                    onClick={() => {
                      if (navPath.length === 0) {
                        setNavPath([item.id]);
                      } else if (navPath.length === 1) {
                        const isSub = currentCat?.items.some(i => i.type === 'sub' && i.data.id === item.id);
                        if (isSub) {
                            setNavPath([navPath[0], item.id]);
                        }
                      }
                    }} 
                 />
               ))}
             </div>
             {(!items || items.length === 0) && <div className="text-[#4a4a4a] text-[10px] text-center mt-12 italic">No options available.</div>}
          </div>

          <div className="mt-4 border-t border-[#1c1e22] pt-2 flex justify-end">
             <div className="w-4 h-4 border border-[#333] flex items-center justify-center text-[8px] text-[#444]">▼</div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SpotRow: React.FC<{ 
  p: TeleportPoint; 
  onUpdate: (data: Partial<TeleportPoint>) => void; 
  onDelete: () => void;
  onUp: () => void;
  onDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}> = ({ p, onUpdate, onDelete, onUp, onDown, isFirst, isLast }) => (
  <div className="grid grid-cols-12 gap-2 items-center bg-slate-900/40 p-2 rounded-md border border-slate-800/50 hover:border-slate-700 transition-all group">
    <div className="col-span-1">
      <MoveButtons onUp={onUp} onDown={onDown} isFirst={isFirst} isLast={isLast} />
    </div>
    <div className="col-span-3">
      <input className="w-full bg-[#0b101b] border border-slate-700 rounded px-2 py-1.5 text-xs text-white focus:border-blue-500 outline-none transition-all" value={p.name} onChange={e => onUpdate({ name: e.target.value })} placeholder="Button Text" />
    </div>
    <div className="col-span-2">
      <input className="w-full bg-[#0b101b] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-400 text-center focus:border-blue-500 outline-none transition-all" type="number" value={p.x} onChange={e => onUpdate({ x: parseInt(e.target.value) || 0 })} />
    </div>
    <div className="col-span-2">
      <input className="w-full bg-[#0b101b] border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-400 text-center focus:border-blue-500 outline-none transition-all" type="number" value={p.y} onChange={e => onUpdate({ y: parseInt(e.target.value) || 0 })} />
    </div>
    <div className="col-span-1">
      <input className="w-full bg-[#0b101b] border border-slate-700 rounded px-1 py-1.5 text-xs text-slate-400 text-center focus:border-blue-500 outline-none transition-all" type="number" value={p.z} onChange={e => onUpdate({ z: parseInt(e.target.value) || 0 })} />
    </div>
    <div className="col-span-2">
      <input className="w-full bg-[#0b101b] border border-slate-700 rounded px-2 py-1.5 text-xs text-amber-500 font-mono font-bold focus:border-amber-400 outline-none transition-all" type="number" value={p.price} onChange={e => onUpdate({ price: parseInt(e.target.value) || 0 })} />
    </div>
    <div className="col-span-1 flex justify-center">
      <button className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded transition-all" onClick={onDelete} title="Delete Spot">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [config, setConfig] = useState<GKConfig>(() => {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : INITIAL_CONFIG;
  });
  const [tab, setTab] = useState<'editor' | 'preview' | 'code'>('editor');
  const [code, setCode] = useState<{ [key: string]: string }>({});
  const [genType, setGenType] = useState<GenerationType>('HTML');
  const [loading, setLoading] = useState(false);

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(config)), [config]);

  const handleGenerate = async (type: GenerationType) => {
    setLoading(true); setGenType(type);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `Act as L2J Mobius Developer. Target: Interlude (C6). Generate ${type} for NPC ID ${config.npcId} with skin ${config.skinId} named "${config.npcName}". 
        CRITICAL: Buttons 95x21, textures back="bigbutton_over" fore="bigbutton". Hierarchy: ${JSON.stringify(config.categories)}.`,
      });
      setCode(prev => ({ ...prev, [type]: res.text || "" }));
      setTab('code');
    } catch (e) { setCode(prev => ({ ...prev, [type]: "Generation failed." })); }
    setLoading(false);
  };

  const updateCategory = (id: string, data: Partial<TeleportCategory>) => {
    setConfig({ ...config, categories: config.categories.map(c => c.id === id ? { ...c, ...data } : c) });
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    setConfig({ ...config, categories: moveInArray(config.categories, index, direction) });
  };

  const handleMoveItemInCategory = (catId: string, index: number, direction: 'up' | 'down') => {
    const cat = config.categories.find(c => c.id === catId);
    if (!cat) return;
    updateCategory(catId, { items: moveInArray(cat.items, index, direction) });
  };

  const handleMoveSpotInSub = (catId: string, subId: string, pIdx: number, direction: 'up' | 'down') => {
    const cat = config.categories.find(c => c.id === catId);
    if (!cat) return;
    const newItems = cat.items.map(item => {
      if (item.type === 'sub' && item.data.id === subId) {
        return { ...item, data: { ...item.data, points: moveInArray(item.data.points, pIdx, direction) } };
      }
      return item;
    });
    updateCategory(catId, { items: newItems as CategoryItem[] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b101b] text-slate-200">
      <header className="bg-[#111827] border-b border-slate-800 p-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-900/20">L2</div>
             <div>
               <h1 className="text-lg font-bold text-slate-100 leading-none tracking-tight">GK Architect <span className="text-blue-500">v2.1</span></h1>
               <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Mobius Development Tool</p>
             </div>
          </div>
          <nav className="flex bg-[#1f2937] p-1 rounded-lg border border-slate-700">
            {['editor', 'preview', 'code'].map((t) => (
              <button key={t} onClick={() => setTab(t as any)} className={`px-6 py-1.5 rounded-md text-xs font-bold transition-all ${tab === t ? 'bg-[#3b82f6] text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}>
                {t.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1600px] mx-auto w-full p-6 grid grid-cols-12 gap-8">
        {tab === 'editor' && (
          <>
            <div className="col-span-12 lg:col-span-3 space-y-6">
              <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-xl sticky top-24">
                <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span> NPC Settings
                </h2>
                <div className="space-y-5">
                  {[ ['ID', 'npcId'], ['Name', 'npcName'], ['Title', 'npcTitle'], ['Skin', 'skinId'] ].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-[10px] text-slate-500 font-black mb-1.5 uppercase tracking-widest">{label}</label>
                      <input className="w-full bg-[#0b101b] border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition-all" value={(config as any)[key]} onChange={e => setConfig({...config, [key]: e.target.value})} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-9 space-y-8">
              <div className="flex justify-between items-center">
                 <h2 className="text-xl font-black text-slate-100 uppercase tracking-tighter">Hierarchy Editor</h2>
                 <L2Button label="+ New Category" variant="orange" className="h-10 px-6 rounded-lg shadow-lg shadow-orange-900/20" onClick={() => setConfig({...config, categories: [...config.categories, {id: `c_${Date.now()}`, name: 'New Category', items: []}]})} />
              </div>

              <div className="space-y-10">
                {config.categories.map((cat, catIdx) => (
                  <div key={cat.id} className="bg-[#111827] border border-orange-900/30 rounded-xl overflow-hidden shadow-2xl transition-all hover:border-orange-500/30">
                    <div className="bg-orange-500/5 p-4 flex justify-between items-center border-b border-orange-900/20">
                      <div className="flex items-center gap-4">
                        <MoveButtons onUp={() => handleMoveCategory(catIdx, 'up')} onDown={() => handleMoveCategory(catIdx, 'down')} isFirst={catIdx === 0} isLast={catIdx === config.categories.length - 1} />
                        <div className="relative">
                           <input className="bg-[#0b101b]/80 border border-orange-500/20 text-[#fbbf24] font-black text-lg outline-none w-80 px-3 py-1.5 rounded-lg focus:border-orange-500 focus:text-white transition-all shadow-inner" value={cat.name} onChange={e => updateCategory(cat.id, { name: e.target.value })} />
                           <span className="absolute -top-2 left-2 bg-orange-900 text-orange-200 text-[8px] px-1.5 rounded-full font-bold uppercase tracking-tighter">CATEGORY</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <L2Button label="+ Spot" variant="secondary" onClick={() => updateCategory(cat.id, { items: [...cat.items, { type: 'point', data: { id: `p_${Date.now()}`, name: 'New Spot', x: 0, y: 0, z: 0, price: 0 } }] })} />
                        <L2Button label="+ Sub-Menu" variant="blue" onClick={() => updateCategory(cat.id, { items: [...cat.items, { type: 'sub', data: {id: `s_${Date.now()}`, name: 'Sub-Menu Name', points:[] } }] })} />
                        <button className="text-slate-600 hover:text-red-500 transition-colors px-2" onClick={() => setConfig({...config, categories: config.categories.filter(c => c.id !== cat.id)})}>
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      {cat.items.length > 0 && (
                        <div className="grid grid-cols-12 gap-2 mb-1 px-2">
                           <div className="col-span-1"></div>
                           <div className="col-span-3 text-[9px] font-black text-slate-600 uppercase tracking-widest">Label</div>
                           <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Coord X</div>
                           <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Coord Y</div>
                           <div className="col-span-1 text-[9px] font-black text-slate-600 uppercase tracking-widest text-center">Z</div>
                           <div className="col-span-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">Adena Price</div>
                        </div>
                      )}

                      {cat.items.map((item, idx) => (
                        item.type === 'point' ? (
                          <SpotRow 
                            key={item.data.id} 
                            p={item.data} 
                            isFirst={idx === 0}
                            isLast={idx === cat.items.length - 1}
                            onUp={() => handleMoveItemInCategory(cat.id, idx, 'up')}
                            onDown={() => handleMoveItemInCategory(cat.id, idx, 'down')}
                            onUpdate={(data) => updateCategory(cat.id, { items: cat.items.map((it, i) => i === idx ? { type: 'point', data: { ...(it.data as TeleportPoint), ...data } } : it) })}
                            onDelete={() => updateCategory(cat.id, { items: cat.items.filter((_, i) => i !== idx) })}
                          />
                        ) : (
                          <div key={item.data.id} className="bg-blue-600/5 border border-blue-500/20 rounded-xl p-4 mt-2">
                             <div className="flex justify-between items-center mb-6 border-b border-blue-500/10 pb-3">
                               <div className="flex items-center gap-4">
                                 <MoveButtons onUp={() => handleMoveItemInCategory(cat.id, idx, 'up')} onDown={() => handleMoveItemInCategory(cat.id, idx, 'down')} isFirst={idx === 0} isLast={idx === cat.items.length - 1} />
                                 <div className="relative">
                                    <input className="bg-[#0b101b]/80 border border-blue-500/20 text-blue-400 font-black text-base outline-none w-64 px-3 py-1.5 rounded-lg focus:border-blue-500 focus:text-white transition-all shadow-inner" value={item.data.name} onChange={e => updateCategory(cat.id, { items: cat.items.map((it, i) => i === idx ? { type: 'sub', data: { ...(it.data as TeleportSubCategory), name: e.target.value } } : it) })} />
                                    <span className="absolute -top-2 left-2 bg-blue-900 text-blue-200 text-[8px] px-1.5 rounded-full font-bold uppercase tracking-tighter">SUB-MENU</span>
                                 </div>
                               </div>
                               <div className="flex gap-3">
                                 <L2Button label="+ Sub Spot" variant="secondary" className="text-[9px]" onClick={() => updateCategory(cat.id, { items: cat.items.map((it, i) => i === idx ? { type: 'sub', data: { ...(it.data as TeleportSubCategory), points: [...(it.data as TeleportSubCategory).points, {id: `p_${Date.now()}`, name:'New Spot', x:0, y:0, z:0, price:0}]} } : it) })} />
                                 <button className="text-slate-600 hover:text-red-500 transition-colors" onClick={() => updateCategory(cat.id, { items: cat.items.filter((_, i) => i !== idx) })}>
                                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                 </button>
                               </div>
                             </div>
                             <div className="space-y-1.5 pl-4 border-l-2 border-blue-900/30">
                               {item.data.points.map((p, pIdx) => (
                                 <SpotRow 
                                    key={p.id} 
                                    p={p} 
                                    isFirst={pIdx === 0}
                                    isLast={pIdx === item.data.points.length - 1}
                                    onUp={() => handleMoveSpotInSub(cat.id, item.data.id, pIdx, 'up')}
                                    onDown={() => handleMoveSpotInSub(cat.id, item.data.id, pIdx, 'down')}
                                    onUpdate={(data) => updateCategory(cat.id, { items: cat.items.map((it, i) => i === idx ? { type: 'sub', data: { ...(it.data as TeleportSubCategory), points: (it.data as TeleportSubCategory).points.map((pt, pi) => pi === pIdx ? {...pt, ...data} : pt) } } : it) })}
                                    onDelete={() => updateCategory(cat.id, { items: cat.items.map((it, i) => i === idx ? { type: 'sub', data: { ...(it.data as TeleportSubCategory), points: (it.data as TeleportSubCategory).points.filter((_, pi) => pi !== pIdx) } } : it) })}
                                 />
                               ))}
                             </div>
                          </div>
                        )
                      ))}
                      {cat.items.length === 0 && <div className="text-center py-12 text-slate-600 text-sm italic bg-slate-900/10 rounded-xl border-2 border-dashed border-slate-800">No content here yet. Use the buttons above to start building.</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'preview' && (
          <div className="col-span-12 flex justify-center">
            <L2DialogPreview config={config} />
          </div>
        )}

        {tab === 'code' && (
          <div className="col-span-12 space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 p-1.5 bg-[#1f2937] rounded-xl border border-slate-700">
                {(['HTML', 'NPC_XML', 'TELEPORT_XML', 'JAVA'] as GenerationType[]).map(t => (
                  <button key={t} onClick={() => handleGenerate(t)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] transition-all ${genType === t ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}>
                    {loading && genType === t ? 'GENERATE...' : t}
                  </button>
                ))}
              </div>
              <L2Button label="Copy to Clipboard" variant="secondary" className="px-6 h-10" onClick={() => { navigator.clipboard.writeText(code[genType] || ""); alert('Copied!'); }} />
            </div>
            <div className="relative group">
               <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
               <textarea readOnly className="relative w-full h-[640px] bg-[#0b101b] text-emerald-400 font-mono text-xs p-8 rounded-2xl border border-slate-800 outline-none resize-none shadow-2xl overflow-y-auto" value={code[genType] || 'Select a format to generate code...'} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);