export type KingdomType = 'AR' | 'AGUA' | 'FOGO' | 'TERRA' | 'AG' | 'TE' | 'FO';

export type AbilityType = 'Ataque' | 'Defesa' | 'Cura' | 'Especial';

export interface BilowCard {
  id: string;
  name: string; // NOME max 12 chars
  evoc: string; // EVOC max 2 digits
  elemento: 'AG' | 'TE' | 'AR' | 'FO'; // ELEMENTO dropdown 
  vida: number; // VIDA (automatically calculated from PESO)
  peso: string; // PESO (max 4 digits treated as kilos)
  
  // Dynamic stats
  powerAtakElement: 'AG' | 'TE' | 'AR' | 'FO' | string;
  powerAtakMod: string; // "+1" to "+6"
  defesa: string | number; // shape + value or number
  antipoda: string; // antipode based on weight
  fraco: string; // opposite of ELEMENTO
  recuar: string; // random FO/AG/TE/AR
  
  // Behavior
  behaviorDado: string; // dropdown PAR, ÍMPAR, 1, 2, 3, 4, 5, 6
  behaviorAction: string; // max 13 digits, default "ACTION"
  behaviorHit: string; // max 13 digits, default "HIT"
  
  // Footer handle
  twitterHandle: string; // max 13 letters starting with @
  
  // Drawing canvas
  drawingDataUrl: string; // Base64 PNG image of user drawing
  createdAt: number;

  // Legacy compatibility fields to prevent compilation errors in template components
  kingdom?: KingdomType;
  hp?: number;
  atk?: number;
  def?: number;
  spd?: number;
  abilityName?: string;
  abilityDesc?: string;
  abilityType?: AbilityType;
  abilityPower?: number;
}

export interface Combatant {
  card: BilowCard;
  currentHp: number;
  maxHp: number;
  energy: number;
  usedAbility: boolean;
  isPlayer: boolean;
  statusEffects: string[];
}

export interface BattleLogEntry {
  id: string;
  turn: number;
  message: string;
  type: 'info' | 'player-attack' | 'cpu-attack' | 'ability' | 'damage' | 'defeat' | 'victory';
}
