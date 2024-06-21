const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const session = require('express-session');
const routes = require('./routes/routes');
const { saveMessages, checkUsers, saveConnHistory, getContacts, isLastConnectionMoreRecent, checkIfNewer  } = require('./controllers/controller');
const { DateTime } = require('luxon');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Configurações do Express
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Configuração do express-session
app.use(session({
    secret: 'seuSegredoAqui',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // para produção, mude para true com HTTPS
}));

app.use('/', routes);

// Conexão Socket.io
io.on('connection', (socket) => {
    console.log('Novo usuário conectado');

    socket.on("newMessageCheck", (data) => {
        const username = data;
        getContacts(username, (err, contacts) => {
            if(err){
                console.err(err.message);
            }
            contacts.forEach(contact => {
                checkIfNewer(username, contact.username, (err, receivedName) => {
                    if(err){
                        console.err(err.message);
                    }
                    socket.emit("newMessageCheck", receivedName);
                })
            })
        });
    });

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

        // Verificar se ainda está conectado e salvar a conexão
        socket.on('stillConn', () =>{
            const pingTime = DateTime.now();
            const pingToday = `${pingTime.toFormat('dd/MM/yyyy')}`;
            const pingHour = `${pingTime.toFormat('HH:mm:ss')}`;
            saveConnHistory(from, to, pingToday, pingHour);
        })
    });

    socket.on('chat message', (msg) => {
        const { from, to, message } = msg;
        const roomName = [from, to].sort().join('-'); // Concatenação ordenada dos nomes de usuário
        const currentDate = DateTime.now();
        const today = `${currentDate.toFormat('dd/MM/yyyy')}`;
        const hour = `${currentDate.toFormat('HH:mm:ss')}`;
        saveMessages(from, to, message, today, hour);

        checkUsers(from, (err, fromName) => {
            if (err) {
                return res.status(500).send('Erro interno do servidor');
            }
            const msgFromName = fromName.nome_social;

            checkUsers(to, (err, toName) => {
                if (err) {
                    return res.status(500).send('Erro interno do servidor');
                }
                const msgToName = toName.nome_social;
                io.to(roomName).emit('chat message', { msg: msg, hour: hour, date: today, from: msgFromName, to: msgToName });
                console.log(`${from}: ${message} --> ${to} as ${hour}`);
            });
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuário desconectado');
    });
});

app.use('/docs',swaggerUi.serve, swaggerUi.setup(swaggerFile))

// Iniciar o servidor
server.listen(PORT, () => {
    console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});
