import React, { useState, useEffect } from 'react';
import { BilowCard } from './types';
import { DEFAULT_CARDS } from './data/defaultCards';
import DrawingBoard from './components/DrawingBoard';
import BilowCardView, { calculateVida, calculatePowerAtakMod, calculateDefesa, calculateAntipoda, calculateFraco } from './components/BilowCardView';
import BattleSimulator from './components/BattleSimulator';
import PrintSheetSetup from './components/PrintSheetSetup';

// System icons
import { 
  PlusCircle, 
  Layers, 
  Swords, 
  Printer, 
  BookOpen, 
  Share2, 
  MessageSquare, 
  Trash2, 
  Download, 
  Upload, 
  Plus, 
  Copy, 
  Check,
  Crown
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'bilows_deck_collection_v2';

export default function App() {
  const drawingBoardRef = React.useRef<any>(null);
  const [deck, setDeck] = useState<BilowCard[]>([]);
  const [activeTab, setActiveTab] = useState<'desktop' | 'deck' | 'print' | 'rules' | 'invite' | 'chat'>('desktop');
  
  // Custom Card State in active edit workspace
  const [draftCardId, setDraftCardId] = useState(() => `bilow-draft-${Date.now()}`);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [cardName, setCardName] = useState('IGNISAUR');
  const [cardEvoc, setCardEvoc] = useState('01');
  const [cardElemento, setCardElemento] = useState<'AG' | 'TE' | 'AR' | 'FO'>('FO');
  const [cardPeso, setCardPeso] = useState('120');
  const [drawingDataUrl, setDrawingDataUrl] = useState('');
  
  // Behaviors states
  const [behaviorDado, setBehaviorDado] = useState('DADO');
  const [behaviorAction, setBehaviorAction] = useState('ACTION');
  const [behaviorHit, setBehaviorHit] = useState('HIT');
  const [twitterHandle, setTwitterHandle] = useState('NOME DO DESIGNER');
  const [exportCard, setExportCard] = useState<BilowCard | null>(null);
  const [deleteConfirmCardId, setDeleteConfirmCardId] = useState<string | null>(null);

  // Copy success feedback state
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteOpponentName, setInviteOpponentName] = useState('CRIADOR_ZENO');

  // Interactive message log states
  const [chatLogs, setChatLogs] = useState<{ sender: string; text: string; id: number }[]>([
    { sender: 'SISTEMA', text: 'CHAT BLINDADO DE SEGURANÇA CONECTADO. SELECIONE OS BLOCOS PARA SE COMUNICAR.', id: 1 },
    { sender: 'ADVERSÁRIO', text: '👋 SAUDAÇÕES, NOBRE CRIADOR! SEU DESENHO FICOU INCRÍVEL!', id: 2 }
  ]);

  // Load and normalize deck collection on mount
  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDeck(parsed);
        } else {
          setDeck(DEFAULT_CARDS);
        }
      } catch (err) {
        setDeck(DEFAULT_CARDS);
      }
    } else {
      setDeck(DEFAULT_CARDS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_CARDS));
    }
  }, []);

  const saveDeck = (updatedDeck: BilowCard[]) => {
    setDeck(updatedDeck);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedDeck));
  };

  // Preset Auto-Suggest helper
  const handleRandomizePreset = () => {
    const names = ['VULKANON', 'ODIN_SNAKE', 'HYDRO_TURTLE', 'ZEPHYR_WIND', 'GEO_GOLEM', 'FIRE_FOX', 'TERRA_PINNER', 'AR_FLYER'];
    const actions = ['FÚRIA_TÁTICA', 'SOPRO_ELEMENT', 'ATAQUE_RÁPIDO', 'IMPACTO_SÍSM', 'ESCUDO_CRISA', 'DRENO_FLUXO', 'CURA_BRUMAl'];
    const hits = ['GOLPE_SÉRIO', 'CONJURAÇÃO', 'NOCAUTEAR', 'REVIDAR', 'QUEBRA_DADO', 'FINALIZADOR'];

    const chosenName = names[Math.floor(Math.random() * names.length)];
    const chosenAction = actions[Math.floor(Math.random() * actions.length)];
    const chosenHit = hits[Math.floor(Math.random() * hits.length)];
    const randomPeso = String(Math.floor(Math.random() * 950) + 15);
    const elementsList: ('AG'|'TE'|'AR'|'FO')[] = ['AG', 'TE', 'AR', 'FO'];
    const randomElement = elementsList[Math.floor(Math.random() * 4)];

    setCardName(chosenName);
    setCardPeso(randomPeso);
    setCardElemento(randomElement);
    setBehaviorAction(chosenAction);
    setBehaviorHit(chosenHit);
  };

  const handleResetForm = () => {
    setEditingCardId(null);
    setDraftCardId(`bilow-draft-${Date.now()}`);
    setCardName('CRIATURA_NOVA');
    setCardEvoc('01');
    setCardElemento('FO');
    setCardPeso('120');
    setBehaviorDado('DADO');
    setBehaviorAction('ACTION');
    setBehaviorHit('HIT');
    setTwitterHandle('CRIADOR');
    setDrawingDataUrl('');
  };

  // Convert current form states to a card object
  const getCurrentCardObject = (customDrawingDataUrl?: string): BilowCard => {
    const calculatedVid = calculateVida(cardPeso);
    const calculatedAtkMod = calculatePowerAtakMod(cardPeso);
    const calculatedDef = calculateDefesa(cardPeso);
    const calculatedAntipoda = calculateAntipoda(cardElemento, cardPeso);
    const calculatedFraco = calculateFraco(cardElemento);

    return {
      id: editingCardId || draftCardId,
      name: cardName.substring(0, 12).toUpperCase(),
      evoc: cardEvoc.replace(/[^0-9]/g, '').substring(0, 2),
      elemento: cardElemento,
      vida: calculatedVid,
      peso: cardPeso,
      powerAtakElement: cardElemento,
      powerAtakMod: calculatedAtkMod,
      defesa: calculatedDef,
      antipoda: calculatedAntipoda,
      fraco: calculatedFraco,
      recuar: 'AR', // assigned deterministically in view 
      behaviorDado,
      behaviorAction: behaviorAction.substring(0, 20).toUpperCase(),
      behaviorHit: behaviorHit.substring(0, 20).toUpperCase(),
      twitterHandle: twitterHandle.substring(0, 30),
      drawingDataUrl: customDrawingDataUrl !== undefined ? customDrawingDataUrl : drawingDataUrl,
      createdAt: Date.now()
    };
  };

  const handleSaveCard = () => {
    if (!cardName.trim()) {
      alert('NOME DA CRIATURA ESTÁ EM BRANCO!');
      return;
    }

    // Force synchronous canvas export to get the most up-to-the-millisecond drawing
    let finalDrawing = drawingDataUrl;
    if (drawingBoardRef.current && typeof drawingBoardRef.current.exportToImage === 'function') {
      const exported = drawingBoardRef.current.exportToImage();
      if (exported) {
        finalDrawing = exported;
      }
    }

    const newCard = getCurrentCardObject(finalDrawing);
    let nextDeck: BilowCard[] = [];

    if (editingCardId) {
      nextDeck = deck.map(c => c.id === editingCardId ? newCard : c);
    } else {
      if (deck.length >= 36) {
        alert('LIMITE ALCANÇADO! SEU BARALHO PODE CONTER NO MÁXIMO 36 CARTAS. EXCLUA UMA CARTA NO PAINEL "MEU BARALHO" PARA LIBERAR ESPAÇO!');
        return;
      }
      nextDeck = [newCard, ...deck];
    }

    saveDeck(nextDeck);
    
    // Persist drawingDataUrl in local state to ensure it matches
    setDrawingDataUrl(finalDrawing);
    setEditingCardId(newCard.id);
    setActiveTab('deck'); // Redireciona o criador para a página 'MEU BARALHO' para validação visual imediata
    alert(`SUCESSO! CRIATURA "${newCard.name}" SALVA NO BARALHO.`);
  };

  const handleDeleteCard = (id: string) => {
    setDeleteConfirmCardId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmCardId) {
      const nextDeck = deck.filter(c => c.id !== deleteConfirmCardId);
      saveDeck(nextDeck);
      if (editingCardId === deleteConfirmCardId) {
        handleResetForm();
      }
      setDeleteConfirmCardId(null);
    }
  };

  const handleLoadCard = (card: BilowCard) => {
    setEditingCardId(card.id);
    setCardName(card.name);
    setCardEvoc(card.evoc);
    setCardElemento(card.elemento);
    setCardPeso(card.peso);
    setBehaviorDado(card.behaviorDado || 'DADO');
    setBehaviorAction(card.behaviorAction || 'ACTION');
    setBehaviorHit(card.behaviorHit || 'HIT');
    setTwitterHandle(card.twitterHandle || 'NOME DO DESIGNER');
    setDrawingDataUrl(card.drawingDataUrl || '');
    setActiveTab('desktop');
  };

  const handleDuplicateCard = (card: BilowCard) => {
    if (deck.length >= 36) {
      alert('LIMITE ALCANÇADO! SEU BARALHO JÁ TEM O LIMITE MÁXIMO DE 36 CARTAS.');
      return;
    }
    const clone: BilowCard = {
      ...card,
      id: `bilow-clone-${Date.now()}`,
      name: `${card.name.substring(0, 9)}_CL`,
      createdAt: Date.now()
    };
    saveDeck([clone, ...deck]);
  };

  const handleExportDeck = () => {
    const dataStr = JSON.stringify(deck, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = 'baralho_bilows_export.json';
    link.click();
  };

  const handleDownloadSingleCard = async () => {
    // Force synchronous canvas export to get the most up-to-the-millisecond drawing
    let finalDrawing = drawingDataUrl;
    if (drawingBoardRef.current && typeof drawingBoardRef.current.exportToImage === 'function') {
      const exported = drawingBoardRef.current.exportToImage();
      if (exported) {
        finalDrawing = exported;
      }
    }
    const card = getCurrentCardObject(finalDrawing);

    setExportCard(card);
    await new Promise(resolve => setTimeout(resolve, 150));

    const element = document.getElementById("clean-image-export-target");
    if (element) {
      try {
        const { toJpeg } = await import('html-to-image');
        const dataUrl = await toJpeg(element, {
          quality: 0.98,
          backgroundColor: '#ffffff',
          pixelRatio: 2 // Use double pixel density for 100% sharp text on all viewing/printing systems (840x1240px)
        });
        const link = document.createElement('a');
        link.download = `bilow_carta_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpeg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Erro ao gerar JPEG, usando fallback de JSON de segurança:", err);
        // Fallback JSON backup
        const dataStr = JSON.stringify(card, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `bilow_carta_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        link.click();
      }
    } else {
      // Fallback JSON backup
      const dataStr = JSON.stringify(card, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `bilow_carta_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
      link.click();
    }
    setExportCard(null);
  };

  const handleDownloadSpecificCard = async (card: BilowCard) => {
    setExportCard(card);
    await new Promise(resolve => setTimeout(resolve, 150));

    const element = document.getElementById("clean-image-export-target");
    if (element) {
      try {
        const { toJpeg } = await import('html-to-image');
        const dataUrl = await toJpeg(element, {
          quality: 0.98,
          backgroundColor: '#ffffff',
          pixelRatio: 2 // Use double pixel density for 100% sharp text on all viewing/printing systems (840x1240px)
        });
        const link = document.createElement('a');
        link.download = `bilow_carta_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpeg`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Erro ao gerar JPEG:", err);
        // Fallback JSON backup
        const dataStr = JSON.stringify(card, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = `bilow_carta_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        link.click();
      }
    } else {
      // Fallback JSON backup
      const dataStr = JSON.stringify(card, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      const link = document.createElement('a');
      link.href = dataUri;
      link.download = `bilow_carta_${card.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
      link.click();
    }
    setExportCard(null);
  };

  const handleImportDeck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      reader.readAsText(e.target.files[0], "UTF-8");
      reader.onload = (event) => {
        try {
          let parsed = JSON.parse(event.target?.result as string);
          if (parsed && !Array.isArray(parsed) && typeof parsed === 'object' && parsed.id && parsed.name) {
            parsed = [parsed];
          }
          if (Array.isArray(parsed) && parsed.length > 0) {
            const merged = [...parsed, ...deck.filter(d => !parsed.some((p: any) => p.id === d.id))];
            saveDeck(merged);
            alert(`SUCESSO! ${parsed.length} CRIAÇÕES IMPORTADAS.`);
          } else {
            alert('FORMATO INVÁLIDO!');
          }
        } catch (err) {
          alert('ERRO DE PARSE DO JSON!');
        }
      };
    }
  };

  // Safe Chat blocks event composite
  const handleSendQuickMessage = (text: string) => {
    const userMsg = { sender: 'VOCÊ', text, id: Date.now() };
    setChatLogs(prev => [...prev, userMsg]);

    // Robot responses to make the match chat feel alive
    setTimeout(() => {
      const responses = [
        '👍 CONEXÃO RECORDE SUCESSO! DUELO CONVOCADO!',
        '⚔️ MINHA EVOLUÇÃO (EVOC 05) TE AGUARDA COM PODER MÁXIMO!',
        '🤝 ADVERSÁRIO ACEITOU! VAMOS COMBATER NA ARENA AGORA MESMO!',
        '🔥 SINTA O CALOR DO MEU ELEMENTO FO EM RESPOSTA!',
        '💎 SEU ELEMENTO CAÍRA PERANTE MINHA DEFESA SÍSMICA!'
      ];
      const botMsg = {
        sender: 'ADVERSÁRIO_BOT',
        text: responses[Math.floor(Math.random() * responses.length)],
        id: Date.now() + 1
      };
      setChatLogs(prev => [...prev, botMsg]);
    }, 1500);
  };

  const triggerCopyInviteLink = () => {
    setInviteCopied(true);
    const code = `BILOWS-DISPUTA-${inviteOpponentName.toUpperCase()}-${Math.floor(Math.random() * 950) + 10}`;
    navigator.clipboard.writeText(`https://bilows.app/battle/invite?code=${code}`);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#2563eb] text-[#ffffff] flex flex-col font-mono uppercase tracking-wider text-[9px]">
      
      {/* 2px Solid White outlined retro main navbar header (No print) */}
      <header style={{ backgroundColor: '#220a75' }} className="no-print border-b-2 border-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              {/* Special Game Title: can be a fancy-title under custom rule */}
              <h1 className="text-xl font-black tracking-widest text-[#ffffff] font-display flex items-baseline gap-2 leading-none">
                BILOWS
              </h1>
            </div>
          </div>

          {/* NAVBAR BUTTONS: IMPRIMIR, REGRAS, DESKTOP, CONVIDAR, CAIXA DE MENSAGEM */}
          <nav className="flex flex-wrap items-center gap-1.5 bg-black p-1 border border-zinc-800">
            <button
              id="nav-desktop-btn"
              onClick={() => setActiveTab('desktop')}
              className={`px-3 py-2 transition-all border cursor-pointer ${
                activeTab === 'desktop' ? 'bg-white text-black border-white' : 'border-black hover:text-white'
              }`}
              style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '10px', color: activeTab === 'desktop' ? '#000000' : '#ffffff' }}
            >
              CRIAR CARTA
            </button>

            <button
              id="nav-deck-btn"
              onClick={() => setActiveTab('deck')}
              className={`px-3 py-2 transition-all border cursor-pointer ${
                activeTab === 'deck' ? 'bg-white text-black border-white' : 'border-black hover:text-white'
              }`}
              style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '10px', color: activeTab === 'deck' ? '#000000' : '#ffffff' }}
            >
              MEU BARALHO
            </button>

            <button
              id="nav-print-btn"
              onClick={() => setActiveTab('print')}
              className={`px-3 py-2 transition-all border cursor-pointer ${
                activeTab === 'print' ? 'bg-white text-black border-white' : 'border-black hover:text-white'
              }`}
              style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '10px', color: activeTab === 'print' ? '#000000' : '#ffffff' }}
            >
              IMPRIMIR
            </button>

            <button
              id="nav-rules-btn"
              onClick={() => setActiveTab('rules')}
              className={`px-3 py-2 transition-all border cursor-pointer ${
                activeTab === 'rules' ? 'bg-white text-black border-white' : 'border-black hover:text-white'
              }`}
              style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '10px', color: activeTab === 'rules' ? '#000000' : '#ffffff' }}
            >
              REGRAS
            </button>

            <button
              id="nav-invite-btn"
              onClick={() => setActiveTab('invite')}
              className={`px-3 py-2 transition-all border cursor-pointer ${
                activeTab === 'invite' ? 'bg-white text-black border-white' : 'border-black hover:text-white'
              }`}
              style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '10px', color: activeTab === 'invite' ? '#000000' : '#ffffff' }}
            >
              JOGAR ON LINE
            </button>

            <button
              id="nav-chat-btn"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-2 transition-all border cursor-pointer ${
                activeTab === 'chat' ? 'bg-white text-black border-white' : 'border-black hover:text-white'
              }`}
              style={{ fontFamily: 'Arial', fontWeight: 'bold', fontSize: '10px', color: activeTab === 'chat' ? '#000000' : '#ffffff' }}
            >
              CAIXA DE MENSAGEM
            </button>
          </nav>
        </div>
      </header>

      {/* CORE CONTENT workspace */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-6 relative z-10">

        {/* TAB 1: DESKTOP (Master Workspace Card form and deck list) */}
        {activeTab === 'desktop' && (
          <div className="no-print space-y-6">
            
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* ACTIVE EDITING CARD LAYOUT AND DRAWING BOARD (Left 8 columns) */}
              <div 
                style={{ marginTop: '-21px', backgroundColor: '#222084' }}
                className="xl:col-span-8 w-full min-w-0 flex flex-col gap-4 p-6 border-2 border-zinc-800 rounded-3xl overflow-hidden"
              >
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-zinc-800/60 w-full">
                  <div></div>
                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    <button
                      onClick={handleSaveCard}
                      className="px-4 py-2 bg-white text-black text-[9px] font-black uppercase tracking-wider hover:bg-zinc-200 transition-colors cursor-pointer"
                    >
                      {editingCardId ? 'REGISTRAR ALTERAÇÕES 💾' : 'REGISTRAR CARTA 💾'}
                    </button>
                    <button
                      onClick={handleDownloadSingleCard}
                      className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                      title="Salvar esta carta no computador"
                    >
                      SALVAR 📥
                    </button>
                    {editingCardId && (
                      <button
                        onClick={handleResetForm}
                        className="px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-white text-white text-[9px] font-black uppercase cursor-pointer"
                        title="NOVO PERSONAGEM"
                      >
                        NVO
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleRandomizePreset}
                      className="px-3 py-2 bg-white border border-white hover:bg-zinc-200 text-black text-[9px] font-black uppercase cursor-pointer transition-colors"
                      title="Presets Aleatórios"
                    >
                      GERAR ALEATÓRIO 🪄
                    </button>
                  </div>
                </div>

                <div className="w-full">
                  <DrawingBoard 
                    ref={drawingBoardRef}
                    key={editingCardId || 'new-canvas-board'}
                    initialDataUrl={drawingDataUrl}
                    onSaveImage={(url) => setDrawingDataUrl(url)}
                    kingdomColor="#ffffff"
                    card={getCurrentCardObject()}
                    isEditing={true}
                    onCardChange={(updates) => {
                      if (updates.name !== undefined) setCardName(updates.name);
                      if (updates.evoc !== undefined) setCardEvoc(updates.evoc);
                      if (updates.elemento !== undefined) setCardElemento(updates.elemento);
                      
                      let finalPeso = cardPeso;
                      if (updates.peso !== undefined) {
                        setCardPeso(updates.peso);
                        finalPeso = updates.peso;
                      }

                      if (updates.behaviorDado !== undefined) setBehaviorDado(updates.behaviorDado);
                      if (updates.behaviorAction !== undefined) setBehaviorAction(updates.behaviorAction);
                      if (updates.behaviorHit !== undefined) setBehaviorHit(updates.behaviorHit);
                      if (updates.twitterHandle !== undefined) setTwitterHandle(updates.twitterHandle);
                    }}
                  />
                </div>

              </div>

              {/* SAVED DECK CARDS (Right 4 columns) */}
              <div className="xl:col-span-4 bg-orange-600 p-4 border-2 border-white rounded-3xl flex flex-col gap-4 relative z-20 text-white">
                <div 
                  style={{ backgroundColor: '#1ca31c' }}
                  className="flex items-center justify-between border-b border-white/40 pb-2"
                >
                  <div>
                    <span className="text-orange-100 block text-[8px]">LISTA ANALÓGICA</span>
                    <h3 className="text-xs font-black text-white">SEU BARALHO ({deck.length})</h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={handleExportDeck}
                      className="p-1 px-2 border border-zinc-700 bg-zinc-900 text-[8px] text-zinc-300 hover:text-white hover:border-white uppercase"
                    >
                      EXPORTAR
                    </button>
                    <label className="p-1 px-2 border border-zinc-700 bg-zinc-900 text-[8px] text-zinc-300 hover:text-white hover:border-white uppercase cursor-pointer">
                      IMPORTAR
                      <input type="file" onChange={handleImportDeck} accept=".json" className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Grid list scroll */}
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 select-none scrollbar-thin scrollbar-thumb-zinc-800">
                  {deck.length === 0 && (
                    <div className="text-center py-8 text-zinc-600 font-bold border border-dashed border-zinc-800">
                      NENHUM CARREGADO. CLIQUE EM SALVAR ACIMA PARA CONSTITUIR SEU BARALHO.
                    </div>
                  )}
                  {deck.map((card) => (
                    <div 
                      key={card.id}
                      className="p-2 border-2 border-zinc-800 bg-black flex items-center justify-between hover:border-zinc-600 transition-all rounded-xl"
                    >
                      <div className="flex items-center gap-2 min-w-0 cursor-pointer" onClick={() => handleLoadCard(card)}>
                        <div className="w-8 h-8 border border-zinc-700 bg-zinc-900 overflow-hidden flex items-center justify-center">
                          {card.drawingDataUrl ? (
                            <img src={card.drawingDataUrl} alt={card.name} referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-[7px] text-zinc-600">BRANCO</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-extrabold text-white truncate">{card.name}</p>
                          <p className="text-[8px] text-zinc-500 tracking-wider">EVOC:{card.evoc} | {card.elemento} | {card.peso} KG | HP:{card.vida}</p>
                        </div>
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => handleLoadCard(card)}
                          className="px-2 py-1 bg-zinc-900 border border-zinc-700 hover:border-white text-[8px] font-bold text-white uppercase"
                        >
                          EDITAR
                        </button>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="p-1 border border-zinc-700 hover:border-red-500 bg-zinc-950 text-red-500 hover:text-white uppercase"
                          title="EXCLUIR"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Start Arena simulator prompt */}
                <div className="border border-zinc-800 p-2 text-center bg-black flex flex-col gap-1.5 mt-auto">
                  <span className="text-zinc-500">QUER COLOCAR O DECK À PROVA?</span>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="w-full py-2 bg-white text-black ring-1 ring-white hover:bg-black hover:text-white font-black text-[9px] cursor-pointer"
                  >
                    COMBATER NA ARENA DE DISPUTA ⚔
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 1.5: MEU BARALHO (Deck binder storage page) */}
        {activeTab === 'deck' && (
          <div className="no-print space-y-6 animate-fadeIn">
            
            {/* Binder Header Statistics Panel */}
            <div 
              style={{ height: '94px', marginTop: '-24px' }} 
              className="bg-zinc-950 p-6 border-2 border-zinc-800 rounded-3xl flex flex-col md:flex-row items-stretch justify-between gap-6"
            >
              <div className="space-y-2">
                <span 
                  style={{ marginTop: '-13px' }} 
                  className="text-zinc-500 font-extrabold text-[8px] tracking-widest block uppercase"
                >
                  DECK MANAGER & STORAGE
                </span>
                <h2 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" /> MEU BARALHO ANALÓGICO ({deck.length} / 36)
                </h2>

              </div>

              {/* Stats bento indicators */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 shrink-0">
                
                {/* Meter Slot representation */}
                <div 
                  style={{ marginTop: '-16px' }} 
                  className="border border-zinc-850 p-3 bg-zinc-900/40 flex flex-col justify-between rounded-xl"
                >
                  <span className="text-zinc-500 text-[7.5px] font-bold block mb-1">MEDIDOR DE CAPACIDADE</span>
                  <div className="flex flex-col gap-1.5 flex-grow justify-center">
                    <span className="text-xs font-black text-white">{deck.length} / 36</span>
                    <div className="w-full bg-zinc-950 h-2 border border-zinc-800 rounded-sm overflow-hidden p-0.5 flex">
                      <div 
                        className="bg-emerald-500 h-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (deck.length / 36) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Avg Weight */}
                <div 
                  style={{ marginTop: '-16px' }} 
                  className="border border-zinc-850 p-3 bg-zinc-900/40 flex flex-col justify-between rounded-xl"
                >
                  <span className="text-zinc-500 text-[7.5px] font-bold block mb-1">PESO MÉDIO DO DECK</span>
                  <div className="flex flex-col gap-1 flex-grow justify-center">
                    <span className="text-xs font-black text-amber-400">
                      {deck.length > 0 ? Math.round(deck.reduce((acc, c) => acc + (parseFloat(c.peso) || 0), 0) / deck.length) : 0} KG
                    </span>
                    <span className="text-[7.5px] text-zinc-500 uppercase font-black">MEDIDA ANALÓGICA</span>
                  </div>
                </div>

                {/* Elements distribution breakdown */}
                <div 
                  style={{ marginTop: '-16px' }} 
                  className="col-span-2 md:col-span-1 border border-zinc-850 p-3 bg-zinc-900/40 flex flex-col justify-between rounded-xl"
                >
                  <span className="text-[#eaeaf5] text-[11.5px] font-[Arial] font-bold block mb-1">DISTRIBUIÇÃO ELEMENTAL</span>
                  <div className="grid grid-cols-4 gap-1 text-center font-bold text-[8px] text-white flex-grow items-center">
                    <div className="bg-red-950/40 border border-red-900/50 p-0.5 rounded text-red-400">FO:{deck.filter(c => c.elemento === 'FO').length}</div>
                    <div className="bg-blue-950/40 border border-blue-900/50 p-0.5 rounded text-blue-400">AG:{deck.filter(c => c.elemento === 'AG').length}</div>
                    <div className="bg-emerald-950/40 border border-emerald-900/50 p-0.5 rounded text-emerald-400">TE:{deck.filter(c => c.elemento === 'TE').length}</div>
                    <div className="bg-amber-950/40 border border-amber-900/50 p-0.5 rounded text-amber-400">AR:{deck.filter(c => c.elemento === 'AR').length}</div>
                  </div>
                </div>

              </div>
            </div>

            {/* Import & Export controls */}
            <div 
              style={{ marginTop: '-19px' }} 
              className="flex flex-col sm:flex-row justify-between items-center bg-black border border-zinc-850 p-3 px-4 rounded-xl gap-2"
            >
              <span className="text-[8px] text-zinc-500 font-bold">ORGANIZADOR DE BARALHO INSTANTÂNEO</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportDeck}
                  className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 text-[8.5px] text-zinc-300 hover:text-white hover:border-white uppercase font-bold cursor-pointer"
                >
                  EXPORTAR MEU BARALHO (.JSON)
                </button>
                <label className="px-3 py-1.5 border border-zinc-700 bg-zinc-900 text-[8.5px] text-zinc-300 hover:text-white hover:border-white uppercase font-bold cursor-pointer">
                  IMPORTAR COLECIONADOR (.JSON)
                  <input type="file" onChange={handleImportDeck} accept=".json" className="hidden" />
                </label>
              </div>
            </div>

            {/* Binder Slots Grid (Up to 36 slots) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              
              {/* Deck contents */}
              {Array.from({ length: 36 }).map((_, index) => {
                const card = deck[index];
                const slotNum = String(index + 1).padStart(2, '0');

                if (card) {
                  return (
                    <div 
                      key={card.id}
                      style={(index === 0 || index === 1 || index === 2) ? { marginTop: '-18px' } : undefined}
                      className="group/slot relative border-2 border-zinc-800 bg-black p-4 rounded-3xl flex flex-col items-center gap-3 hover:border-zinc-500 transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)] hover:z-30"
                    >
                      {/* Slot Header toolbar */}
                      <div className="flex items-center justify-between w-full border-b border-zinc-800 pb-2">
                        <span className="bg-zinc-850 text-[#ffffff] font-extrabold px-1.5 py-0.5 rounded text-[7.5px]">
                          SLOT #{slotNum}
                        </span>
                        
                        <div className="flex gap-1 relative z-20">
                          <button
                            onClick={() => handleLoadCard(card)}
                            className="bg-white text-black font-extrabold text-[7.5px] px-1.5 py-0.5 hover:bg-zinc-300 duration-155 uppercase cursor-pointer"
                          >
                            EDITAR
                          </button>
                          <button
                            onClick={() => handleDownloadSpecificCard(card)}
                            className="bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white font-extrabold text-[7.5px] px-1.5 py-0.5 uppercase cursor-pointer"
                            title="SALVAR NO COMPUTADOR"
                          >
                            SALVAR
                          </button>
                          <button
                            onClick={() => handleDeleteCard(card.id)}
                            className="bg-red-950/40 border border-red-900 text-red-500 hover:bg-red-650 hover:text-white font-extrabold text-[7.5px] p-1 uppercase cursor-pointer"
                            title="EXCLUIR DEFINITIVAMENTE"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Display scaled down card miniature */}
                      <div className="group/card relative bg-zinc-950 p-2 border border-zinc-900 rounded-2xl flex justify-center items-center w-full h-[325px] overflow-hidden hover:overflow-visible hover:z-45 transition-all duration-300">
                        <div className="scale-[0.5] group-hover/card:scale-[0.85] origin-center shrink-0 transition-transform duration-300 ease-out group-hover/card:drop-shadow-[0_25px_50px_rgba(0,0,0,0.9)]">
                           <BilowCardView card={card} />
                        </div>
                      </div>

                      {/* Micro info bar under card */}
                      <div className="w-full flex justify-between items-center text-[7.5px] text-zinc-400 bg-zinc-950 border border-zinc-900 p-1.5 px-2.5 rounded-lg">
                        <span className="font-bold text-white truncate max-w-[124px] uppercase">{card.name}</span>
                        <span>{card.peso} KG | HP: {card.vida}</span>
                      </div>
                    </div>
                  );
                } else {
                  // Empty Binder slot
                  return (
                    <div 
                      key={`empty-${index}`}
                      onClick={() => {
                        handleResetForm();
                        setActiveTab('desktop');
                      }}
                      style={(index === 0 || index === 1 || index === 2) ? { marginTop: '-18px' } : undefined}
                      className="border-2 border-dashed border-zinc-850 bg-zinc-950/40 p-6 h-[410px] rounded-3xl flex flex-col items-center justify-center text-center gap-4 hover:border-zinc-700 hover:bg-zinc-900/20 cursor-pointer group transition-all"
                    >
                      <div className="bg-zinc-900 text-zinc-500 font-extrabold px-1.5 py-0.5 rounded text-[7.5px]">
                        SLOT #{slotNum}
                      </div>
                      
                      <div className="w-12 h-12 border-2 border-dashed border-zinc-800 rounded-full flex items-center justify-center text-zinc-600 group-hover:border-white group-hover:text-white duration-200">
                        <Plus className="w-5 h-5 transition-transform group-hover:scale-110" />
                      </div>

                      <div className="space-y-1">
                        <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block group-hover:text-zinc-300">
                          ESPAÇO DISPONÍVEL
                        </span>
                        <span className="text-[7px] text-zinc-600 block leading-normal px-4">
                          CLIQUE AQUI PARA DESIGNAR ESTE SLOT
                        </span>
                      </div>

                      <button
                        className="py-1 px-3 border border-dashed border-zinc-800 text-[7.5px] text-zinc-400 group-hover:border-white group-hover:text-white uppercase font-bold transition-all cursor-pointer"
                      >
                        CRIAR CRIATURA 🪄
                      </button>
                    </div>
                  );
                }
              })}

            </div>

          </div>
        )}

        {/* TAB 2: IMPRIMIR (Packaging print station layout) */}
        {activeTab === 'print' && (
          <div className="space-y-6">
            <PrintSheetSetup cards={deck} />
          </div>
        )}

        {/* TAB 3: REGRAS (Fidelity retro manual book) */}
        {activeTab === 'rules' && (
          <div className="bg-black text-white p-8 border-2 border-zinc-800 rounded-3xl max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Header Manual Book */}
            <div className="border-b-2 border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                  <BookOpen className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xs font-black tracking-widest font-display text-white uppercase">MANUAL DE INSTRUÇÕES DA COLISEU</h2>
                  <p className="text-[7.5px] text-zinc-500 font-extrabold uppercase tracking-widest mt-0.5">MANUAL OFICIAL DO CRIADOR DE BILOWS • VERSÃO 1.5</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('desktop')}
                className="py-1.5 px-4 border border-zinc-705 bg-zinc-900 hover:bg-white text-zinc-300 hover:text-black font-extrabold text-[8px] uppercase transition-colors cursor-pointer"
              >
                VOLTAR AO DESKTOP
              </button>
            </div>

            {/* General Intro Banner */}
            <div className="border-2 border-emerald-500 p-4 bg-emerald-950/20 text-zinc-300 rounded-xl space-y-1.5">
              <span className="text-emerald-400 font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
                ⚔️ CÓDIGO DO CONFRONTADOR ANALÓGICO
              </span>
              <p className="text-[8.5px] leading-relaxed">
                ESTE MANUAL REGULAMENTA AS COMBINAÇÕES DA ARENA DO COLISEU BILOWS. CADA BILOW É CONSTRUÍDO COM CONDIÇÕES BASEADAS NO SEU <strong>PESO (KG)</strong>. O PESO DETERMINA AUTOMATICAMENTE OS ATRIBUTOS DA SUA MINIATURA: A GRADE DE 19 VIDAS, O ELEMENTO DE POWER ATAK, O MULTIPLICADOR ANTÍPODA E A CAPACIDADE DE RECUAR. LEIA ATENTAMENTE PARA DOMINAR A ARENA!
              </p>
            </div>

            {/* Grid Manual Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BLOCK 1: INICIATIVA E ROLAGEM */}
              <div className="border border-zinc-850 p-5 bg-zinc-900/30 space-y-3 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="bg-zinc-800 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">01</span>
                    <h3 className="text-[10px] font-black text-white uppercase">DISPUTA DE INICIATIVA</h3>
                  </div>
                  <p className="text-zinc-400 text-[8.5px] leading-relaxed">
                    NÃO HÁ PREFERÊNCIA ARBITRÁRIA NA ARENA DO COLISEU. AO CLICAR EM <strong>"INICIAR COMBATE"</strong>, AMBOS OS CRIADORES REALIZAM UMA JOGADA DE DADO SIMULTÂNEA:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[8px] text-zinc-300">
                    <li>CADA LADO ROLA UM DADO DE 6 FACES (1 A 6).</li>
                    <li>SÃO RETIRADOS VALORES DADOS ATÉ QUE ALGUÉM OBTENHA UM NÚMERO MAIOR.</li>
                    <li>O MONSTRO COM O MAIOR RETORNO OBTÉM A <strong>INICIATIVA</strong> E COMEÇA GOVERNANDO O PRIMEIRO TURNO.</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 2: COMPRA DE CARTAS ENVELOPE */}
              <div className="border border-zinc-850 p-5 bg-zinc-900/30 space-y-3 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="bg-zinc-800 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">02</span>
                    <h3 className="text-[10px] font-black text-white uppercase">SAQUE DA CARTA DE COMPORTAMENTO</h3>
                  </div>
                  <p className="text-zinc-400 text-[8.5px] leading-relaxed">
                    EM SEU TURNO DE DISPUTA, ANTES MESMO DE CONVOCAR O COMANDO DE ATAQUE, O JOGADOR DEVE SACAR UMA CARTA DE COMPORTAMENTO DA ESTANTE:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[8px] text-zinc-300">
                    <li>O DECK CONTÉM AS TRÊS FORMAS SAGRADAS: <strong>■ QUADRADO</strong>, <strong>▲ TRIÂNGULO</strong> E <strong>● CÍRCULO</strong>.</li>
                    <li>A FORMA DA VEZ É COMPARADA AO REQUISITO DETERMINÍSTICO DA SUA CRIATURA (QUE É EMBUTIDO SEGUNDO A ASSINATURA DA SUA CARTA).</li>
                    <li>SE A FORMA SACADA FOR IGUAL AO REQUISITO DA SUA CARTA, A CONDIÇÃO DE <strong>POWER ATAK</strong> É DESENCADEADA!</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 3: SOMA E DANO DO DECOMBATE */}
              <div className="border border-zinc-850 p-5 bg-zinc-900/30 space-y-3 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="bg-zinc-800 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">03</span>
                    <h3 className="text-[10px] font-black text-white uppercase">FORMULAÇÃO CENTRAL DE DANO</h3>
                  </div>
                  <p className="text-zinc-400 text-[8.5px] leading-relaxed">
                    A QUANTIDADE DE DANO ENVIADA AO ADVERSÁRIO SEGUE O SEGUINTE PROCESSO DE RESOLUÇÃO:
                  </p>
                  <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-850 space-y-1 font-mono text-[7px] text-emerald-400 leading-normal">
                    <p>• DANO BASE = RETORNO DO DADO (1 A 6)</p>
                    <p>• SE POWER ATAK ATIVO: DANO INTERMEDIÁRIO = DADO + 2</p>
                    <p>• SE POWER ATAK EXATINTO: DANO INTERMEDIÁRIO = DADO</p>
                    <p>• SE COMPORTAMENTO ATIVOU PAR/ÍMPAR: EXTRA RESPAWN DE +1 DANO</p>
                  </div>
                </div>
              </div>

              {/* BLOCK 4: O CRÍTICO DO ANTÍPODA */}
              <div className="border border-zinc-850 p-5 bg-zinc-900/30 space-y-3 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="bg-zinc-800 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">04</span>
                    <h3 className="text-[10px] font-black text-white uppercase">MULTIPLICADOR DE ANTÍPODA (2X)</h3>
                  </div>
                  <p className="text-zinc-400 text-[8.5px] leading-relaxed">
                    CADA REINO ELEMENTAL POSSUI UMA RELAÇÃO ANTÍPODA DETERMINADA PELO SEU SEED HISTÓRICO. QUANDO VOCÊ DEFRONTAR UM OPONENTE COMPARTILHANDO SEU ELEMENTO DE REBELIÃO:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[8px] text-zinc-300">
                    <li>SE O REINO DO ADVERSÁRIO BATALHAR SEU ELEMENTO DE FRAQUEZA <strong>(ANTÍPODA)</strong>: O DANO SOFRE MULTIPLICAÇÃO DOBRADA!</li>
                    <li>SOMA DETALHADA: O INTEGRAL DOS DANOS ADVERSÁRIOS SERÁ MULTIPLICADO POR 2, GURANDO MASSIVAS PERDAS DE HP NA GRADE!</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 5: SISTEMA DE COMPORTAMENTO */}
              <div className="border border-zinc-850 p-5 bg-zinc-900/30 space-y-3 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="bg-zinc-805 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">05</span>
                    <h3 className="text-[10px] font-black text-white uppercase">SE MEU DADO DER: (ARENA BEHAVIOR)</h3>
                  </div>
                  <p className="text-zinc-400 text-[8.5px] leading-relaxed">
                    O REQUISITO DA CONTA DE DADO ENERGIZA COMPORTAMENTOS ADICIONAIS:
                  </p>
                  <ul className="list-disc pl-4 space-y-1.5 text-[8px] text-zinc-300">
                    <li>SE O RETORNO DO DADO ALINHAR À REGRA ("PAR", "ÍMPAR", OU NÚMERO EXATO), O ESTADO DE <strong>ACTION E HIT</strong> DO PERSONAGEM ACENDE.</li>
                    <li>A COMUNICATIVIDADE DA ARENA NOTIFICA A ATIVAÇÃO DO GOLPE ESPECIAL E SOMA +1 PONTO ADICIONAL DE PERDA DE HP AO DEFENSOR.</li>
                  </ul>
                </div>
              </div>

              {/* BLOCK 6: RESTRIÇÃO DE EVOC 1 */}
              <div className="border border-zinc-850 p-5 bg-zinc-900/30 space-y-3 rounded-2xl flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="bg-zinc-805 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">06</span>
                    <h3 className="text-[10px] font-black text-white uppercase">RESTRIÇÃO DE RINGUE: EVOC 01</h3>
                  </div>
                  <p className="text-zinc-400 text-[8.5px] leading-relaxed">
                    PARA MANTER OS DESAFIOS CLÁSSICOS EM NÍVEL IGUALITÁRIO DE CAPACIDADES:
                  </p>
                  <ul className="list-disc pl-4 space-y-1 text-[8px] text-zinc-300">
                    <li>APENAS CRIATURAS DE ESTÁGIO INICIAL <strong>EVOC 1</strong> PODEM SER INVOCADAS PARA COMBATE DIRETO NO COMBATE DE CONTROLE.</li>
                    <li>CARTAS DA COLECÃO COM EVOLUÇÃO EVOC 02 OU COMPATÍVEIS SÃO MAIORES EM ESBOGO E SOFRERIAM RETALIAÇÕES DA FÍSICA ANALÓGICA DA ARENA!</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* BLOCK 7: TABULEIRO 19 + SKULL SLOT */}
            <div className="border border-zinc-800 p-6 bg-zinc-900/20 text-zinc-300 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                <span className="bg-zinc-800 text-white font-extrabold px-1.5 py-0.5 rounded text-[8px]">HP TRACKER</span>
                <h3 className="text-[10px] font-black text-white uppercase">SISTEMA PROGRESSIVO DE 19 CASAS + SKULL</h3>
              </div>
              <p className="text-[8.5px] leading-relaxed">
                DIFERENTE DE CARDGAMES DIGITAIS CONVENCIONAIS, O HP DA SUA CRIATURA NÃO É UM NÚMERO SOLTO NO AR. CADA BILOW POSSUI UMA TABELA DE COORDENADAS COCHESH COMPOSTA DE <strong>19 CASAS PROGRESSIVAS</strong> DE TAMANHO IDENTIFICATIVO E UMA <strong>20ª CASA CUSTOMIZADA EM PIXEL ART COM CAVEIRA</strong>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[8px] bg-black p-3 border border-zinc-800 rounded-lg">
                <div>
                  <h4 className="font-extrabold text-white uppercase mb-1">• LIT SLOTS (VIDA EM MARCHA)</h4>
                  <p className="text-zinc-400 leading-normal">
                    CONFORME AS DUAS CRIATURAS RECEBEM GOLPES, OS MARCADORES SÃO ARMAZONADOS. O HP ATUAL É PILOTADO DE FORMA VIVA COM UMA TELA DE LUZ PULSANTE VERMELHA NA SUA RESPECTIVA CASA DE HP TRACKING DA CARTA DO COMBATE.
                  </p>
                </div>
                <div>
                  <h4 className="font-extrabold text-white uppercase mb-1">• CASA 20 (INSTA-NOCAUTE DE CAVEIRA)</h4>
                  <p className="text-zinc-400 leading-normal">
                    SE OS SEUS SEUS DANOS TE LEVAREM À EXAUSTÃO FINAL DA 20ª CASA, SUA CRIATURA DESMAIA E SOFRE NOCAUTE INSTANTÂNEO (MÃO DE CAVEIRA), ESTABELECENDO O VENCEDOR DA DISPUTA DE COLO COISEU!
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Rules Action Button Area */}
            <div className="border-t border-zinc-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-[7.5px] text-zinc-500 font-extrabold uppercase tracking-widest text-center md:text-left">
                ENTENDEU AS INSTRUÇÕES? AGORA ESTÁ NA HORA DE PROVAR SUA ARTE NO RINGUE DE METAL!
              </span>
              <button
                onClick={() => setActiveTab('desktop')}
                className="w-full md:w-auto py-3 px-10 border-2 border-white bg-white text-black font-black uppercase hover:bg-black hover:text-white transition-all cursor-pointer text-[10px] tracking-widest shadow-[0_5px_15px_rgba(255,255,255,0.1)] hover:shadow-none"
              >
                VOLTAR AO WORKSPACE DE CRIADOR
              </button>
            </div>
          </div>
        )}


        {/* TAB 4: CONVIDAR (PvP simulator & Challenge linker) */}
        {activeTab === 'invite' && (
          <div className="space-y-6">
            <div className="bg-black text-white p-6 border-2 border-zinc-800 rounded-3xl max-w-4xl mx-auto flex flex-col gap-6">
              
              <div className="border border-zinc-800 p-4 bg-zinc-950 flex flex-col gap-2">
                <span className="text-zinc-500 font-black block">CONVIDAR OPONENTE PARA UMA DISPUTA DE DECK</span>
                <h3 className="text-sm font-black text-white">GERADOR DE DISPUTA ANALÓGICA</h3>
                <p className="text-zinc-400 text-[8.5px] tracking-wider leading-relaxed">
                  INSIRA O CODNOME DO SEU ADVERSÁRIO PARA GERAR UM TOKEN COMPARTILHÁVEL CRIPTOGRAFADO DE RETORNO DO DUELO. COPIE O LINK DA SALA E MANDE PARA ELE REALIZAR O DUELO DE CARTAS CONTIGO!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Invite panel */}
                <div className="p-4 border-2 border-white bg-black flex flex-col gap-4">
                  <div className="space-y-2">
                    <label className="block text-[8px] text-zinc-400 font-bold">NOME DO CUIDADOR / DESAFIANTE</label>
                    <input
                      type="text"
                      maxLength={14}
                      value={inviteOpponentName}
                      onChange={(e) => setInviteOpponentName(e.target.value.substring(0, 14).toUpperCase())}
                      className="w-full bg-black border-2 border-zinc-800 text-white p-2 text-[9px] font-black focus:outline-none focus:border-white uppercase"
                    />
                  </div>

                  <div className="bg-zinc-950 p-3 border border-zinc-800 font-mono text-[8px] tracking-widest leading-normal text-zinc-300">
                    SALA DE ESPERA:<br />
                    ANALOG_DISPUTE_ID: <span className="text-white">BILOWS-DISPUTA-{inviteOpponentName || 'OPONENTE'}-KEY-CODE</span><br />
                    TEMPO DE EXPIRAÇÃO: <span className="text-emerald-500">20 MINUTOS DISPONÍVEL</span>
                  </div>

                  <button
                    onClick={triggerCopyInviteLink}
                    className="py-3 border-2 border-white bg-white text-black font-black text-center text-xs uppercase hover:bg-black hover:text-white cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {inviteCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        LINK COPIADO COM SUCESSO!
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        COPIAR LINK DE CONVITE 🔗
                      </>
                    )}
                  </button>
                </div>

                {/* Challenge rules instructions summary */}
                <div className="p-4 border-2 border-zinc-850 bg-zinc-950 flex flex-col h-full justify-between gap-4">
                  <div>
                    <span className="font-extrabold text-white block mb-2 border-b border-zinc-800 pb-1">COMBATE DE SIMULAÇÃO</span>
                    <p className="text-zinc-400 leading-relaxed text-[8.5px]">
                      APERTE NO BOTÃO ABAIXO PARA ENTRAR NO SIMULADOR DE COMBATE FÁCIL DA ARENA. NELE VOCÊ SELECIONA UMA DA SUAS CRIATURAS E COLOCA ELA EM TESTE DE DADOS CONTRA OUTRAS CARTAS DO DECK!
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('invite')} 
                    className="w-full py-2 bg-zinc-900 border border-zinc-700 font-black text-[9px] text-[#ffffff] duration-200 mt-4 cursor-pointer uppercase"
                  >
                    STATUS DA SALA DE ESPERA: AGUARDANDO ADVERSÁRIO ANALÓGICO
                  </button>
                </div>

              </div>

            </div>

            {/* Simulated Live battle simulator table below */}
            <BattleSimulator cards={deck} />
          </div>
        )}

        {/* TAB 5: CAIXA DE MENSAGEM (Safe Chat with Organized intelligent Dialogue blocks) */}
        {activeTab === 'chat' && (
          <div className="bg-black text-white p-6 border-2 border-zinc-800 rounded-3xl max-w-4xl mx-auto flex flex-col gap-6">
            
            <div className="border border-white p-4.5 bg-zinc-950 flex flex-col gap-1.5 text-center">
              <span className="text-zinc-400 block text-[8px]">AMBIE CONECTION - CHAT BLINDADO ANTI-ABUSO</span>
              <h2 className="text-base font-black tracking-widest text-[#ffffff] font-display">CAIXA DE MENSAGEM COM BLOCOS DE CONSTRUÇÃO INDEPENDENTE</h2>
              <p className="text-zinc-500 text-[8.5px] leading-relaxed">
                NÃO É POSSÍVEL DIGITAR LIVREMENTE. ISTO IMPEDE O COMPORTAMENTO E AS COMUNICAÇÕES IMPRÓPRIAS. CLIQUE NAS EXPRESSÕES PRONTAS E CONCEITUAIS INTELIGENTES NAS ABAS ABAIXO PARA ENVIAR DIALOGOS!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
              
              {/* Organized Category selection sidebar (4 columns) */}
              <div className="md:col-span-4 flex flex-col gap-4">
                
                {/* 👋 CUMPRIMENTAR tab block */}
                <div className="border-2 border-zinc-800 p-3.5 bg-zinc-950 flex flex-col gap-2">
                  <span className="font-black text-[9.5px] text-white border-b border-zinc-800 pb-1.5 uppercase tracking-wider flex items-center gap-1">
                    👋 CUMPRIMENTAR
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleSendQuickMessage('OLÁ! ADOREI A ARTE DE SUA CRIAÇÃO!')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "OLÁ! ADOREI A ARTE..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('SAUDAÇÕES, NOBRE CRIADOR! SEU DESENHO FICOU INCRÍVEL!')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "SAUDAÇÕES, NOBRE CRI..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('É UM PRAZER EXPERIMENTAR ESSE NOVO ELEMENTO COM VOCÊ.')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "É UM PRAZER EXPERIM..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('QUE INCRÍVEL ESSE SEU ACABAMENTO NA PAISAGEM!')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "QUE INCRÍVEL ESSE..."
                    </button>
                  </div>
                </div>

                {/* 💰 OFERECER / PROPOR tab block */}
                <div className="border-2 border-zinc-800 p-3.5 bg-zinc-950 flex flex-col gap-2">
                  <span className="font-black text-[9.5px] text-white border-b border-zinc-800 pb-1.5 uppercase tracking-wider flex items-center gap-1">
                    💰 OFERECER / PROPOR
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <button
                      onClick={() => handleSendQuickMessage('PROPONHO UMA DISPUTA AGORA MESMO COM MEU MELHOR MONSTRO!')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "PROPONHO UMA DISPUT..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('DESAFIO SEU PERSONAGEM DE ELEMENTO OPONENTE PARA ARENA!')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "DESAFIO SEU PERSON..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('MINHA VIDA CONTRA A SUA, QUANTAS COORDENADAS COPIAR?')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "MINHA VIDA CONTRA..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('ACEITA UMA DISPUTA COM CARTAS IMPRESSAS EM PAPEL?')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "ACEITA UMA DISPUTA..."
                    </button>
                    <button
                      onClick={() => handleSendQuickMessage('VAMOS COMBATER! MINHA EVOLUÇÃO ESTÁ NO MÁXIMO!')}
                      className="text-left font-semibold p-2 bg-black hover:bg-zinc-900 border border-zinc-750 text-[8px] truncate cursor-pointer text-[#ffffff]"
                    >
                      "VAMOS COMBATER! M..."
                    </button>
                  </div>
                </div>

              </div>

              {/* Chat log visual console (8 columns) */}
              <div className="md:col-span-8 flex flex-col justify-between border-2 border-white bg-black p-4 min-h-[350px]">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 text-zinc-500 font-bold mb-2">
                  <span>DISPUTAS_CHAT_FEED_CONSOLE v.01</span>
                  <span className="text-emerald-500">● CONECTADO</span>
                </div>

                {/* Log messages scroll */}
                <div className="flex-grow space-y-2 overflow-y-auto max-h-72 pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                  {chatLogs.map((log) => (
                    <div 
                      key={log.id} 
                      className={`p-2 border ${
                        log.sender === 'VOCÊ' 
                          ? 'border-white bg-[#ffffff] text-black text-right ml-12' 
                          : log.sender === 'SISTEMA'
                          ? 'border-dashed border-zinc-800 bg-black text-zinc-500 text-center'
                          : 'border-zinc-800 bg-zinc-950 text-white mr-12'
                      }`}
                    >
                      <span className="text-[7.5px] text-zinc-400 block font-bold mb-0.5">{log.sender}</span>
                      <p className="font-bold text-[8.5px] uppercase">{log.text}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-zinc-800 pt-2 flex items-center justify-between text-zinc-500 text-[8px]">
                  <span>DIÁLOGO SEGURO COMPOSITOR</span>
                  <span>PRESTÍGIO DO RETORNO: ANALÓGICO COMPLETO</span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Off-screen export container to render static cards at high quality without interactive elements or hover states */}
        {exportCard && (
          <div 
            style={{ 
              position: 'absolute', 
              top: '-9999px', 
              left: '-9999px', 
              width: '420px', 
              height: '620px',
              overflow: 'hidden',
              backgroundColor: '#ffffff'
            }}
          >
            <div id="clean-image-export-target" className="bg-white" style={{ width: '420px', height: '620px' }}>
              <BilowCardView card={exportCard} scale={1} showCutGuides={false} />
            </div>
          </div>
        )}

      </main>

      {/* FOOTER NO-PRINT (Fully Black) */}
      <footer className="no-print mt-auto border-t-2 border-white bg-black py-5 text-center text-[7.5px] text-zinc-500 uppercase">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
          <p>© 2026 BILOW. CRIAÇÕES DE CARDS TOTALMENTE REGULADAS E PARÂMETROS EM ARIAL TAMANHO 9.</p>
          <div className="flex gap-2">
            <span>SISTEMA PRETO SOLIDIFICADO</span>
            <span>|</span>
            <span>OFICINA IMPRESSÃO A4 INSTANTÂNEA</span>
          </div>
        </div>
      </footer>
      
      {/* Custom Deletion Confirmation Modal */}
      {deleteConfirmCardId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/80">
          <div className="bg-zinc-950 border-2 border-red-500 rounded-2xl max-w-sm w-full p-6 text-center shadow-[0_0_30px_rgba(239,68,68,0.3)] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-extrabold text-red-500 text-lg tracking-wider mb-2 uppercase">
              ⚠️ BANIR CARTA?
            </h3>
            <p className="text-zinc-300 text-xs uppercase mb-6 leading-relaxed">
              DESEJA MESMO EXCLUIR ESTA CARTA DE SEU BARALHO? ESTA AÇÃO NÃO PODE SER UNDONE.
            </p>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmCardId(null)}
                className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-[10px] font-black uppercase rounded-lg border border-zinc-700 cursor-pointer transition-colors"
              >
                CANCELAR
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-2 bg-red-950 hover:bg-red-900 border border-red-500 text-red-400 hover:text-white text-[10px] font-black uppercase rounded-lg cursor-pointer transition-colors"
              >
                SIM, EXCLUIR
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
