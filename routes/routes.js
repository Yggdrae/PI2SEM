const express = require('express');
const { getContacts, getMessages, checkUsers } = require('../controllers/controller');
const { dbUsers } = require('../models/model');

const router = express.Router();

// Rota para a tela inicial de login
router.get('/', (req, res) => {
    res.render('index', { username: req.query.username });
});

// Rota para a tela de contatos
router.get('/contacts', (req, res) => {
    const username = req.query.username;
    if (username === 'admin') {
        return res.render('admin');
    }
    getContacts(username, (err, contacts) => {
        if (err) {
            return res.status(500).send('Erro interno do servidor');
        }
        res.render('contacts', { username: username, contacts: contacts });
    });
});

// Rota para a tela de conversa
router.get('/conversation/:contact', async (req, res) => {
    const username = req.query.username;
    await checkUsers(req.params.contact, (err, contact) => {
        if(err){
            return res.status(500).send('Erro interno do servidor');
        }
        const contactName = contact.nome_social;
        getMessages(username, req.params.contact, (err, messages) => {
            if (err) {
                return res.status(500).send('Erro interno do servidor');
            }
            res.render('conversation', { username: username, contact: contactName, messages: messages });
        });
    });
    
});

// Autenticação do usuário
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    dbUsers.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!row) {
            return res.status(401).send('Nome de usuário ou senha inválidos!');
        }
        res.redirect(`/contacts?username=${username}`);
    });
});

module.exports = router;
