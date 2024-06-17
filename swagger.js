const swaggerAutogen = require('swagger-autogen');

const doc = {
    info: {
        version: "1.0.0",
        title: "API Chat",
        description: "API Chat"
    },
    servers: [
        { url: 'http://localhost:3000' }
    ]
};

const outputFile = './swagger-output.json';
const endpointFiles = ['./server.js'];

swaggerAutogen({openapi: "3.0.0"})(outputFile,endpointFiles,doc)