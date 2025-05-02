import { getOrdersByUserId, getUserBalance } from './grpc-client';


export async function getCurrentBalance(userId: string): Promise<number> {
  try {
    return await getUserBalance(userId);
  } catch (error) {
    throw new Error('Failed to get current balance');
  }
}

export async function getBalanceAtDate(userId: string, targetDate: Date): Promise<number> {
  try {
    const dateString = targetDate.toISOString();
    
    const currentBalance = await getCurrentBalance(userId);
    
    const pastOrders = await getOrdersByUserId(userId, dateString);
   
    
    let pastSpending = 0;
    for (const order of pastOrders) {
      for (const product of order.products) {
        pastSpending += product.price * product.count;
      }
    }
    
    return currentBalance + pastSpending;
  } catch (error) {
    
    throw new Error('Failed to calculate balance at date');
  }
} 