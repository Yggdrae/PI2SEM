const express = require('express');
const { getContacts, getMessages } = require('../controllers/controller');
const { dbUsers, dbHistory } = require('../models/model');
const router = express.Router();

// Rota para a tela inicial de login
router.get('/', (req, res) => {
    res.render('index', { username: req.query.username });
});

// Rota para a tela de contatos
router.get('/contacts', (req, res) => {
    const username = req.query.username;
    getContacts(username, (err, contacts) => {
        if (err) {
            return res.status(500).send('Erro interno do servidor');
        }
        res.render('contacts', { username: username, contacts: contacts });
    });
});

// Rota para a tela de conversa
router.get('/conversation/:contact', (req, res) => {
    const username = req.query.username;
    const contact = req.params.contact;
    getMessages(username, contact, (err, messages) => {
        if (err) {
            return res.status(500).send('Erro interno do servidor');
        }
        res.render('conversation', { username: username, contact: contact, messages: messages });
    });
});

// Autenticação do usuário
router.post('/login', (req, res) => {
    const username = req.body.username;
    dbUsers.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro interno do servidor');
        }
        if (!row) {
            return res.status(401).send('Nome de usuário inválido');
        }
        res.redirect(`/contacts?username=${username}`);
    });
});

module.exports = router;
