export default interface ExchangeRate {
  base_currency: string;
  results: Record<string, number>;
}

export interface DateWiseRate {
  results: Record<string, number>;
}