const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const routes = require('./routes/routes');
const {saveMessages, checkUsers} = require('./controllers/controller');
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
        socket.join(roomName);
        const hour = `${DateTime.now().toFormat('HH:mm:ss')}`;
        console.log(`${username} entrou na sala de conversa com ${contact} as ${hour}`);
    });

    socket.on('chat message', (msg) => {
        const { from, to, message } = msg;
        const roomName = [from, to].sort().join('-'); // Concatenação ordenada dos nomes de usuário
        const currentDate = DateTime.now();
        const today = `${currentDate.toFormat('dd/MM/yyyy')}`;
        const hour = `${currentDate.toFormat('HH:mm:ss')}`;
        saveMessages(from, to, message, today, hour);

        checkUsers(from, (err, fromName) => {
            if(err){
                return res.status(500).send('Erro interno do servidor');
            }
            const msgFromName = fromName.nome_social;

            checkUsers(to, (err, toName) => {
                if(err){
                    return res.status(500).send('Erro interno do servidor');
                }
                const msgToName = toName.nome_social;
                
                io.to(roomName).emit('chat message', {msg: msg, hour: hour, from: msgFromName, to: msgToName});
                console.log(`${from}: ${message} --> ${to} as ${hour}`);
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
