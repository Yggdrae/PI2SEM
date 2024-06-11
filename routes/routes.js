const express = require('express');
const { getContacts, getMessages, checkUsers } = require('../controllers/controller');
const { dbUsers } = require('../models/model');

const router = express.Router();

// Middleware para verificar se o usuário está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.username) {
        return next();
    }
    res.redirect('/');
}

// Rota para a tela inicial de login
router.get('/', (req, res) => {
    res.render('index', { username: req.session.username });
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
        req.session.username = username;
        res.redirect('/contacts');
    });
});

router.get('/admin', isAuthenticated, (req, res) => {
        res.render('admin');
    });

// Rota para a tela de contatos
router.get('/contacts', isAuthenticated, (req, res) => {
    const username = req.session.username;
    getContacts(username, (err, contacts) => {
        if (err) {
            return res.status(500).send('Erro interno do servidor');
        }
        res.render('contacts', { username: username, contacts: contacts });
    });
});

// Rota para a tela de conversa
router.get('/conversation/:contact', isAuthenticated, async (req, res) => {
    const username = req.session.username;
    await checkUsers(req.params.contact, (err, contact) => {
        if (err) {
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

// Rota para logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
