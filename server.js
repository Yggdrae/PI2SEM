const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const { DateTime } = require('luxon');

const app = express();
const port = 3000;

// Conectar ao banco de dados SQLite
const db = new sqlite3.Database('users.sqlite');
const hist = new sqlite3.Database('historico.sqlite');

// Configurar middleware para analisar dados do formulário
app.use(bodyParser.urlencoded({ extended: false }));

// Servir arquivos estáticos
app.use(express.static('public'));

// Criação do servidor HTTP
const server = http.createServer(app);

// Inicialização do Socket.IO
const io = socketIo(server);

// Rota para a página de login
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});

// Rota para autenticar o usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Buscar usuário no banco de dados
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        if (!row) {
            return res.status(401).send('Credenciais inválidas');
        }
        // Redireciona para a página de chat com o nome de usuário como parâmetro de consulta
        res.redirect(`/chat?username=${encodeURIComponent(username)}`);
        req.query.username = username
    });
});

app.post('/cadastro', (req, res) => {
    const {name, password} = req.body;
    const username = name.replace(' ', '.').toLowerCase()

    db.get('SELECT username FROM users WHERE username = ?', [username], (err, user) => {
        if(err){
            return console.error(err.message);
        }
        if(user){
            return res.status(401).send('Usuário já cadastrado.')
        }
        else{
            db.get('INSERT INTO users (username, password, nome_social) VALUES (?, ?, ?)', [username, password, name], (err) =>{
                if(err){
                    return console.error(err.message);
                }
                res.redirect('/chat');
            })
        }
    })
})

// Rota para a página de chat
app.get('/chat', (req, res) => {
    // Verifica se o usuário está autenticado
    const username = req.query.username;
    if (!username) {
        return res.redirect('/');
    }
    res.sendFile(__dirname + '/chat.html');
});

// Conexão de socket
io.on('connection', (socket) => {
    console.log('A user connected');

    hist.each('SELECT username, message FROM historico', async (err, data) =>{
        if(err){
            return console.error(err.message);
        }
        io.emit('chat message', data);
    })

    // Escuta a mensagem do cliente
    socket.on('chat message', (data) => {
        console.log('message: ' + data.username + ': ' + data.message);
        const currentDate = DateTime.now();
        const today = `${currentDate.toFormat('dd/MM/yyyy')}`;
        const hour = `${currentDate.toFormat('HH:mm:ss')}`;
        hist.get('INSERT INTO historico (message, username, date, hour) VALUES (?, ?, ?, ?)', [data.message, data.username, today, hour], (err) =>{
            if(err){
                return console.error(err.message);
            }
        })
        // Envia a mensagem para todos os clientes conectados
        io.emit('chat message', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Inicia o servidor
server.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});