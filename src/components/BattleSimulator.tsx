import React, { useState, useEffect } from 'react';
import { BilowCard } from '../types';
import BilowCardView, { getDeterministicValue } from './BilowCardView';
import { Swords, RotateCcw, Play, Dice5, HelpCircle, ArrowRight, Skull, Layers } from 'lucide-react';

interface BattleSimulatorProps {
  cards: BilowCard[];
}

export default function BattleSimulator({ cards }: BattleSimulatorProps) {
  const [playerCard, setPlayerCard] = useState<BilowCard | null>(null);
  const [cpuCard, setCpuCard] = useState<BilowCard | null>(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [winner, setWinner] = useState<'PLAYER' | 'CPU' | null>(null);

  // Match live states
  const [playerHp, setPlayerHp] = useState(0);
  const [cpuHp, setCpuHp] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [turnOwner, setTurnOwner] = useState<'PLAYER' | 'CPU'>('PLAYER');
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  
  // Game drawn card shape state
  const [drawnShape, setDrawnShape] = useState<string | null>(null);

  // Set default computer card when player changes their card
  useEffect(() => {
    if (playerCard && !cpuCard && cards.length > 0) {
      const candidates = cards.filter(c => c.id !== playerCard.id);
      const enemy = candidates[Math.floor(Math.random() * candidates.length)] || cards[0];
      setCpuCard(enemy);
    }
  }, [playerCard, cards]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg.toUpperCase(), ...prev]);
  };

  const startMatch = () => {
    if (!playerCard || !cpuCard) return;

    // Use calculated VIDA stats
    const pVida = playerCard.vida || 5;
    const cVida = cpuCard.vida || 5;

    setPlayerHp(pVida);
    setCpuHp(cVida);
    setBattleStarted(true);
    setBattleEnded(false);
    setWinner(null);
    setLastDiceRoll(null);
    setDrawnShape(null);
    setLogs([]);

    // 1. Initiative Dice Roll: "PARA VER QUEM COMEÇA O ATAQUE (NÚMERO MAIOR GANHA)"
    let playerInit = Math.floor(Math.random() * 6) + 1;
    let cpuInit = Math.floor(Math.random() * 6) + 1;
    while (playerInit === cpuInit) {
      playerInit = Math.floor(Math.random() * 6) + 1;
      cpuInit = Math.floor(Math.random() * 6) + 1;
    }

    const firstPlay = playerInit > cpuInit ? 'PLAYER' : 'CPU';
    setTurnOwner(firstPlay);

    addLog(`⚔️ DISPUTA DE INICIATIVA COMEÇOU!`);
    addLog(`🎲 ${playerCard.name} ROLOU: ${playerInit}`);
    addLog(`🎲 ${cpuCard.name} ROLOU: ${cpuInit}`);
    if (firstPlay === 'PLAYER') {
      addLog(`👉 VOCÊ GANHOU A INICIATIVA E COMEÇA O COMBATE!`);
    } else {
      addLog(`👉 O ADVERSÁRIO GANHOU A INICIATIVA E JOGA PRIMEIRO!`);
    }
    addLog(`❤️ VIDA INICIAL DO ROUND: VOCÊ ${pVida} HP | ADVERSÁRIO ${cVida} HP`);
  };

  // Helper to resolve damage or defense with respect to parameters
  const getPowerAtakValue = (card: BilowCard): number => {
    const modStr = card.powerAtakMod || '+1';
    const parsed = parseInt(modStr.replace('+', '')) || 1;
    return parsed;
  };

  const rollDiceAndTurn = () => {
    if (isRolling || battleEnded) return;
    setIsRolling(true);
    setLastDiceRoll(null);

    const active = turnOwner === 'PLAYER' ? playerCard! : cpuCard!;
    const target = turnOwner === 'PLAYER' ? cpuCard! : playerCard!;
    const targetHp = turnOwner === 'PLAYER' ? cpuHp : playerHp;

    // 2. Buy a card: "ANTES DE JOGAR O JOGADOR QUE INICIA O TURNO, COMPRA UMA CARTA (QUADRADO, CIRCULO OU TRIANGULO)"
    const shapes = ['QUADRADO', 'TRIANGULO', 'CIRCULO'];
    const rolledShape = shapes[Math.floor(Math.random() * 3)];
    setDrawnShape(rolledShape);

    addLog(`------------------------------`);
    addLog(`🃏 TURNO DE ${active.name}: COMPRANDO CARTA DE COMPORTAMENTO...`);
    addLog(`📦 CARTA RETIRADA DO DECK: [${rolledShape}]`);

    // Simulated dice roll delay (1 second)
    setTimeout(() => {
      // 3. Roll attack dice
      const rolled = Math.floor(Math.random() * 6) + 1;
      setLastDiceRoll(rolled);
      setIsRolling(false);

      addLog(`🎲 ${active.name} RETORNO DO DADO DA DISPUTA: ${rolled}!`);

      // 4. Evaluate BEHAVIOR criteria (SE MEU DADO DER:)
      const dadoCond = (active.behaviorDado || 'DADO').toUpperCase();
      let behaviorMatch = false;
      if (dadoCond === 'PAR' && rolled % 2 === 0) behaviorMatch = true;
      else if (dadoCond === 'ÍMPAR' && rolled % 2 !== 0) behaviorMatch = true;
      else if (dadoCond === String(rolled)) behaviorMatch = true;
      else if (dadoCond === 'DADO') behaviorMatch = true; // matches any roll

      const actionName = active.behaviorAction || 'ACTION';
      const hitName = active.behaviorHit || 'HIT';

      if (behaviorMatch) {
        addLog(`⚡ COMPORTAMENTO DE ARENA ATIVADO!`);
        addLog(`⚡ [${actionName}] -> ESTADO DE [${hitName}] ATIVADO COM SUCESSO!`);
      }

      // 5. Check if the drawn card shape matches the card's required powerAtakShape from setup (calculated deterministically with seed 5)
      const requiredShape = getDeterministicValue(active.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 5);
      const isPowerAtakActive = (rolledShape === requiredShape);

      // Damage formula from user guidelines:
      // Base damage is the dice roll ("ELE LANÇA O DADO E SE TIRAR 2...")
      // If Power Attack is active (Shape matches required shape): they suffer POWER ATTACK (rolled + 2)
      // If Target is ANTIPODE: then they suffer double damage!
      const dmgOfDice = rolled;
      const powerAtakMod = 2; // "+2"
      let intermediateDmg = dmgOfDice;

      if (isPowerAtakActive) {
        intermediateDmg = dmgOfDice + powerAtakMod;
        addLog(`🔥 POWER ATAQUE ATIVADO! FORMA COMPRADA [${rolledShape}] EQUIVALE AO SEU REQUISITO [${requiredShape}]`);
        addLog(`🔥 DANO INTERMEDÁRIO DE SOMA: ${dmgOfDice} (DADO) + 2 (POWER ATAQUE) = ${intermediateDmg}`);
      } else {
        addLog(`🗡️ ATAQUE COMUM: A FORMA COMPRADA [${rolledShape}] NÃO BATE COM O REQUISITO [${requiredShape}]`);
        addLog(`🗡️ DANO INTERMEDÁRIO DE SOMA: ${dmgOfDice}`);
      }

      // Check element antipode!
      const activeAntipoda = active.antipoda || '';
      const targetElement = target.elemento || '';
      const isAntipoda = targetElement.toUpperCase() === activeAntipoda.toUpperCase();

      let finalDmg = intermediateDmg;

      if (isAntipoda) {
        finalDmg = intermediateDmg * 2;
        const extraDouble = finalDmg - intermediateDmg;
        addLog(`💥 CRÍTICO ANTÍPODA! ${target.name} ESTREITA O MODO ANTÍPODA (${activeAntipoda}) DE ${active.name}!`);
        addLog(`💥 DANO DUPLICADO: ${intermediateDmg} X 2 = ${finalDmg}! (PERDEU: ${dmgOfDice} DADO + ${isPowerAtakActive ? '2 POWER ATAQUE' : '0'} + ${extraDouble} DO DOBRO)`);
      } else {
        addLog(`🛡️ ELEMENTOS EM EQUILÍBRIO (${targetElement} VS ANTÍPODA: ${activeAntipoda}). MULTIPLICADOR DE ANTÍPODA INATIVO.`);
        addLog(`👉 DANO FINAL DO TURNO: ${finalDmg}`);
      }

      // Behavior trigger minor advantage
      if (behaviorMatch) {
         finalDmg += 1;
         addLog(`⚡ BEHAVIOR ACESO! +1 DE RESPAWN EXTRA.`);
      }

      // Check defense modifier
      const defValue = target.defesa || 0;
      if (defValue > 2 && Math.random() > 0.8) {
        finalDmg = Math.max(1, finalDmg - 1);
        addLog(`🛡️ DEFESA EXTRA DE ${target.name} ANULOU 1 DE HP PERDIDO!`);
      }

      const nextTargetHp = Math.max(0, targetHp - finalDmg);

      if (turnOwner === 'PLAYER') {
        setCpuHp(nextTargetHp);
        addLog(`💥 ADVERSÁRIO SOFREU ${finalDmg} DE DANO. HP NOVO: ${nextTargetHp}`);
        if (nextTargetHp <= 0) {
          setBattleEnded(true);
          setWinner('PLAYER');
          addLog(`🏆 PARABÉNS! ${active.name} COMPLETOU A DISPUTA COMO VENCEDOR!`);
        } else {
          setTurnOwner('CPU');
        }
      } else {
        setPlayerHp(nextTargetHp);
        addLog(`💥 VOCÊ SOFREU ${finalDmg} DE DANO. HP NOVO: ${nextTargetHp}`);
        if (nextTargetHp <= 0) {
          setBattleEnded(true);
          setWinner('CPU');
          addLog(`💀 DERROTA! O ADVERSÁRIO VENCEU A DISPUTA DA ARENA.`);
        } else {
          setTurnOwner('PLAYER');
        }
      }

    }, 1000);
  };

  const handleTriggerCpuTurn = () => {
    if (turnOwner === 'CPU' && !battleEnded && !isRolling) {
      setTimeout(() => {
        rollDiceAndTurn();
      }, 1500);
    }
  };

  useEffect(() => {
    handleTriggerCpuTurn();
  }, [turnOwner, battleStarted, battleEnded]);

  const isPlayerEvoc1Eligible = playerCard ? (playerCard.evoc === '01' || playerCard.evoc === '1') : true;
  const isCpuEvoc1Eligible = cpuCard ? (cpuCard.evoc === '01' || cpuCard.evoc === '1') : true;
  const canStartBattle = playerCard && cpuCard && isPlayerEvoc1Eligible && isCpuEvoc1Eligible;

  const currentActiveCard = turnOwner === 'PLAYER' ? playerCard : cpuCard;

  return (
    <div className="bg-black text-white p-6 border-2 border-zinc-800 rounded-3xl font-sans text-[9px] uppercase tracking-wider max-w-7xl mx-auto flex flex-col gap-6">
      
      {/* Title block */}
      <div className="border-2 border-white p-3.5 bg-zinc-950 flex flex-col gap-2">
        <h2 className="text-xl font-black tracking-widest text-[#ffffff] font-display">ARENA DE DISPUTA REAL-TIME</h2>
        <p className="text-zinc-400 text-[8.5px] tracking-widest">
          SIMULADOR REGULAR DOS PARÂMETROS DA SUA CRIAÇÃO EM PAPEL. A DISPUTA UTILIZA O PESO, ESTADOS DE VIDA, DEFESAS ATIVAS E OS COMPORTAMENTOS (SE MEU DADO DER:) DEFINIDOS NO SEU DECK!
        </p>
      </div>

      {!battleStarted ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Card Selections */}
          <div className="border-4 border-zinc-900 bg-black p-4 flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-1 mb-2">
                <span className="font-extrabold text-zinc-400">PASSO 1: CARREGAR A SUA CRIAÇÃO</span>
                <span className="text-[7.5px] text-amber-500 font-extrabold">DEVE SER EVOC 1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {cards.map(c => {
                  const isEvoc1 = c.evoc === '01' || c.evoc === '1';
                  return (
                    <button
                      key={c.id}
                      onClick={() => setPlayerCard(c)}
                      className={`p-2 border-2 text-left truncate cursor-pointer flex flex-col justify-between h-14 ${
                        playerCard?.id === c.id 
                          ? 'border-white bg-white text-black' 
                          : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-black text-[9.5px] truncate">{c.name || 'SEM NOME'}</span>
                      <div className="flex justify-between items-center w-full text-[7.5px] font-bold mt-1">
                        <span>VIDA: {c.vida} | {c.elemento}</span>
                        {isEvoc1 ? (
                          <span className="bg-emerald-800 text-white px-1 rounded-[2px] font-extrabold">EVOC 1</span>
                        ) : (
                          <span className="bg-amber-600 text-white px-1 rounded-[2px] font-extrabold">EVOC {c.evoc}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {playerCard && (
              <div className="flex flex-col items-center gap-2 mt-3">
                {!isPlayerEvoc1Eligible && (
                  <span className="text-[8px] bg-red-950 border border-red-600 text-red-400 px-2 py-1 font-bold rounded text-center w-full">
                    ⚠️ ESTA CARTA É EVOLUÇÃO {playerCard.evoc}. APENAS CARTAS DE EVOLUÇÃO 01 PODEM INICIAR NO RING!
                  </span>
                )}
                <div className="flex justify-center p-2 bg-zinc-950 border border-zinc-900">
                  <BilowCardView card={playerCard} scale={0.7} />
                </div>
              </div>
            )}
          </div>

          {/* Opponent Selection */}
          <div className="border-4 border-zinc-900 bg-black p-4 flex flex-col justify-between gap-4">
            <div>
              <div className="flex justify-between items-center border-b border-zinc-800 pb-1 mb-2">
                <span className="font-extrabold text-zinc-400">PASSO 2: MONSTRO DESAFIANTE DO OPONENTE</span>
                <span className="text-[7.5px] text-amber-500 font-extrabold">DEVE SER EVOC 1</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {cards.map(c => {
                  const isEvoc1 = c.evoc === '01' || c.evoc === '1';
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCpuCard(c)}
                      className={`p-2 border-2 text-left truncate cursor-pointer flex flex-col justify-between h-14 ${
                        cpuCard?.id === c.id 
                          ? 'border-white bg-white text-black' 
                          : 'border-zinc-800 bg-zinc-950 text-white hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-black text-[9.5px] truncate">{c.name || 'SEM NOME'}</span>
                      <div className="flex justify-between items-center w-full text-[7.5px] font-bold mt-1">
                        <span>VIDA: {c.vida} | {c.elemento}</span>
                        {isEvoc1 ? (
                          <span className="bg-emerald-800 text-white px-1 rounded-[2px] font-extrabold">EVOC 1</span>
                        ) : (
                          <span className="bg-amber-600 text-white px-1 rounded-[2px] font-extrabold">EVOC {c.evoc}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {cpuCard && (
              <div className="flex flex-col items-center gap-2 mt-3">
                {!isCpuEvoc1Eligible && (
                  <span className="text-[8px] bg-red-950 border border-red-600 text-red-400 px-2 py-1 font-bold rounded text-center w-full">
                    ⚠️ ESTA CARTA DO OPONENTE É EVOLUÇÃO {cpuCard.evoc}. DEVE SER DE EVOLUÇÃO 01 PARA COMEÇAR!
                  </span>
                )}
                <div className="flex justify-center p-2 bg-zinc-950 border border-zinc-900">
                  <BilowCardView card={cpuCard} scale={0.7} />
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col items-center gap-2.5">
            {!canStartBattle && playerCard && cpuCard && (
              <p className="text-red-500 font-extrabold text-[9px] bg-red-950/40 border border-destructive/50 px-4 py-2 uppercase tracking-widest animate-pulse max-w-xl text-center rounded">
                🚫 EMBRULHO BLOQUEADO: AMBAS CRIATURAS NO RING DEVEM SER DE EVOLUÇÃO 1 PARA EVITAR RETALIAÇÕES DA ARENA ANALÓGICA!
              </p>
            )}
            <button
              onClick={startMatch}
              disabled={!canStartBattle}
              className="py-4 px-12 border-4 border-white bg-white text-black font-black text-xs hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-30"
            >
              INICIAR COMBATE DE DISPUTA ⚔️
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE BATTLE SCRIM */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Player Grid Column 4 */}
          <div className="lg:col-span-4 flex flex-col items-center gap-3 border-2 border-zinc-800 bg-black p-4">
            <div className="text-center font-bold text-lg border-b border-zinc-850 pb-2 w-full text-zinc-300">
              CRIADOR (VOCÊ)
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-rose-500 font-extrabold text-xs">HP RESTANTE: {playerHp} / {playerCard?.vida}</span>
              <div className="w-44 h-2 bg-zinc-900 border border-zinc-700 overflow-hidden">
                <div 
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${(playerHp / (playerCard?.vida || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
              <BilowCardView card={playerCard!} scale={0.65} currentHp={playerHp} />
            </div>
          </div>

          {/* Core Arena Actions Column 4 */}
          <div className="lg:col-span-4 flex flex-col justify-between border-2 border-white bg-zinc-950 p-4 min-h-[460px]">
            <div className="text-center border-b border-zinc-800 pb-2">
              <span className="text-zinc-500 block">DADO DA ARENA</span>
              <div className="text-2xl font-black mt-1 flex items-center justify-center gap-2">
                {isRolling ? (
                  <span className="animate-bounce">🎲 ROLANDO...</span>
                ) : lastDiceRoll ? (
                  <div className="border-[2px] border-white px-4 py-2 bg-black text-white text-3xl font-bold font-mono">
                    {lastDiceRoll}
                  </div>
                ) : (
                  <span>AGUARDANDO ROLADA</span>
                )}
              </div>
            </div>

            {/* Turn status and drawn envelope card */}
            <div className="text-center py-4 bg-black border border-zinc-800 flex flex-col items-center gap-2.5 rounded-md px-2">
              <span className="text-[10px] tracking-widest text-zinc-400">TURNO ATUAL DE:</span>
              <div className="text-xs font-black text-emerald-400 underline underline-offset-4 decoration-emerald-400">
                {turnOwner === 'PLAYER' ? 'CRIADOR (VOCÊ)' : 'ADVERSÁRIO (OPONENTE)'}
              </div>

              {/* CARD COMPRA STATION */}
              <div className="mt-3 border-2 border-dashed border-zinc-700 p-2.5 bg-zinc-900/60 rounded-md w-full max-w-[200px] flex flex-col items-center gap-1.5">
                <span className="text-[7.5px] text-zinc-500 font-extrabold uppercase tracking-widest gap-1 flex items-center">
                  <Layers className="w-3 h-3 text-zinc-500" /> CARTA COMPRADA DESTE TURNO
                </span>
                {drawnShape ? (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[12px] font-black text-white font-mono tracking-wider bg-zinc-950 px-2 py-0.5 border border-zinc-800 rounded">
                      {drawnShape === 'TRIANGULO' ? '▲ TRIÂNGULO' : drawnShape === 'CIRCULO' ? '● CÍRCULO' : '■ QUADRADO'}
                    </span>
                    {currentActiveCard && (
                      <span className="text-[7.5px] text-zinc-400 font-bold mt-1 text-center">
                        REQUISITO DO POWER ATAK: [
                        {getDeterministicValue(currentActiveCard.id, ['QUADRADO', 'TRIANGULO', 'CIRCULO'], 5)}
                        ]
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-[8px] text-zinc-600 font-black animate-pulse">AGUARDANDO SAQUE...</span>
                )}
              </div>
            </div>

            {/* Manual actions controllers */}
            <div className="flex flex-col gap-2">
              {battleEnded ? (
                <div className="text-center p-3 border-2 border-red-500 bg-black flex flex-col items-center gap-2">
                  <Skull className="w-8 h-8 text-red-500" />
                  <span className="text-[10px] font-bold">DISPUTA CONCLUÍDA!</span>
                  <span className="text-xs font-bold font-display text-white">{winner === 'PLAYER' ? 'CRIADOR (VOCÊ)' : 'ADVERSÁRIO (OPONENTE)'} VENCEU!</span>
                  <button
                    onClick={() => setBattleStarted(false)}
                    className="mt-2 w-full py-2 bg-white text-black font-bold uppercase hover:bg-black hover:text-white border border-white cursor-pointer"
                  >
                    CONTINUAR
                  </button>
                </div>
              ) : (
                <button
                  onClick={rollDiceAndTurn}
                  disabled={isRolling || turnOwner === 'CPU'}
                  className="w-full py-4 border-2 border-white bg-white text-black font-black text-xs hover:bg-black hover:text-white transition-colors cursor-pointer disabled:opacity-30"
                >
                  {turnOwner === 'PLAYER' ? 'COMPRAR & ROLAR DADO 🎲' : 'ADVERSÁRIO PENSANDO...'}
                </button>
              )}

              <button
                onClick={() => setBattleStarted(false)}
                className="w-full py-2 bg-zinc-900 border border-zinc-750 hover:bg-zinc-800 text-zinc-300 text-[8.5px] uppercase cursor-pointer"
              >
                RODAR DE VOLTA À SELEÇÃO
              </button>
            </div>
          </div>

          {/* Adversary Column 4 */}
          <div className="lg:col-span-4 flex flex-col items-center gap-3 border-2 border-zinc-800 bg-black p-4">
            <div className="text-center font-bold text-lg border-b border-zinc-850 pb-2 w-full text-zinc-300">
              ADVERSÁRIO (OPONENTE)
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-rose-500 font-extrabold text-xs">HP RESTANTE: {cpuHp} / {cpuCard?.vida}</span>
              <div className="w-44 h-2 bg-zinc-900 border border-zinc-700 overflow-hidden">
                <div 
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${(cpuHp / (cpuCard?.vida || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div className="bg-zinc-950 p-1.5 rounded-xl border border-zinc-900">
              <BilowCardView card={cpuCard!} scale={0.65} currentHp={cpuHp} />
            </div>
          </div>

          {/* Combat logs terminal */}
          <div className="lg:col-span-12 border-2 border-white bg-black p-3.5 max-h-56 overflow-y-auto font-mono text-[8.5px] text-zinc-100 uppercase tracking-wider space-y-1 scrollbar-thin scrollbar-thumb-zinc-700">
            <div className="text-zinc-500 font-extrabold border-b border-zinc-900 pb-1.5 mb-2 flex items-center gap-1.5">
              <span>● CONSOLE DE BATALHA DE DECK ANALÓGICO BILOWS</span>
            </div>
            {logs.length === 0 && <span className="text-zinc-600">NENHUMA OPERAÇÃO GERADA.</span>}
            {logs.map((log, idx) => (
              <div key={idx} className="border-l border-zinc-700 pl-2">
                {log}
              </div>
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
