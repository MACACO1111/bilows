import React, { useState } from 'react';
import { BilowCard } from '../types';
import BilowCardView from './BilowCardView';
import { Printer, Check, Copy, Grid, FileText, Layout, Flame, Download } from 'lucide-react';

interface PowerCardItem {
  id: string;
  shape: 'CÍRCULO' | 'QUADRADO' | 'TRIÂNGULO';
  color: string;
  symbol: string;
  isPower: true;
}

const powerCardsList: PowerCardItem[] = [
  { id: 'power-circle-1', shape: 'CÍRCULO', color: '#3b82f6', symbol: '◯', isPower: true },
  { id: 'power-circle-2', shape: 'CÍRCULO', color: '#3b82f6', symbol: '◯', isPower: true },
  { id: 'power-circle-3', shape: 'CÍRCULO', color: '#3b82f6', symbol: '◯', isPower: true },
  { id: 'power-square-1', shape: 'QUADRADO', color: '#ef4444', symbol: '◻', isPower: true },
  { id: 'power-square-2', shape: 'QUADRADO', color: '#ef4444', symbol: '◻', isPower: true },
  { id: 'power-square-3', shape: 'QUADRADO', color: '#ef4444', symbol: '◻', isPower: true },
  { id: 'power-triangle-1', shape: 'TRIÂNGULO', color: '#eab308', symbol: '△', isPower: true },
  { id: 'power-triangle-2', shape: 'TRIÂNGULO', color: '#eab308', symbol: '△', isPower: true },
  { id: 'power-triangle-3', shape: 'TRIÂNGULO', color: '#eab308', symbol: '△', isPower: true },
];

function PowerCardView({ 
  shape, 
  color, 
  symbol, 
  showCutGuides = false 
}: { 
  shape: 'CÍRCULO' | 'QUADRADO' | 'TRIÂNGULO'; 
  color: string; 
  symbol: string; 
  showCutGuides?: boolean;
}) {
  return (
    <div 
      className={`aspect-[63.5/88.9] border-4 border-black bg-white rounded-[14px] flex flex-col justify-between p-3.5 text-center text-black relative select-none ${
        showCutGuides ? 'outline outline-1 outline-dashed outline-zinc-300' : ''
      }`}
      style={{ width: '206px', height: '288px' }}
    >
      {/* Top Header */}
      <div className="flex justify-between items-center border-b border-zinc-300 pb-1 w-full text-black">
        <span className="text-[7.5px] font-black tracking-widest text-black">CARTA DE PODER</span>
        <span className="text-xs font-black text-black">{symbol}</span>
      </div>

      {/* Center Image Canvas with Shape */}
      <div className="flex-grow flex flex-col justify-center items-center my-2 border border-zinc-200 bg-white rounded-xl relative overflow-hidden p-2">
        {/* Render actual shape (painted black for ink-saving) */}
        {shape === 'CÍRCULO' && (
          <svg className="w-14 h-14 relative z-10" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="30" fill="none" stroke="black" strokeWidth="8" />
          </svg>
        )}
        {shape === 'QUADRADO' && (
          <svg className="w-14 h-14 relative z-10" viewBox="0 0 100 100">
            <rect x="20" y="20" width="60" height="60" fill="none" stroke="black" strokeWidth="8" />
          </svg>
        )}
        {shape === 'TRIÂNGULO' && (
          <svg className="w-14 h-14 relative z-10" viewBox="0 0 100 100">
            <polygon points="50,15 85,80 15,80" fill="none" stroke="black" strokeWidth="8" />
          </svg>
        )}
        
        <span className="text-[7.5px] tracking-wider text-zinc-500 font-mono mt-1.5 z-10">RECURSO OFICIAL</span>
      </div>

      {/* Rules and Behavior */}
      <div className="bg-zinc-50 border border-zinc-200 p-1.5 rounded-lg text-left">
        <div className="text-[8.5px] font-black tracking-wide text-black flex items-center gap-1 border-b border-zinc-250 pb-0.5">
          <span className="text-black">{symbol}</span>
          <span className="text-black">PODER: {shape}</span>
        </div>
        <p className="text-[6.5px] text-zinc-700 font-normal leading-relaxed mt-1 uppercase tracking-wider">
          {shape === 'CÍRCULO' && "RECURSO PARA EMBATES DO ELEMENTO ÁGUA E AR OU GERAR EVOLUÇÕES FLUIDAS NO SEU TURNO."}
          {shape === 'QUADRADO' && "ESCUDO SÍSMICO RESISTENTE. BLOQUEIA DE MANEIRA EFICAZ ATAQUES INIMIGOS E RESTABELECE POSIÇÃO."}
          {shape === 'TRIÂNGULO' && "GATILHO DE ATAQUE CRÍTICO. REPOTENCIA O VALOR DO DADO EXTRA E FRAGMENTA DEFESAS ADVERSÁRIAS."}
        </p>
      </div>

      {/* Footer Branding */}
      <div className="flex justify-between items-center border-t border-zinc-300 pt-1 text-[5.5px] tracking-widest text-zinc-500 font-mono w-full">
        <span>X3 COPIAS</span>
        <span>BILOWS SYSTEMS © 2026</span>
      </div>
    </div>
  );
}

interface PrintSheetSetupProps {
  cards: BilowCard[];
}

export default function PrintSheetSetup({ cards }: PrintSheetSetupProps) {
  // Collection of card IDs selected for final printing
  const [printQueue, setPrintQueue] = useState<string[]>(
    cards.slice(0, 9).map(c => c.id) // Pre-select up to 9 cards
  );
  
  // Grid density option: 1 to 9 cards
  const [gridCount, setGridCount] = useState<number>(9);
  
  // Alternate view to print Card Backs (costas das cartas)
  const [printMode, setPrintMode] = useState<'front' | 'back'>('front');

  // Print source: 'creatures' (custom cards) or 'power' (standard power cards: 3 circles, 3 squares, 3 triangles)
  const [printSource, setPrintSource] = useState<'creatures' | 'power'>('creatures');

  const toggleSelectCard = (cardId: string) => {
    if (printQueue.includes(cardId)) {
      setPrintQueue(prev => prev.filter(id => id !== cardId));
    } else {
      if (printQueue.length < 9) {
        setPrintQueue(prev => [...prev, cardId]);
      }
    }
  };

  const addIndividualCard = (cardId: string) => {
    if (printQueue.length < 9) {
      setPrintQueue(prev => [...prev, cardId]);
    }
  };

  const removeQueueItemAtIndex = (index: number) => {
    setPrintQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearQueue = () => {
    setPrintQueue([]);
  };

  const triggerNativePrint = () => {
    window.print();
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleDownloadSheetImage = async () => {
    setIsExporting(true);
    // Let React render state
    await new Promise(resolve => setTimeout(resolve, 200));

    try {
      const { toJpeg } = await import('html-to-image');
      const element = document.getElementById('printable-a4-sheet-capture');
      if (element) {
        const dataUrl = await toJpeg(element, {
          quality: 0.98,
          backgroundColor: '#ffffff',
          pixelRatio: 2.5 // Generates ultra-high resolution image (approx 1600x2300 pixels) for crisp A4 paper printing!
        });
        const folderName = printSource === 'power' ? 'cartas_poder' : 'cartas_criaturas';
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `folha_impressao_bilows_${folderName}.jpg`;
        link.click();
      } else {
        alert('Elemento de captura da folha não encontrado!');
      }
    } catch (err) {
      console.error('Erro ao gerar imagem da folha de impressão:', err);
      alert('Erro ao processar imagem da folha.');
    } finally {
      setIsExporting(false);
    }
  };

  // Build the list of BilowCards or PowerCardItems to fill the 3x3 slot layout of A4
  const gridSlots = printSource === 'power'
    ? powerCardsList
    : Array.from({ length: gridCount }).map((_, idx) => {
        const cardId = printQueue[idx];
        return cards.find(c => c.id === cardId);
      });

  return (
    <div className="flex flex-col gap-6 font-sans text-[9px] uppercase tracking-wider text-white bg-black p-4 border-2 border-zinc-800 rounded-3xl max-w-7xl mx-auto">
      
      {/* EXPLANATORY HEADER BANNER */}
      <div className="bg-black border-2 border-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-lg font-black font-display text-white tracking-wide">
            ESTAÇÃO DE CONFIGURAÇÃO DE IMPRESSÃO
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 self-stretch md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleDownloadSheetImage}
            disabled={gridSlots.filter(Boolean).length === 0 || isExporting}
            className="flex items-center gap-2 px-6 py-3.5 bg-zinc-900 text-white border-2 border-zinc-800 hover:border-white disabled:opacity-30 disabled:pointer-events-none font-black text-xs uppercase tracking-widest transition-all text-center justify-center cursor-pointer"
            title="Salvar a folha completa com as 9 cartas já organizadas em um único arquivo de imagem de alta resolução pronto para impressão"
          >
            <Download className="w-4 h-4 shrink-0 text-emerald-400" />
            {isExporting ? 'GERANDO FOLHA... ⏳' : 'SALVAR FOLHA COMPLETA (.JPG) 💾'}
          </button>

          <button
            type="button"
            onClick={triggerNativePrint}
            className="flex items-center gap-2 px-6 py-3.5 bg-white text-black border-2 border-white font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all text-center justify-center cursor-pointer"
          >
            <Printer className="w-4 h-4 shrink-0" />
            IMPRIMIR ESTA FOLHA A4
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
        
        {/* PANEL CONTROL & SELECTORS */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-zinc-950 p-4 border-2 border-zinc-800">
          
          {/* MODO SELETOR: CRIATURAS OU CARTAS DE PODER */}
          <div>
            <div className="text-xs font-semibold text-white font-display mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Flame className="w-4 h-4 text-amber-400" />
              MODO DE IMPRESSÃO
            </div>
            <div className="grid grid-cols-2 gap-1.5 bg-black p-1.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setPrintSource('creatures')}
                className={`py-2 text-[8px] font-black transition-colors ${
                  printSource === 'creatures' 
                    ? 'bg-white text-black border border-white font-black' 
                    : 'text-neutral-100 hover:text-white'
                }`}
              >
                CRIATURAS DO DECK
              </button>
              <button
                type="button"
                onClick={() => {
                  setPrintSource('power');
                  setGridCount(9);
                }}
                className={`py-2 text-[8px] font-black transition-colors ${
                  printSource === 'power' 
                    ? 'bg-amber-500 text-black border border-amber-500 font-black' 
                    : 'text-neutral-100 hover:text-white'
                }`}
              >
                CARTAS DE PODER (9 UN)
              </button>
            </div>
            <p className="text-[7.5px] text-white mt-1 lines-normal leading-normal">
              {printSource === 'power' 
                ? 'COMPUTA MANUALMENTE 9 CARTAS OFICIAIS DE RECURSO: 3 QUADRADOS, 3 CÍRCULOS E 3 TRIÂNGULOS.'
                : 'IMPRIME AS SUAS RECONSTITUIÇÕES EXCLUSIVAS DE CRIATURAS SALVAS NO SEU BARALHO.'
              }
            </p>
          </div>

          {/* 1. Layout Mode Switcher */}
          <div>
            <div className="text-xs font-semibold text-white font-display mb-2.5 flex items-center gap-1.5 uppercase tracking-wider">
              <Layout className="w-4 h-4" />
              TIPO DE REVESTIMENTO: {printMode}
            </div>
            
            <div className="grid grid-cols-2 gap-1.5 bg-black p-1.5 border border-zinc-800">
              <button
                type="button"
                onClick={() => setPrintMode('front')}
                className={`py-2 text-[8.5px] font-black transition-colors ${
                  printMode === 'front' 
                    ? 'bg-white text-black border-2 border-white' 
                    : 'text-neutral-100 hover:text-white'
                }`}
              >
                FRENTE (CRIATURA E ATRIBUTOS)
              </button>
              <button
                type="button"
                onClick={() => setPrintMode('back')}
                className={`py-2 text-[8.5px] font-black transition-colors ${
                  printMode === 'back' 
                    ? 'bg-white text-black border-2 border-white' 
                    : 'text-neutral-100 hover:text-white'
                }`}
              >
                COSTAS (CAPA LOGO BILOWS)
              </button>
            </div>
          </div>

          {/* 2. Grid Slots count per page (Only for creatures) */}
          {printSource === 'creatures' && (
            <div>
              <div className="text-xs font-semibold text-white font-display mb-2.5 flex items-center justify-between">
                <span className="uppercase tracking-wider flex items-center gap-1.5">
                  <Grid className="w-4 h-4" />
                  DENSIDADE DE IMPRESSÃO: {gridCount} CARDS/PÁG
                </span>
              </div>

              <div className="grid grid-cols-5 gap-1.5 bg-black p-1 border border-zinc-800">
                {[1, 2, 4, 6, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setGridCount(num)}
                    className={`py-1.5 text-xs font-bold transition-all ${
                      gridCount === num 
                        ? 'bg-neutral-200 text-black font-black' 
                        : 'text-white hover:bg-zinc-900'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-[8px] text-white mt-1.5 leading-normal">
                A DISPOSIÇÃO 3X3 ABRIGA ATÉ 9 CARTAS COLETIVAS DE FORMA ORGANIZADA NUMA FOLHA A4 COM GUIAS DE CORTE PRECISAS.
              </p>
            </div>
          )}

          {/* 3. Choose which cards to put in grid queues (Only for creatures) */}
          {printSource === 'creatures' ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-semibold text-white font-display uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  SEU BARALHO ({cards.length} CRIATURAS)
                </div>
                <button
                  type="button"
                  onClick={clearQueue}
                  className="text-[8px] text-red-500 hover:text-red-400 font-bold font-mono cursor-pointer"
                >
                  LIMPAR FILA
                </button>
              </div>

              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800">
                {cards.map((card) => {
                  const instancesCount = printQueue.filter(id => id === card.id).length;
                  const isSelected = instancesCount > 0;

                  return (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-2 bg-black border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded bg-white shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[10px] font-black text-white truncate">{card.name}</p>
                          <p className="text-[8px] text-white font-mono tracking-wider">{card.elemento} | PESO {card.peso} KG</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {isSelected && (
                          <button
                            type="button"
                            onClick={() => toggleSelectCard(card.id)}
                            className="px-1.5 py-1 bg-red-950 border border-red-900 text-red-100 hover:bg-red-900 font-black cursor-pointer text-[8px]"
                          >
                            RMO DE VEZ
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => addIndividualCard(card.id)}
                          disabled={printQueue.length >= 9}
                          className="px-2 py-1 bg-zinc-900 border border-white text-white disabled:opacity-30 cursor-pointer text-[8px] font-bold"
                        >
                          + ADD (+{instancesCount})
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/60 border border-white rounded-xl text-white font-mono leading-normal text-[8px]">
              <p className="font-bold text-amber-400 mb-1">MÃO DE PODER DISPARADA 🎴</p>
              <p className="text-white mb-3 leading-relaxed">A FILA FOI AUTOMATICAMENTE CONFIGURADA PARA PRODUZIR EXATAMENTE 9 CARTAS COMPATÍVEIS PARA O DIÁRIO DE BATALHA:</p>
              <ul className="space-y-1 text-white">
                <li className="flex items-center gap-1">● 03 CÍRCULOS DE PROPAGAÇÃO</li>
                <li className="flex items-center gap-1">● 03 QUADRADOS PROTETORES SÍSMICOS</li>
                <li className="flex items-center gap-1">● 03 TRIÂNGULOS DE RUMBO CRÍTICO</li>
              </ul>
              <p className="text-white mt-4 leading-relaxed">NÃO É NECESSÁRIA SELEÇÃO MANUAL. ESTES ITENS JÁ COBREM O PADRÃO DE JOGO INTEIRO.</p>
            </div>
          )}
        </div>

        {/* 3X3 GRID LIVE LAYOUT PREVIEW (Right 8 columns) */}
        <div className="lg:col-span-8 bg-zinc-950 p-6 border-2 border-zinc-800 flex flex-col items-center">
          <div className="mb-4 text-center">
            <span className="text-white font-bold block">
              {printSource === 'power' ? 'FILA DE IMAGENS DE PODER ATIVADA: 3◯, 3◻, 3△' : `FILA DE DOCUMENTOS SELECIONADOS (${printQueue.length} / 9)`}
            </span>
            <span className="text-[8px] text-white/90">ARRASTE OU REORGANIZE SE COMPATÍVEL. IMPRIMA EM TAMANHO INTEIRO A4.</span>
          </div>

          <div className="bg-white border-2 border-dashed border-zinc-500 p-8 shadow-inner overflow-x-auto max-w-full">
            <div className="grid grid-cols-3 gap-x-1.5 gap-y-1.5 justify-center" style={{ width: '640px' }}>
              {gridSlots.map((card, index) => {
                if (!card) {
                  return (
                    <div 
                      key={`empty-${index}`} 
                      className="aspect-[63.5/88.9] border-2 border-dashed border-zinc-300 rounded-[12px] bg-neutral-50/55 flex flex-col items-center justify-center text-zinc-800 font-bold gap-1 transition-colors"
                      style={{ width: '206px', height: '288px' }}
                    >
                      <Grid className="w-5 h-5 opacity-40" />
                      <span className="text-[8px] uppercase tracking-wider font-mono">POSIÇÃO {index + 1}</span>
                    </div>
                  );
                }

                const isPower = 'isPower' in card;

                return (
                  <div id={`print-grid-item-${index}`} key={`${card.id}-${index}`} className="relative group cursor-pointer" onClick={() => { if (!isPower) removeQueueItemAtIndex(index); }}>
                    {printMode === 'front' ? (
                      isPower ? (
                        <PowerCardView 
                          shape={(card as any).shape} 
                          color={(card as any).color} 
                          symbol={(card as any).symbol} 
                          showCutGuides={true}
                        />
                      ) : (
                        <BilowCardView 
                          card={card as BilowCard} 
                          scale={206 / 420} // scale to width 206px dynamically
                          showCutGuides={true}
                        />
                      )
                    ) : (
                      /* Card Back visual placeholder for printing */
                      <div 
                        className="aspect-[63.5/88.9] border-4 border-black bg-black rounded-[14px] flex flex-col justify-between p-3.5 text-center text-white"
                        style={{ width: '206px', height: '288px' }}
                      >
                        <div className="border border-zinc-700 py-1 flex items-center justify-center text-[10px] bg-zinc-900 font-bold tracking-widest text-white uppercase">
                          BILOWS
                        </div>
                        <div className="flex flex-col items-center justify-center flex-grow">
                          <span className="text-[8px] text-zinc-500 font-mono uppercase">
                            {isPower ? `RECURSO ${(card as any).shape}` : 'MÃO OFICIAL'}
                          </span>
                        </div>
                        <div className="text-[8.5px] font-black tracking-widest text-[#ffffff] bg-black border border-white p-1">
                          BILOW
                        </div>
                      </div>
                    )}
                    {/* Hover remove layout trigger */}
                    {!isPower && (
                      <div className="absolute inset-x-0 -bottom-2 translate-y-full bg-red-950 text-red-200 border border-red-900 px-2 py-1 text-center text-[7.5px] font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                        CLIQUE PARA REMOVER
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* PRINT-ONLY AREA (ONLY visible inside raw window.print() output) */}
      <div className="print-only">
        <div className="min-h-screen bg-white text-black p-0 m-0">
          <div className="grid grid-cols-3 gap-x-1.5 gap-y-1.5 justify-center mx-auto" style={{ width: '640px' }}>
            {gridSlots.map((card, index) => {
              if (!card) return null;
              const isPower = 'isPower' in card;

              return (
                <div key={`print-${card.id}-${index}`}>
                  {printMode === 'front' ? (
                    isPower ? (
                      <PowerCardView 
                        shape={(card as any).shape} 
                        color={(card as any).color} 
                        symbol={(card as any).symbol} 
                        showCutGuides={true}
                      />
                    ) : (
                      <BilowCardView 
                        card={card as BilowCard} 
                        scale={206 / 420} 
                        showCutGuides={true}
                      />
                    )
                  ) : (
                    <div 
                      className="aspect-[63.5/88.9] border-4 border-black bg-black rounded-[14px] flex flex-col justify-between p-3.5 text-center text-white"
                      style={{ width: '206px', height: '288px' }}
                    >
                      <div className="border border-zinc-700 py-1 flex items-center justify-center text-[10px] bg-zinc-900 font-bold tracking-widest text-white uppercase">
                        BILOWS
                      </div>
                      <div className="flex flex-col items-center justify-center flex-grow">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase">
                          {isPower ? `RECURSO ${(card as any).shape}` : 'MÃO OFICIAL'}
                        </span>
                      </div>
                      <div className="text-[8.5px] font-black tracking-widest text-[#ffffff] bg-black border border-white p-1">
                        BILOW
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Off-screen high-resolution sheet export target */}
      <div 
        style={{ 
          position: 'fixed', 
          top: '-15000px', 
          left: '-15000px', 
          width: '720px', 
          backgroundColor: '#ffffff',
          padding: '30px',
          boxSizing: 'border-box',
          zIndex: -9999
        }}
      >
        <div id="printable-a4-sheet-capture" className="bg-white p-3 rounded-none flex items-center justify-center" style={{ width: '660px' }}>
          <div className="grid grid-cols-3 gap-x-2 gap-y-2 justify-center bg-white" style={{ width: '640px' }}>
            {gridSlots.map((card, index) => {
              if (!card) {
                return (
                  <div 
                    key={`capture-empty-${index}`} 
                    className="aspect-[63.5/88.9] border-2 border-dashed border-zinc-300 rounded-[12px] bg-[#fcfcfc] flex flex-col items-center justify-center text-zinc-400 font-bold gap-1"
                    style={{ width: '206px', height: '288px' }}
                  >
                    <Grid className="w-5 h-5 opacity-30 text-zinc-500" />
                    <span className="text-[8px] uppercase tracking-wider font-mono text-zinc-500">POSIÇÃO {index + 1}</span>
                  </div>
                );
              }

              const isPower = 'isPower' in card;

              return (
                <div key={`capture-card-${card.id}-${index}`} className="relative bg-white" style={{ width: '206px', height: '288px', overflow: 'hidden' }}>
                  {printMode === 'front' ? (
                    isPower ? (
                      <PowerCardView 
                        shape={(card as any).shape} 
                        color={(card as any).color} 
                        symbol={(card as any).symbol} 
                        showCutGuides={true}
                      />
                    ) : (
                      <BilowCardView 
                        card={card as BilowCard} 
                        scale={206 / 420} 
                        showCutGuides={true}
                      />
                    )
                  ) : (
                    <div 
                      className="aspect-[63.5/88.9] border-4 border-black bg-black rounded-[14px] flex flex-col justify-between p-3.5 text-center text-white"
                      style={{ width: '206px', height: '288px' }}
                    >
                      <div className="border border-zinc-700 py-1 flex items-center justify-center text-[10px] bg-zinc-900 font-bold tracking-widest text-white uppercase">
                        BILOWS
                      </div>
                      <div className="flex flex-col items-center justify-center flex-grow">
                        <span className="text-[8px] text-zinc-500 font-mono uppercase">
                          {isPower ? `RECURSO ${(card as any).shape}` : 'MÃO OFICIAL'}
                        </span>
                      </div>
                      <div className="text-[8.5px] font-black tracking-widest text-[#ffffff] bg-black border border-white p-1">
                        BILOW
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
