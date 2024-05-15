const { dbUsers, dbHistory } = require('../models/model');

// Função para obter contatos do banco de dados
function getContacts(username, callback) {
    dbUsers.all('SELECT username FROM users WHERE username != ? ORDER BY username ASC', [username], (err, rows) => {
        if (err) {
            console.error(err.message);
            return callback(err, null);
        }
        const contacts = rows.map(row => row.username);
        callback(null, contacts);
    });
}

// Função para obter histórico de mensagens do banco de dados
function getMessages(username, contact, callback) {
    dbHistory.all('SELECT * FROM historico WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)', [username, contact, contact, username], (err, rows) => {
        if (err) {
            console.error(err.message);
            return callback(err, null);
        }
        const messages = rows.map(row => ({
            from: row.from_user,
            to: row.to_user,
            message: row.message
        }));
        callback(null, messages);
    });
}

function saveMessages(from, to, message) {
    dbHistory.get('INSERT INTO historico (message, from_user, to_user) VALUES (?, ?, ?)', [message, from, to], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

module.exports = { getContacts, getMessages, saveMessages };
