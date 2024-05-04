const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const routes = require('./routes/routes');
const { dbUsers, dbHistory } = require('./models/model');

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
        socket.join(roomName);
        console.log(`${username} entrou na sala de conversa com ${contact}`);
    });

    socket.on('chat message', (msg) => {
        const { from, to, message } = msg;
        const roomName = [from, to].sort().join('-'); // Concatenação ordenada dos nomes de usuário
        dbHistory.get('INSERT INTO historico (message, from_user, to_user) VALUES (?, ?, ?)', [message, from, to], (err) => {
            if (err) {
                console.error(err.message);
            }
        });
        io.to(roomName).emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
