
export interface UserBalance {
  userId: string;
  balance: number;
}

export interface HistoricalBalance {
  userId: string;
  date: string;
  balance: number;
}

export interface Order {
  id: number;
  userId: string;
  products: Product[];
  createdAt: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  count: number;
}

export interface ErrorResponse {
  error: string;
}


export interface BalanceParams {
  userId: string;
}

export interface HistoricalBalanceQuery {
  date: string;
}
