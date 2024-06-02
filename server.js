const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const routes = require('./routes/routes');
const { saveMessages, saveConnHistory } = require('./controllers/controller');
const { DateTime } = require('luxon');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use('/', routes);

// Conexão Socket.io
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    socket.on('join conversation', (data) => {
        const { username, contact } = data;
        const roomName = [username, contact].sort().join('-'); // Concatenação ordenada dos nomes de usuário
        const currentDate = DateTime.now();
        const today = `${currentDate.toFormat('dd/MM/yyyy')}`;
        const hour = `${currentDate.toFormat('HH:mm:ss')}`;
        socket.join(roomName);
        console.log(`${username} está na sala de conversa com ${contact} as ${hour}`);
        
        const from = username
        const to = contact
        saveConnHistory(from, to, today, hour);
    });

    socket.on('chat message', (msg) => {
        const { from, to, message } = msg;
        const roomName = [from, to].sort().join('-'); // Concatenação ordenada dos nomes de usuário
        const currentDate = DateTime.now();
        const today = `${currentDate.toFormat('dd/MM/yyyy')}`;
        const hour = `${currentDate.toFormat('HH:mm:ss')}`;
        saveMessages(from, to, message, today, hour);
        io.to(roomName).emit('chat message', {msg: msg, hour: hour});
        console.log(`${from}: ${message} --> ${to} as ${hour}`);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
