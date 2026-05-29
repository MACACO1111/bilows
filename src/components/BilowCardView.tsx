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
  innerStyle?: React.CSSProperties;
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
  let vidaVal = 6; // default/fallback, also ensures minimum of 6
  
  if (peso >= 0 && peso <= 10) vidaVal = 10;
  else if (peso > 10 && peso <= 50) vidaVal = 12;
  else if (peso > 50 && peso <= 100) vidaVal = 14;
  else if (peso > 100 && peso <= 150) vidaVal = 16;
  else if (peso > 150 && peso <= 200) vidaVal = 18;
  else if (peso > 200 && peso <= 250) vidaVal = 20;
  else if (peso > 250 && peso <= 300) vidaVal = 22;
  else if (peso > 300 && peso <= 350) vidaVal = 24;
  else if (peso > 350 && peso <= 400) vidaVal = 26;
  else if (peso > 400 && peso <= 450) vidaVal = 28;
  else if (peso > 450 && peso <= 500) vidaVal = 30;
  else if (peso > 500 && peso <= 550) vidaVal = 30;
  else if (peso > 550 && peso <= 600) vidaVal = 30;
  else if (peso > 600 && peso <= 650) vidaVal = 33;
  else if (peso > 650 && peso <= 700) vidaVal = 34;
  else if (peso > 700 && peso <= 750) vidaVal = 35;
  else if (peso > 750 && peso <= 800) vidaVal = 36;
  else if (peso > 800 && peso <= 850) vidaVal = 37;
  else if (peso > 850 && peso <= 900) vidaVal = 38;
  else if (peso > 900) vidaVal = 40; // up to 1000

  return Math.max(6, vidaVal);
}

export function calculatePowerAtakMod(pesoStr: string): string {
  const peso = parseFloat(pesoStr) || 0;
  if (peso >= 0 && peso <= 50) return '+1';
  if (peso > 50 && peso <= 100) return '+2';
  if (peso > 100 && peso <= 200) return '+3';
  if (peso > 200 && peso <= 400) return '+4';
  if (peso > 400 && peso <= 600) return '+5';
  if (peso > 600) return '+6';
  return '+1'; // fallback
}

export function calculateDefesa(pesoStr: string): number {
  const peso = parseFloat(pesoStr) || 0;
  if (peso >= 0 && peso <= 10) return 6;
  if (peso > 10 && peso <= 100) return 5;
  if (peso > 100 && peso <= 200) return 4;
  if (peso > 200 && peso <= 300) return 3;
  if (peso > 300 && peso <= 400) return 2;
  if (peso > 400 && peso <= 500) return 1;
  if (peso > 500) return 1;
  return 1; // fallback
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

// Automatically calculate state and raffle values for the warrior battle behaviors
export function generateAutomaticBehavior(pesoStr: string, currentAct?: string) {
  const peso = parseFloat(pesoStr) || 0;
  
  // 1. Roll NUMERO (random from 1 to 6)
  // If weight is less than 10 kilos, PAR or ÍMPAR
  let chosenDado = '';
  if (peso < 10) {
    const numberPool = ['PAR', 'ÍMPAR'];
    chosenDado = numberPool[Math.floor(Math.random() * numberPool.length)];
  } else {
    chosenDado = String(Math.floor(Math.random() * 6) + 1);
  }

  // 2. ACT choice
  const chosenAct = currentAct || (Math.random() < 0.5 ? 'EU' : 'O ADVERSÁRIO');

  // 3. Roll HIT depending on ACT
  let chosenHit = '';
  if (chosenAct === 'EU') {
    const euOptions = ['JOGO DE NOVO', 'IMUNIDADE ANTÍPODA', 'ATACO DOBRADO'];
    chosenHit = euOptions[Math.floor(Math.random() * euOptions.length)];
  } else {
    const oponenteOptions = peso < 10 
      ? ['MORRE', 'PERDE ANTÍPODA', 'PERDE DEFESA EXTRA'] 
      : ['PERDE ANTÍPODA', 'PERDE DEFESA EXTRA'];
    chosenHit = oponenteOptions[Math.floor(Math.random() * oponenteOptions.length)];
  }

  return {
    behaviorDado: chosenDado,
    behaviorAction: chosenAct,
    behaviorHit: chosenHit
  };
}

export default function BilowCardView({ 
  card, 
  scale = 1, 
  showCutGuides = false,
  isEditing = false,
  onCardChange,
  canvasElement,
  currentHp,
  innerStyle
}: BilowCardViewProps) {

  // Computed visual parameters
  const calculatedVid = calculateVida(card.peso);
  const powerAtakShape = getDeterministicValue(card.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 5);
  const calculatedAtkMod = calculatePowerAtakMod(card.peso);
  
  // Primary shapes (QUADRADO, TRIANGULO, CIRCULO) raffled deterministically per card
  const defesaShape = getDeterministicValue(card.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 3);
  const calculatedDef = `${defesaShape} ${calculateDefesa(card.peso)}`;
  
  const calculatedAntipoda = calculateAntipoda(card.elemento, card.peso);
  const calculatedFraco = calculatedAntipoda;
  
  // Stable random/drawn elements
  const powerAtakElement = powerAtakShape;
  const recuarElement = getDeterministicValue(card.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 2);

  const pesoVal = parseFloat(card.peso) || 0;
  const isLight = pesoVal < 10;

  // Sanitize values for rendering dropdowns reliably without empty states
  let sanitizedDado = card.behaviorDado || (isLight ? 'PAR' : '1');
  if (isLight) {
    if (sanitizedDado !== 'PAR' && sanitizedDado !== 'ÍMPAR') {
      sanitizedDado = 'PAR';
    }
  } else {
    if (!['1', '2', '3', '4', '5', '6'].includes(sanitizedDado)) {
      sanitizedDado = '1';
    }
  }

  const sanitizedAction = card.behaviorAction === 'EU' || card.behaviorAction === 'O ADVERSÁRIO' ? card.behaviorAction : 'EU';

  let sanitizedHit = card.behaviorHit || (sanitizedAction === 'EU' ? 'JOGO DE NOVO' : (isLight ? 'MORRE' : 'PERDE ANTÍPODA'));
  if (sanitizedAction === 'O ADVERSÁRIO') {
    if (sanitizedHit === 'MORRE' && !isLight) {
      sanitizedHit = 'PERDE ANTÍPODA';
    } else if (sanitizedHit !== 'MORRE' && sanitizedHit !== 'PERDE ANTÍPODA' && sanitizedHit !== 'PERDE DEFESA EXTRA') {
      sanitizedHit = isLight ? 'MORRE' : 'PERDE ANTÍPODA';
    }
  } else {
    if (sanitizedHit !== 'JOGO DE NOVO' && sanitizedHit !== 'IMUNIDADE ANTÍPODA' && sanitizedHit !== 'ATACO DOBRADO') {
      sanitizedHit = 'JOGO DE NOVO';
    }
  }

  const cardStyle: React.CSSProperties = {
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    width: '420px', // Robust width for perfect split layout
    background: '#ffffff',
    color: '#000000',
    fontFamily: 'Arial, sans-serif',
    ...innerStyle,
    height: '620px' // Lock strictly to 620px after any style extensions
  };

  const textClass = "font-sans-arial text-[9px] uppercase tracking-wider font-bold text-black";

  return (
    <div 
      className="relative shrink-0 select-none pb-0"
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
        className="card-print-render bg-white p-2.5 flex flex-col justify-between text-black border-[3.5px] border-black"
        style={cardStyle}
      >
        {/* Top Header Section (Grouped to avoid automatic spacer stretching) */}
        <div className="w-full flex flex-col gap-1 bg-white">
          {/* logo do jogo (letra branca sobre fundo preto) */}
          <div className="w-full flex flex-col items-center bg-white">
            <div className="bg-black text-white px-4 py-1 text-center font-bold tracking-widest text-[9.5px] w-full">
              BILOW
            </div>
            <div className="w-full border-t border-black/30 my-0.5" />
          </div>

          {/* Inputs row */}
          <div className="grid grid-cols-4 gap-1">
            <div className="flex flex-col">
              <span className="text-[7px] uppercase text-black font-extrabold mb-0.5">EVOC</span>
              {isEditing ? (
                <input
                  type="text"
                  maxLength={2}
                  value={card.evoc ?? ''}
                  placeholder="01"
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
              <span className="text-[7px] uppercase text-black font-extrabold mb-0.5">NOME</span>
              {isEditing ? (
                <input
                  type="text"
                  maxLength={12}
                  value={card.name ?? ''}
                  placeholder="SEM NOME"
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
              <span className="text-[7px] uppercase text-black font-extrabold mb-0.5">ELEMENTO</span>
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
          <div className="w-full flex items-center justify-between border-2 border-black px-2 py-0.5 bg-neutral-100">
            <span className="text-[12px] font-black text-black">VIDA</span>
            <span className="text-[10px] font-black text-black bg-white border border-black px-2 py-0.2 min-w-[22px] text-center">
              {calculatedVid}
            </span>
          </div>
        </div>

        {/* PAISAGEM Box (400x215px, white, outlined 2px) */}
        <div 
          className="relative overflow-hidden bg-white border-2 border-black mx-auto flex items-center justify-center shadow-inner my-0.5"
          style={{ width: '400px', height: '215px' }}
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
        <div className="grid grid-cols-2 gap-2 pt-1 border-t-2 border-black">
          
          {/* LEFT HALF (200x200px equivalent) */}
          <div className="flex flex-col justify-between h-[270px]" style={{ height: '270px' }}>
            <div className="space-y-1.5 pt-0.5">
              {/* Peso Row */}
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-black uppercase">PESO</span>
                {isEditing ? (
                  <input
                    type="text"
                    maxLength={4}
                    placeholder="KG"
                    value={card.peso}
                    onChange={(e) => {
                      let newPeso = e.target.value.replace(/[^0-9]/g, '');
                      if (newPeso && parseInt(newPeso) > 1000) {
                        newPeso = '1000';
                      }
                      const updates: Partial<BilowCard> = { peso: newPeso };
                      const pesoVal = parseFloat(newPeso) || 0;

                      if (pesoVal < 10) {
                        // Se inferior a 10 kilos, o usuario podera escolher PAR ou IMPAR.
                        if (card.behaviorDado !== 'PAR' && card.behaviorDado !== 'ÍMPAR') {
                          updates.behaviorDado = 'PAR';
                        }
                      } else {
                        // Se peso for de 10 a 1000, o usuario podera escolher um número de 1 a 6.
                        if (!card.behaviorDado || !['1','2','3','4','5','6'].includes(card.behaviorDado)) {
                          updates.behaviorDado = '1';
                        }
                      }

                      if (pesoVal >= 10 && card.behaviorHit === 'MORRE') {
                        updates.behaviorHit = 'PERDE ANTÍPODA';
                      }

                      onCardChange?.(updates);
                    }}
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
                <span className="text-[8.5px] font-normal text-black leading-tight max-w-[120px]">SOFRE DANO DOBRADO DO REINO:</span>
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
            <div className="mt-1 border-t-[1.5px] border-black/30 pt-1.5 pb-1">
              <span className="text-[8.5px] font-black tracking-tight text-black block mb-1">SE MEU DADO DER:</span>
              <div className="space-y-1">
                {/* Behavior Input 1 (Dado dropdown / CASA NUMERO) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9.5px] text-stone-500 font-bold">NÚMERO:</span>
                  {isEditing ? (
                    isLight ? (
                      <select
                        value={sanitizedDado}
                        onChange={(e) => onCardChange?.({ behaviorDado: e.target.value })}
                        className="border-[1.5px] border-black bg-white text-[11px] font-bold text-black px-1 py-0.5 rounded leading-none text-center h-[24px] min-w-[110px] focus:outline-none cursor-pointer"
                      >
                        <option value="PAR">PAR</option>
                        <option value="ÍMPAR">ÍMPAR</option>
                      </select>
                    ) : (
                      <div className="flex items-center gap-1">
                        <select
                          value={sanitizedDado}
                          onChange={(e) => onCardChange?.({ behaviorDado: e.target.value })}
                          className="border-[1.5px] border-black bg-white text-[11px] font-bold text-black px-1 py-0.5 rounded leading-none text-center h-[24px] min-w-[76px] focus:outline-none cursor-pointer"
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                          <option value="6">6</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const val = String(Math.floor(Math.random() * 6) + 1);
                            onCardChange?.({ behaviorDado: val });
                          }}
                          className="border-[1.5px] border-black bg-stone-100 hover:bg-stone-200 active:scale-95 text-[11px] font-bold text-black px-1.5 py-0.5 rounded leading-none text-center cursor-pointer"
                          title="Sorteia novo número entre 1 e 6"
                        >
                          🎲
                        </button>
                      </div>
                    )
                  ) : (
                    <span className="text-[11px] font-bold border-[1.5px] border-black bg-white px-1 py-0.5 min-w-[110px] block text-center uppercase text-black">
                      {sanitizedDado}
                    </span>
                  )}
                </div>

                {/* Behavior Input 2 (ACT / ATOR) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[9.5px] text-stone-500 font-bold">ACT:</span>
                  {isEditing ? (
                    <select
                      value={sanitizedAction}
                      onChange={(e) => {
                        const actVal = e.target.value;
                        let hitVal = '';
                        if (actVal === 'EU') {
                          hitVal = 'JOGO DE NOVO';
                        } else {
                          hitVal = isLight ? 'MORRE' : 'PERDE ANTÍPODA';
                        }
                        onCardChange?.({
                          behaviorAction: actVal,
                          behaviorHit: hitVal
                        });
                      }}
                      className="border-[1.5px] border-black bg-white text-[10.5px] font-black text-black px-1 py-0.5 rounded leading-none text-center h-[24px] min-w-[110px] focus:outline-none cursor-pointer"
                    >
                      <option value="EU">EU</option>
                      <option value="O ADVERSÁRIO">O ADVERSÁRIO</option>
                    </select>
                  ) : (
                    <span className="text-[10.5px] font-bold border-[1.5px] border-black bg-white px-1 py-0.5 min-w-[110px] block text-center uppercase text-black">
                      {sanitizedAction}
                    </span>
                  )}
                </div>

                {/* Behavior Input 3 (HIT) */}
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10.5px] text-stone-500 font-bold">HIT:</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <select
                        value={sanitizedHit}
                        onChange={(e) => onCardChange?.({ behaviorHit: e.target.value })}
                        className="border-[1.5px] border-black bg-white text-[9px] font-black text-black px-0.5 py-0.5 rounded leading-none h-[24px] min-w-[85px] max-w-[85px] focus:outline-none cursor-pointer"
                      >
                        {sanitizedAction === 'O ADVERSÁRIO' ? (
                          <>
                            {isLight && <option value="MORRE">MORRE</option>}
                            <option value="PERDE ANTÍPODA">PERDE ANTÍPODA</option>
                            <option value="PERDE DEFESA EXTRA">PERDE DEFESA EXTRA</option>
                          </>
                        ) : (
                          <>
                            <option value="JOGO DE NOVO">JOGO DE NOVO</option>
                            <option value="IMUNIDADE ANTÍPODA">IMUNIDADE ANTÍPODA</option>
                            <option value="ATACO DOBRADO">ATACO DOBRADO</option>
                          </>
                        )}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          const pool = sanitizedAction === 'O ADVERSÁRIO'
                            ? (isLight ? ['MORRE', 'PERDE ANTÍPODA', 'PERDE DEFESA EXTRA'] : ['PERDE ANTÍPODA', 'PERDE DEFESA EXTRA'])
                            : ['JOGO DE NOVO', 'IMUNIDADE ANTÍPODA', 'ATACO DOBRADO'];
                          const val = pool[Math.floor(Math.random() * pool.length)];
                          onCardChange?.({ behaviorHit: val });
                        }}
                        className="border-[1.5px] border-black bg-stone-100 hover:bg-stone-200 active:scale-95 text-[10px] font-bold text-black px-1.5 py-0.5 rounded leading-none text-center cursor-pointer"
                        title="Sorteia ação do HIT"
                      >
                        🎲
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black border-[1.5px] border-black bg-white px-1 py-0.5 min-w-[110px] max-w-[115px] block text-center leading-[1.1] truncate uppercase text-black" title={sanitizedHit}>
                      {sanitizedHit}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT HALF (200x200px equivalent containing Checkboard Paper Grid + skull) */}
          <div className="flex flex-col justify-between h-[270px]" style={{ height: '270px' }}>
            {/* Grid divided into 40 squares (5 columns x 8 lines to form exactly 40 slots) */}
            <div className="border-[2px] border-black grid grid-cols-5 bg-white flex-grow">
              {/* Casa 1 (primeira casa): Skull */}
              <div className="border border-black flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 transition-colors">
                <PixelSkull />
              </div>
              
              {/* Casa 2 to 40: numbered squares */}
              {Array.from({ length: 39 }).map((_, idx) => {
                const num = idx + 2; // starts from 2, goes up to 40
                const isLit = currentHp !== undefined && num === currentHp;
                return (
                  <div 
                    key={num} 
                    className={`border border-black/30 flex items-center justify-center text-[8.5px] font-black transition-all duration-300 ${
                      isLit 
                        ? 'bg-red-600 text-white animate-pulse shadow-[inset_0_0_8px_rgba(0,0,0,0.6)] font-extrabold scale-105 border-red-700 z-10' 
                        : 'text-black bg-white hover:bg-neutral-50'
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>

            {/* Footer with twitter-handle / creator ID input, max 20 characters */}
            <div className="mt-2">
              {isEditing ? (
                <div className="flex items-center border-[1.5px] border-black bg-white px-1 py-0.5">
                  <input
                    type="text"
                    maxLength={30}
                    value={card.twitterHandle || ''}
                    placeholder="NOME DO DESIGNER"
                    onFocus={(e) => {
                      if (card.twitterHandle === 'NOME DO DESIGNER' || card.twitterHandle === 'NOME DO USUARIO') {
                        onCardChange?.({ twitterHandle: '' });
                      }
                    }}
                    onChange={(e) => {
                      onCardChange?.({ twitterHandle: e.target.value });
                    }}
                    className="w-full bg-white text-[9px] font-bold text-black focus:outline-none"
                  />
                </div>
              ) : (
                <div className="border-[1.5px] border-black bg-white text-center py-0.5 text-[9.5px] font-black tracking-wide text-black truncate px-1">
                  {card.twitterHandle || 'NOME DO DESIGNER'}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
