import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import { Order } from '../types';


const PROTO_PATH = process.env.PROTO_PATH || path.resolve(__dirname, '../../../protos/common.proto');


const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const orderProto = grpc.loadPackageDefinition(packageDefinition).order as any;


const orderServiceUrl = process.env.ORDER_SERVICE_GRPC_URL || 'order-service:50051';
const orderServiceClient = new orderProto.OrderService(
  orderServiceUrl, 
  grpc.credentials.createInsecure()
);

console.log(" services:", Object.keys(orderProto));
console.log(" methods:", Object.keys(orderProto.OrderService.service));

export async function getOrdersByUserId(userId: string, beforeDate: string | null = null): Promise<Order[]> {
  return new Promise((resolve, reject) => {
    orderServiceClient.getOrdersByUserId({ userId, beforeDate }, (err: Error | null, response: { orders: Order[] }) => {
      if (err) return reject(err);
      resolve(response.orders);
    });
  });
}

export async function getUserBalance(userId: string): Promise<number> {
  return new Promise((resolve, reject) => {
    orderServiceClient.getUserBalance({ userId }, (err: Error | null, response: { balance: number }) => {
      if (err) return reject(err);
      resolve(response.balance);
    });
  });
} 