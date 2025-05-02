import fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import routes from './routes';


const server = fastify({ logger: true });


server.register(swagger, {
  swagger: {
    info: {
      title: 'Balance Service',
      description: 'Balance microservice for Kanpla',
      version: '1.0.0'
    },
    host: 'localhost',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    basePath: '/balance-api'
  }
});

server.register(swaggerUI, {
  routePrefix: '/documentation',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  transformSpecification: (swaggerObject) => {
  
    if (swaggerObject.paths) {
    }
    return swaggerObject;
  }
});

server.register(routes);


interface HealthResponse {
  status: string;
}

const start = async (): Promise<void> => {
  try {
    const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await server.listen({ port: PORT, host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 