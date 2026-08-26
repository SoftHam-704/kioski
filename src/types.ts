export type EstablishmentType = 'quiosque_praia' | 'restaurante_bar' | 'rooftop_lounge' | 'foodpark_complexo';

export interface SectorConfig {
  id: string;
  label: string;
  iconName: 'sun' | 'umbrella' | 'users' | 'flame' | 'sparkles' | 'coffee' | 'building' | 'trees';
  description: string;
}

export interface EstablishmentProfile {
  id: string;
  name: string;
  tradeName: string;
  type: EstablishmentType;
  tagline: string;
  location: string;
  sectors: SectorConfig[];
  currency: string;
  defaultServiceFee: number;
}

export type TableSector = string;

export type TableStatus = 'livre' | 'ocupada' | 'conta_solicitada' | 'reservada';

export interface BeachItem {
  id: string;
  name: string;
  category: 'bebidas' | 'porcoes' | 'pratos' | 'aluguel' | 'sobremesas' | 'drinks' | 'entradas';
  price: number;
  description: string;
  image?: string;
  prepStation: 'bar' | 'cozinha' | 'apoio';
  prepTimeMinutes: number;
  isAvailable: boolean;
  unit?: string;
}

export interface OrderItem {
  id: string;
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  assignedToCustomer: string; // Nome do cliente na mesa (ex: "Carlos", "Mesa Toda")
  notes?: string;
  status: 'enviado' | 'preparando' | 'pronto' | 'entregue' | 'cancelado';
  prepStation: 'bar' | 'cozinha' | 'apoio';
  timestamp: string;
}

export interface Customer {
  id: string;
  name: string;
  color: string;
}

export interface TableOrSpot {
  id: string;
  code: string; // Ex: "M-01", "G-04", "B-02", "T-05"
  name: string;
  sector: TableSector;
  capacity: number;
  status: TableStatus;
  openedAt?: string;
  waiterName?: string;
  customers: Customer[];
  orders: OrderItem[];
  minimumConsumption: number; // Consumação mínima em R$ se houver
  serviceFeePercent: number; // Padrão 10%
  paidAmount: number; // Valor já pago parcialmente
  payments: PaymentRecord[];
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  customerName: string;
  amount: number;
  method: 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro';
  timestamp: string;
  txId?: string;
}

export interface TableTransferLog {
  id: string;
  timestamp: string;
  sourceTableCode: string;
  targetTableCode: string;
  transferType: 'troca_completa' | 'fusao' | 'transferencia_itens';
  waiterName: string;
  itemsTransferredCount: number;
  customersTransferredCount: number;
  reason: string;
}

export interface ServiceCallAlert {
  id: string;
  tableCode: string;
  tableName: string;
  type: 'garcom' | 'gelo' | 'guarda_sol' | 'conta' | 'atendimento';
  timestamp: string;
  status: 'pendente' | 'atendido';
}

export type ActiveTab = 'simulador_mobile' | 'tablet_cardapio' | 'retaguarda_kds' | 'estudo_viabilidade' | 'calculadora_roi' | 'consultor_ai';

