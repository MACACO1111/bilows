import React from 'react';
import { BilowCard } from '../types';

interface BilowCardViewProps {
  card: BilowCard;
  scale?: number;
  showCutGuides?: boolean;
  isEditing?: boolean;
  onCardChange?: (updatedCard: Partial<BilowCard>) => void;
  onSaveDrawing?: (dataUrl: string) => void;
  canvasElement?: React.ReactNode;
  currentHp?: number;
}

// Pixel art retro skull SVG
export const PixelSkull = () => (
  <svg viewBox="0 0 12 12" className="w-5 h-5 fill-black shrink-0" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="1" width="6" height="1" />
    <rect x="2" y="2" width="8" height="1" />
    <rect x="1" y="3" width="10" height="1" />
    <rect x="1" y="4" width="10" height="1" />
    <rect x="1" y="5" width="10" height="1" />
    <rect x="2" y="6" width="8" height="1" />
    <rect x="3" y="7" width="6" height="2" />
    <rect x="4" y="9" width="4" height="1" />
    {/* Eyes */}
    <rect x="3" y="4" width="2" height="2" fill="white" />
    <rect x="7" y="4" width="2" height="2" fill="white" />
    {/* Nose and Mouth cuts */}
    <rect x="5" y="6" width="2" height="1" fill="white" />
    <rect x="4" y="8" width="1" height="1" fill="white" />
    <rect x="7" y="8" width="1" height="1" fill="white" />
  </svg>
);

// Dynamic calculator functions based on user guidelines
export function calculateVida(pesoStr: string): number {
  const peso = parseFloat(pesoStr) || 0;
  if (peso < 0) return 1;
  if (peso <= 10) return 1;
  if (peso <= 50) return 2;
  if (peso <= 100) return 3;
  if (peso <= 150) return 4;
  if (peso <= 200) return 5;
  if (peso <= 250) return 6;
  if (peso <= 300) return 7;
  if (peso <= 350) return 8;
  if (peso <= 400) return 9;
  if (peso <= 450) return 10;
  if (peso <= 500) return 11;
  if (peso <= 550) return 12;
  if (peso <= 600) return 13;
  if (peso <= 650) return 14;
  if (peso <= 700) return 15;
  if (peso <= 750) return 16;
  if (peso <= 800) return 17;
  if (peso <= 850) return 18;
  if (peso <= 900) return 19;
  return 20; // 900 to 999 is 20
}

export function calculatePowerAtakMod(pesoStr: string): string {
  const peso = parseFloat(pesoStr) || 0;
  if (peso <= 50) return '+1';
  if (peso <= 100) return '+2';
  if (peso <= 200) return '+3';
  if (peso <= 400) return '+4';
  if (peso <= 600) return '+5';
  return '+6'; // 600 to 999
}

export function calculateDefesa(pesoStr: string): number {
  const peso = parseFloat(pesoStr) || 0;
  if (peso <= 10) return 0;
  if (peso <= 100) return 1;
  if (peso <= 200) return 2;
  if (peso <= 300) return 3;
  if (peso <= 400) return 4;
  if (peso <= 500) return 5;
  return 6; // 500 to 999
}

export function calculateAntipoda(elemento: string, pesoStr: string): string {
  const peso = parseFloat(pesoStr) || 0;
  // Dynamic weight-dependent elements
  if (peso < 150) {
    if (elemento === 'AG') return 'FO';
    if (elemento === 'FO') return 'AG';
    if (elemento === 'AR') return 'TE';
    return 'AR';
  } else if (peso < 500) {
    if (elemento === 'AG') return 'TE';
    if (elemento === 'TE') return 'AG';
    if (elemento === 'AR') return 'FO';
    return 'AR';
  } else {
    if (elemento === 'AG') return 'AR';
    if (elemento === 'AR') return 'AG';
    if (elemento === 'TE') return 'FO';
    return 'TE';
  }
}

export function calculateFraco(elemento: string): string {
  if (elemento === 'AG') return 'FO';
  if (elemento === 'FO') return 'AG';
  if (elemento === 'AR') return 'TE';
  return 'AR'; // if TE, return AR
}

// Generate state-random items but hash them based on card details to prevent re-render flickering
export function getDeterministicValue(cardId: string, options: string[], seed: number = 0): string {
  if (!cardId) return options[seed % options.length];
  let sum = seed;
  for (let i = 0; i < cardId.length; i++) {
    sum += cardId.charCodeAt(i);
  }
  return options[sum % options.length];
}

export default function BilowCardView({ 
  card, 
  scale = 1, 
  showCutGuides = false,
  isEditing = false,
  onCardChange,
  canvasElement,
  currentHp
}: BilowCardViewProps) {

  // Computed visual parameters
  const calculatedVid = calculateVida(card.peso);
  const powerAtakShape = getDeterministicValue(card.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 5);
  const calculatedAtkMod = "+ 2";
  
  // Primary shapes (QUADRADO, TRIANGULO, CIRCULO) raffled deterministically per card
  const defesaShape = getDeterministicValue(card.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 3);
  const calculatedDef = `${defesaShape} + 2`;
  
  const calculatedAntipoda = calculateAntipoda(card.elemento, card.peso);
  const calculatedFraco = calculatedAntipoda;
  
  // Stable random/drawn elements
  const powerAtakElement = powerAtakShape;
  const recuarElement = getDeterministicValue(card.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 2);

  const cardStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: '420px', // Robust width for perfect split layout
    background: '#ffffff',
    color: '#000000',
    fontFamily: 'Arial, sans-serif'
  };

  const textClass = "font-sans-arial text-[9px] uppercase tracking-wider font-bold text-black";

  return (
    <div 
      className="relative shrink-0 select-none bg-white border-2 border-black"
      style={{ 
        width: `${420 * scale}px`, 
        height: `${620 * scale}px` 
      }}
    >
      {/* Cut Guides */}
      {showCutGuides && (
        <>
          <div className="absolute -top-3 -left-3 w-5 h-[1px] bg-slate-400" />
          <div className="absolute -top-3 -left-3 w-[1px] h-5 bg-slate-400" />
          <div className="absolute -top-3 -right-3 w-5 h-[1px] bg-slate-400" />
          <div className="absolute -top-3 -right-3 w-[1px] h-5 bg-slate-400" />
          <div className="absolute -bottom-3 -left-3 w-5 h-[1px] bg-slate-400" />
          <div className="absolute -bottom-3 -left-3 w-[1px] h-5 bg-slate-400" />
          <div className="absolute -bottom-3 -right-3 w-5 h-[1px] bg-slate-400" />
          <div className="absolute -bottom-3 -right-3 w-[1px] h-5 bg-slate-400" />
        </>
      )}

      {/* Actual Trading Card body */}
      <div 
        id={`card-${card.id}`}
        className="card-print-render bg-white p-2.5 flex flex-col justify-between text-black border-[3px] border-black"
        style={cardStyle}
      >
        {/* logo do jogo (letra branca sobre fundo preto) */}
        <div className="w-full flex flex-col items-center mb-1">
          <div className="bg-black text-white px-4 py-1 text-center font-bold tracking-widest text-[9.5px]">
            BILOWS CLUB
          </div>
          <div className="w-full border-t border-black/30 my-1" />
        </div>

        {/* Inputs row */}
        <div className="grid grid-cols-4 gap-1 mb-1.5">
          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase text-black font-extrabold mb-0.5">EVOC</span>
            {isEditing ? (
              <input
                type="text"
                maxLength={2}
                value={card.evoc || '01'}
                onChange={(e) => onCardChange?.({ evoc: e.target.value.replace(/[^0-9]/g, '') })}
                className="w-full border-2 border-black px-1 py-0.5 text-[9px] font-bold text-black uppercase bg-white focus:outline-none focus:bg-stone-100"
              />
            ) : (
              <div className="w-full border-2 border-black px-1 py-0.5 text-[9px] font-bold text-black min-h-[22px] bg-white flex items-center">
                {card.evoc || '01'}
              </div>
            )}
          </div>

          <div className="flex flex-col col-span-2">
            <span className="text-[7.5px] uppercase text-black font-extrabold mb-0.5">NOME</span>
            {isEditing ? (
              <input
                type="text"
                maxLength={12}
                value={card.name || 'SEM NOME'}
                onChange={(e) => onCardChange?.({ name: e.target.value.substring(0, 12).toUpperCase() })}
                className="w-full border-2 border-black px-1 py-0.5 text-[9px] font-bold text-black uppercase bg-white focus:outline-none focus:bg-stone-100"
              />
            ) : (
              <div className="w-full border-2 border-black px-1 py-0.5 text-[9px] font-bold text-black min-h-[22px] bg-white flex items-center truncate">
                {card.name || 'SEM NOME'}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[7.5px] uppercase text-black font-extrabold mb-0.5">ELEMENTO</span>
            {isEditing ? (
              <select
                value={card.elemento || 'AG'}
                onChange={(e) => onCardChange?.({ elemento: e.target.value as any })}
                className="w-full border-2 border-black px-0.5 py-0.5 text-[9px] font-bold text-black bg-white focus:outline-none"
              >
                <option value="AG">AG (ÁGUA)</option>
                <option value="TE">TE (TERRA)</option>
                <option value="AR">AR (AR)</option>
                <option value="FO">FO (FOGO)</option>
              </select>
            ) : (
              <div className="w-full border-2 border-black px-1 py-0.5 text-[9px] font-bold text-black min-h-[22px] bg-white flex items-center">
                {card.elemento || 'AG'}
              </div>
            )}
          </div>
        </div>

        {/* VIDA bar display */}
        <div className="w-full mb-2 flex items-center justify-between border-2 border-black p-1 bg-neutral-100">
          <span className="text-[8px] font-black text-black">VIDA</span>
          <span className="text-[10px] font-black text-black bg-white border border-black px-1.5 py-0.2 min-w-[20px] text-center">
            {calculatedVid}
          </span>
        </div>

        {/* PAISAGEM Box (400x245px, white, outlined 2px) */}
        <div 
          className="relative overflow-hidden bg-white border-2 border-black mx-auto flex items-center justify-center shadow-inner"
          style={{ width: '400px', height: '245px' }}
        >
          {canvasElement ? (
            canvasElement
          ) : card.drawingDataUrl ? (
            <img 
               src={card.drawingDataUrl} 
               alt={card.name} 
               referrerPolicy="no-referrer"
               className="w-full h-full object-contain pointer-events-none"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400">
              <span className="text-[9px] font-bold tracking-widest text-[#000000]">PAISAGEM EM BRANCO</span>
              <span className="text-[7px] text-center text-slate-400 mt-1">DESENHE O SEU PERSONAGEM</span>
            </div>
          )}

          {/* Background element watermark */}
          <div className="absolute bottom-1 right-2 opacity-5 font-black text-[28px] tracking-widest pointer-events-none text-black z-0">
            {canvasElement ? '' : (card.elemento || 'AG')}
          </div>
        </div>

        {/* Divided section: Left Half vs Right Half (each sized to fit beautifully side-by-side) */}
        <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t-2 border-black">
          
          {/* LEFT HALF (200x200px equivalent) */}
          <div className="flex flex-col justify-between" style={{ height: '210px' }}>
            <div className="space-y-1">
              {/* Peso Row */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black uppercase">PESO</span>
                {isEditing ? (
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="KG"
                    value={card.peso}
                    onChange={(e) => onCardChange?.({ peso: e.target.value.replace(/[^0-9]/g, '') })}
                    className="w-16 border-[1.5px] border-black px-1 py-0.1 text-[10.5px] font-bold text-black text-right bg-white focus:outline-none"
                  />
                ) : (
                  <span className="font-bold text-[10.5px] border-[1.5px] border-black px-1.5 py-0.1 bg-white">
                    {card.peso || '0'} KG
                  </span>
                )}
              </div>

              {/* Power Atak Row */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black uppercase">POWER ATAK</span>
                <span className="font-bold text-[10.5px] border-[1.5px] border-black px-1.5 py-0.1 bg-white">
                  {powerAtakElement} {calculatedAtkMod}
                </span>
              </div>

              {/* Defesa Row */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black uppercase">DEFESA</span>
                <span className="font-bold text-[10.5px] border-[1.5px] border-black px-1.5 py-0.1 bg-white">
                  {calculatedDef}
                </span>
              </div>

              {/* Antipoda Row */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black uppercase">ANTÍPODA</span>
                <span className="font-bold text-[10.5px] border-[1.5px] border-black px-1.5 py-0.1 bg-white">
                  {calculatedAntipoda}
                </span>
              </div>

              {/* Fraco - 2X Row */}
              <div className="flex items-center justify-between">
                <span className="text-[8.5px] font-black text-black leading-tight max-w-[120px]">SOFRE DANO DOBRADO DO REINO:</span>
                <span className="font-bold text-[10.5px] border-[1.5px] border-black px-1.5 py-0.1 bg-white">
                  {calculatedFraco}
                </span>
              </div>

              {/* Recuar Row */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black uppercase">RECUAR</span>
                <span className="font-bold text-[10.5px] border-[1.5px] border-black px-1.5 py-0.1 bg-white">
                  {recuarElement}
                </span>
              </div>
            </div>

            {/* Behavior Section */}
            <div className="mt-2 border-t-[1.5px] border-black/30 pt-1">
              <span className="text-[8.5px] font-black tracking-tight text-black block mb-1">SE MEU DADO DER:</span>
              <div className="space-y-1">
                {/* Behavior Input 1 (Dado dropdown) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9.5px] text-stone-500 font-bold">NÚMERO:</span>
                  {isEditing ? (
                    <select
                      value={card.behaviorDado || 'DADO'}
                      onChange={(e) => onCardChange?.({ behaviorDado: e.target.value })}
                      className="border-[1.5px] border-black bg-white text-[11.5px] font-bold text-black px-1 py-0.1 w-24 focus:outline-none"
                    >
                      <option value="DADO">NÚMERO</option>
                      <option value="PAR">PAR</option>
                      <option value="ÍMPAR">ÍMPAR</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="5">5</option>
                      <option value="6">6</option>
                    </select>
                  ) : (
                    <span className="text-[11.5px] font-bold border-[1.5px] border-black bg-white px-1 py-0.1 truncate w-24 block text-center">
                      {card.behaviorDado === 'DADO' ? 'NÚMERO' : (card.behaviorDado || 'NÚMERO')}
                    </span>
                  )}
                </div>

                {/* Behavior Input 2 (Action text, max 20) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9.5px] text-stone-500 font-bold">ACT:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={20}
                      value={card.behaviorAction || 'ACTION'}
                      onChange={(e) => onCardChange?.({ behaviorAction: e.target.value })}
                      className="border-[1.5px] border-black bg-white text-[10.5px] font-bold text-black px-1 py-0.1 w-28 focus:outline-none"
                    />
                  ) : (
                    <span className="text-[10.5px] font-bold border-[1.5px] border-black bg-white px-1 py-0.1 truncate w-28 block text-center">
                      {card.behaviorAction || 'ACTION'}
                    </span>
                  )}
                </div>

                {/* Behavior Input 3 (Hit text, max 20) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10.5px] text-stone-500 font-bold">HIT:</span>
                  {isEditing ? (
                    <input
                      type="text"
                      maxLength={20}
                      value={card.behaviorHit || 'HIT'}
                      onChange={(e) => onCardChange?.({ behaviorHit: e.target.value })}
                      className="border-[1.5px] border-black bg-white text-[10.5px] font-bold text-black px-1 py-0.1 w-28 focus:outline-none"
                    />
                  ) : (
                    <span className="text-[10.5px] font-bold border-[1.5px] border-black bg-white px-1 py-0.1 truncate w-28 block text-center">
                      {card.behaviorHit || 'HIT'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT HALF (200x200px equivalent containing Checkboard Paper Grid + skull) */}
          <div className="flex flex-col justify-between" style={{ height: '210px' }}>
            {/* Grid 5 columns x 4 lines */}
            <div className="border-[2px] border-black grid grid-cols-5 bg-white flex-grow">
              {Array.from({ length: 19 }).map((_, index) => {
                const isLit = currentHp !== undefined && (index + 1) === currentHp;
                return (
                  <div 
                    key={index} 
                    className={`border border-black/30 flex items-center justify-center text-[9px] font-black transition-all duration-300 ${
                      isLit 
                        ? 'bg-red-600 text-white animate-pulse shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] font-extrabold scale-105 border-red-700 z-10' 
                        : 'text-black bg-white hover:bg-neutral-55'
                    }`}
                  >
                    {index + 1}
                  </div>
                );
              })}
              
              {/* 20th square has custom pixel art skull */}
              <div className="border border-black flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors">
                <PixelSkull />
              </div>
            </div>

            {/* Footer with twitter-handle / creator ID input, max 20 characters pre-printed with @ */}
            <div className="mt-2.5">
              {isEditing ? (
                <div className="flex items-center border-2 border-black bg-white px-1 py-0.5">
                  <span className="text-[9px] font-black text-black select-none">@</span>
                  <input
                    type="text"
                    maxLength={20}
                    value={card.twitterHandle ? card.twitterHandle.replace(/^@/, '') : ''}
                    placeholder="NOME DO DESIGNER"
                    onChange={(e) => {
                      const cleanInput = e.target.value.replace(/[^A-Za-z0-9_ -]/g, '');
                      onCardChange?.({ twitterHandle: `@${cleanInput}` });
                    }}
                    className="w-full bg-white text-[9px] font-bold text-black focus:outline-none uppercase"
                  />
                </div>
              ) : (
                <div className="border-2 border-black bg-white text-center py-0.5 text-[9.5px] font-black tracking-wide text-black truncate px-1">
                  {card.twitterHandle || '@NOME DO DESIGNER'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
