import fastify from 'fastify'
import {
    getOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
} from './mockDatabaseClient'
import { Order } from './types'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import path from 'path'
import { startGrpcServer } from './grpc-server'

const server = fastify({ logger: true })

startGrpcServer()

server.register(swagger, {
    mode: 'static',
    specification: {
        path: './swagger.json',
        baseDir: path.resolve(__dirname),
    },
})

server.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false,
    },
    uiHooks: {
        onRequest: function (request, reply, next) {
            next()
        },
        preHandler: function (request, reply, next) {
            next()
        },
    },
    staticCSP: true,
    transformStaticCSP: header => header,
    transformSpecification: (swaggerObject, request, reply) => {
        const modifiedSwaggerObject = { ...swaggerObject } as any;
        
        modifiedSwaggerObject.host = 'localhost';
        modifiedSwaggerObject.basePath = '/orders-api';
        
        return modifiedSwaggerObject;
    },
    transformSpecificationClone: true,
})

server.get('/orders', async () => {
    return getOrders()
})

server.get('/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const order = getOrderById(parseInt(id, 10))

    if (order) {
        return order
    }

    reply.status(404).send({ message: 'Order not found' })
})

server.get('/orders/:id/order-total', async (request, reply) => {
    const { id } = request.params as { id: string }
    const order = getOrderById(parseInt(id, 10))

    if (order) {
        const total = Number(order.products.reduce(
            (acc, product) => acc + product.price * product.count,
            0,
        ).toFixed(2))

        return reply.status(200).send({
            total,
        })
    }

    reply.status(404).send({ message: 'Order not found' })
})

server.post('/orders', async (request, reply) => {
    const { userId, products } = request.body as Order

    const newOrder = createOrder(userId, products)

    reply.status(201).send(newOrder)
})

server.put('/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const updatedOrder = request.body as Partial<Order>
    const order = updateOrder(parseInt(id, 10), updatedOrder)

    if (order) {
        return reply.status(201).send(order)
    }

    reply.status(404).send({ message: 'Order not found' })
})

server.delete('/orders/:id', async (request, reply) => {
    const { id } = request.params as { id: string }
    const success = deleteOrder(parseInt(id, 10))
    if (success) {
        reply.status(204).send()
    } else {
        reply.status(404).send({ message: 'Order not found' })
    }
})

const start = async () => {
    try {
        await server.listen({ port: 3000, host: '0.0.0.0' });
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()
