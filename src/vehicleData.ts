export interface VehicleModel {
  id: string;
  name: string;
  price: number;
  power: string;
  acceleration: string;
}

export const VEHICLE_MODELS: VehicleModel[] = [
  {
    id: 'starter-car',
    name: 'Carro de Duelo',
    price: 3000,
    power: '120 HP',
    acceleration: '8.5s'
  },
  {
    id: 'school-bus',
    name: 'Ônibus Escolar',
    price: 45000,
    power: '280 HP',
    acceleration: '12.0s'
  },
  {
    id: 'sport-scout',
    name: 'Scout Esportivo',
    price: 15000,
    power: '220 HP',
    acceleration: '5.8s'
  },
  {
    id: 'hyper-drive',
    name: 'Hyper Drive',
    price: 95000,
    power: '650 HP',
    acceleration: '2.4s'
  }
];
