import React, { useState } from 'react';
import { BilowCard } from '../types';
import BilowCardView from './BilowCardView';
import { Printer, Check, Copy, Grid, FileText, Layout } from 'lucide-react';

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

  // Build the list of BilowCards to fill the 3x3 slot layout of A4
  const gridSlots = Array.from({ length: gridCount }).map((_, idx) => {
    const cardId = printQueue[idx];
    return cards.find(c => c.id === cardId);
  });

  return (
    <div className="flex flex-col gap-6 font-sans text-[9px] uppercase tracking-wider text-white bg-black p-4 border-2 border-zinc-800 rounded-3xl max-w-7xl mx-auto">
      
      {/* EXPLANATORY HEADER BANNER */}
      <div className="bg-black border-2 border-white p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <span className="text-[10px] uppercase font-mono font-bold text-white tracking-widest bg-zinc-900 border border-zinc-700 px-3 py-1 rounded-full mb-2 inline-block">
            GABINETE A4 - IMPRESSÃO FÍSICA E COMBATE ANALÓGICO
          </span>
          <h2 className="text-lg font-black font-display text-white tracking-wide">
            ESTAÇÃO DE CONFIGURAÇÃO DE IMPRESSÃO
          </h2>
          <p className="text-zinc-400 mt-1 text-[8.5px] tracking-widest">
            SELECIONE ATÉ 9 CARTAS DO SEU DECK PARA IMPRIMIR NO PADRÃO A4. EMBALE SUA CRIAÇÃO EM SLEEVES DE CARDS COLECIONÁVEIS COMPATÍVEIS!
          </p>
        </div>

        <button
          type="button"
          onClick={triggerNativePrint}
          className="flex items-center gap-2 px-6 py-3.5 bg-white text-black border-2 border-white font-black text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all text-center self-stretch md:self-auto justify-center cursor-pointer"
        >
          <Printer className="w-4 h-4 shrink-0" />
          IMPRIMIR ESTA FOLHA A4
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start no-print">
        
        {/* PANEL CONTROL & SELECTORS */}
        <div className="lg:col-span-4 flex flex-col gap-5 bg-zinc-950 p-4 border-2 border-zinc-800">
          
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
                    : 'text-zinc-400 hover:text-white'
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
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                COSTAS (CAPA LOGO BILOWS)
              </button>
            </div>
          </div>

          {/* 2. Grid Slots count per page */}
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
                      : 'text-zinc-400 hover:bg-zinc-900'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <p className="text-[8px] text-zinc-500 mt-1.5 leading-normal">
              A DISPOSIÇÃO 3X3 ABRIGA ATÉ 9 CARTAS COLETIVAS DE FORMA ORGANIZADA NUMA FOLHA A4 COM GUIAS DE CORTE PRECISAS.
            </p>
          </div>

          {/* 3. Choose which cards to put in grid queues */}
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
                        <p className="text-[8px] text-zinc-500 font-mono tracking-wider">{card.elemento} | PESO {card.peso} KG</p>
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
                        className="px-2 py-1 bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white disabled:opacity-30 cursor-pointer text-[8px] font-bold"
                      >
                        + ADD (+{instancesCount})
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3X3 GRID LIVE LAYOUT PREVIEW (Right 8 columns) */}
        <div className="lg:col-span-8 bg-zinc-950 p-6 border-2 border-zinc-800 flex flex-col items-center">
          <div className="mb-4 text-center">
            <span className="text-zinc-500 font-bold block">FILA DE DOCUMENTOS SELECIONADOS ({printQueue.length} / 9)</span>
            <span className="text-[8px] text-zinc-600">ARRASTE OU REORGANIZE SE COMPATÍVEL. CLIQUE PARA REMOVER.</span>
          </div>

          <div className="bg-white border-2 border-dashed border-zinc-500 p-8 shadow-inner overflow-x-auto max-w-full">
            <div className="grid grid-cols-3 gap-x-1.5 gap-y-1.5 justify-center" style={{ width: '640px' }}>
              {gridSlots.map((card, index) => {
                if (!card) {
                  return (
                    <div 
                      key={`empty-${index}`} 
                      className="aspect-[63.5/88.9] border-2 border-dashed border-zinc-300 rounded-[12px] bg-neutral-50/50 flex flex-col items-center justify-center text-zinc-400 font-bold gap-1 transition-colors"
                      style={{ width: '206px', height: '288px' }}
                    >
                      <Grid className="w-5 h-5 opacity-20" />
                      <span className="text-[8px] uppercase tracking-wider">POSIÇÃO {index + 1}</span>
                    </div>
                  );
                }

                return (
                  <div key={`${card.id}-${index}`} className="relative group cursor-pointer" onClick={() => removeQueueItemAtIndex(index)}>
                    {printMode === 'front' ? (
                      <BilowCardView 
                        card={card} 
                        scale={206 / 420} // scale to width 206px dynamically
                        showCutGuides={true}
                      />
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
                          <span className="text-[8px] text-zinc-500">MÃO OFICIAL</span>
                        </div>
                        <div className="text-[8.5px] font-black tracking-widest text-[#ffffff] bg-black border border-white p-1">
                          BILOWS CLUB
                        </div>
                      </div>
                    )}
                    {/* Hover remove layout trigger */}
                    <div className="absolute inset-x-0 -bottom-2 translate-y-full bg-red-950 text-red-200 border border-red-900 px-2 py-1 text-center text-[7.5px] font-black opacity-0 group-hover:opacity-100 transition-opacity uppercase">
                      CLIQUE PARA REMOVER
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* PRINT-ONLY AREA (ONLY visible inside raw window.print() output) */}
      <div className="print-only hidden">
        <div className="min-h-screen bg-white text-black p-0 m-0">
          <div className="grid grid-cols-3 gap-x-1.5 gap-y-1.5 justify-center mx-auto" style={{ width: '640px' }}>
            {gridSlots.map((card, index) => {
              if (!card) return null;
              return (
                <div key={`print-${card.id}-${index}`}>
                  {printMode === 'front' ? (
                    <BilowCardView 
                      card={card} 
                      scale={206 / 420} 
                      showCutGuides={true}
                    />
                  ) : (
                    <div 
                      className="aspect-[63.5/88.9] border-4 border-black bg-black rounded-[14px] flex flex-col justify-between p-3.5 text-center text-white"
                      style={{ width: '206px', height: '288px' }}
                    >
                      <div className="border border-zinc-700 py-1 flex items-center justify-center text-[10px] bg-zinc-900 font-bold tracking-widest text-white uppercase">
                        BILOWS
                      </div>
                      <div className="flex flex-col items-center justify-center flex-grow">
                        <span className="text-[8px] text-zinc-500">MÃO OFICIAL</span>
                      </div>
                      <div className="text-[8.5px] font-black tracking-widest text-[#ffffff] bg-black border border-white p-1">
                        BILOWS CLUB
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
