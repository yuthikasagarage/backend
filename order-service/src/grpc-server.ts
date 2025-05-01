import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'
import path from 'path'
import { getUserById, getOrdersByUserIdAndDate } from './mockDatabaseClient'

// Use a path that works in both local and Docker environments
const PROTO_PATH = path.resolve(__dirname, '../../common.proto')

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
})

const orderProto = grpc.loadPackageDefinition(packageDefinition).order as any


function getOrdersByUserIdHandler(call: grpc.ServerUnaryCall<{userId: string, beforeDate?: string}, any>, callback: grpc.sendUnaryData<any>) {
    const { userId, beforeDate } = call.request


    let userOrders;
    if (beforeDate) {
        userOrders = getOrdersByUserIdAndDate(userId, new Date(beforeDate));
    } else {
        userOrders = getOrdersByUserIdAndDate(userId);
    }

    const ordersWithStringDates = userOrders.map(order => ({
        ...order,
        createdAt: order.createdAt.toISOString()
    }))

    callback(null, { orders: ordersWithStringDates })
}

function getUserBalanceHandler(call: grpc.ServerUnaryCall<{userId: string}, any>, callback: grpc.sendUnaryData<any>) {
    const { userId } = call.request
    const user = getUserById(userId)
    if(!user){
        return callback({
            code: grpc.status.NOT_FOUND,
            message: 'User not found'
        })
    }

    callback(null, { balance: user.balance })
}


export function startGrpcServer() {
    const server = new grpc.Server()

    server.addService(orderProto.OrderService.service, {
        getOrdersByUserId: getOrdersByUserIdHandler,
        getUserBalance: getUserBalanceHandler
    })

    const port = 50051
    server.bindAsync(`0.0.0.0:${port}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        server.start()
    })

    return server
}
