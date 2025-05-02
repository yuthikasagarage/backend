import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import * as balanceService from './services/balanceService';
import { UserBalance, HistoricalBalance, ErrorResponse, HistoricalBalanceQuery, BalanceParams } from './types';


export default async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{
    Params: BalanceParams;
    Reply: UserBalance | ErrorResponse;
  }>('/balance/:userId', {
    schema: {
      description: 'Get current balance for a user',
      tags: ['balance'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', description: 'User ID' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            balance: { type: 'number' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const balance = await balanceService.getCurrentBalance(userId);
      return { userId, balance };
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to fetch balance' });
    }
  });


  fastify.get<{
    Params: BalanceParams;
    Querystring: HistoricalBalanceQuery;
    Reply: HistoricalBalance | ErrorResponse;
  }>('/admin/balance/:userId', {
    schema: {
      description: 'Get historical balance for a user at a specific date',
      tags: ['admin'],
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string', description: 'User ID' }
        }
      },
      querystring: {
        type: 'object',
        required: ['date'],
        properties: {
          date: { 
            type: 'string', 
            description: 'Target date in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss.sssZ)'
          }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            userId: { type: 'string' },
            date: { type: 'string' },
            balance: { type: 'number' },
          }
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        },
        500: {
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { userId } = request.params;
      const { date } = request.query;
      
      if (!date) {
        return reply.code(400).send({ error: 'Date parameter is required' });
      }
      
  
      let formattedDate = date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        formattedDate = `${date}T00:00:00.000Z`;
      }
      
      const balance = await balanceService.getBalanceAtDate(userId, new Date(formattedDate));
      return { 
        userId, 
        date: formattedDate, 
        balance
      };
    } catch (error) {
      return reply.code(500).send({ error: 'Failed to fetch historical balance' });
    }
  });
} 
