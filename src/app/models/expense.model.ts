export interface Expense {
  id?: string; // ID generado por Firebase
  name: string; // Nombre del gasto (ej.: "Tarjeta de crédito")
  isFixed: boolean; // Indica si es fijo o no
  paymentType: 'cash' | 'debit';
}
