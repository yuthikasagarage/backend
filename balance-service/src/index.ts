import fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { getUserBalance, getOrdersByUserId } from './grpc-client'


const server = fastify({ logger: true });
server.register(swagger, {
    swagger: {
        info: {
            title: 'balance api',
            description: 'balance api',
        },
        host: 'localhost:3001',
        schemes: ['http'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
});

server.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'full',
        deepLinking: false
    }
});

server.get('/admin/balance/:userId',{schema: {
        description: 'historical balance for any date',
        tags: ['balance'],
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string', description: 'id' }
            }
        },
        querystring: {
            type: 'object',
            required: ['date'],
            properties: {
                date: {
                    type: 'string',
                    description: 'date string'
                }
            }
        },
    }}, async (request, reply) => {
    try {
        const { userId } = request.params;
        const { date } = request.query;

        if (!date) {
            return reply.code(400).send({ error: 'Date parameter is required' });
        }

        // Add time component if only date is provided (YYYY-MM-DD)
        let formattedDate = date;
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            formattedDate = `${date}T00:00:00.000Z`;
        }
        const targetDate = new Date(formattedDate)
        const dateString = targetDate.toISOString();

        const currentBalance = await getUserBalance(userId);

        const orderToDate = await getOrdersByUserId(userId, dateString);

        let spending = 0;
        for (const order of orderToDate) {
            for (const product of order.products) {
                spending += product.price * product.count;
            }
        }

        const balance =  currentBalance + spending;
        return {
            userId,
            date: formattedDate,
            balance,
        };
    } catch (error) {
        // need to do better than this :)
        return reply.code(500).send({ error: 'Failed to fetch balance' });
    }
})


server.get('/balance/:userId',{schema: {
        description: 'get user balance',
        tags: ['balance'],
        params: {
            type: 'object',
            required: ['userId'],
            properties: {
                userId: { type: 'string', description: 'id' }
            }
        },
    }}, async (request, reply) => {
    try {
    const { userId } = request.params;

    const balance  = await getUserBalance(userId);

    return { userId, balance };
    } catch (error) {
        // need to do better than this :)
        return reply.code(500).send({ error: 'Failed to fetch balance' });
    }
})

const start = async (): Promise<void> => {
    try {
        const PORT =  3001;
        await server.listen({ port: PORT, host: '0.0.0.0' });

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
