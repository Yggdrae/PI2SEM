import swaggerAutogen from 'swagger-autogen'

const doc = {
    info: {
        version : "1.0.0",
        title: "Minha API",
        description: "API de chat para intranet - CHÁ DA TERRA Manipulação"
    },
    servers: [
        { url:'http://localhost:3000' },
        { url:'https://pi2sem.onrender.com/'}
    ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js'];

swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc)