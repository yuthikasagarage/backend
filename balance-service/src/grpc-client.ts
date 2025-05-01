import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import * as path from 'path';
import * as fs from 'fs';
import { Order } from '../types';


const PROTO_PATH = path.resolve(__dirname, '../../../common.proto');

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});

const orderProto = grpc.loadPackageDefinition(packageDefinition).order as any;
const orderServiceUrl =  'order-service:50051';
const orderServiceClient = new orderProto.OrderService(
    orderServiceUrl,
    grpc.credentials.createInsecure()
);
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
