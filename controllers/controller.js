const { dbUsers } = require('../models/model');
const { DateTime } = require('luxon');

// Função para obter contatos do banco de dados
function getContacts(username, callback) {
    dbUsers.all('SELECT username, nome_social FROM users WHERE username != ? ORDER BY username ASC', [username], (err, rows) => {
        if (err) {
            console.error(err.message);
            return callback(err, null);
        }
        const contacts = rows.map(row => ({
            username: row.username,
            name: row.nome_social
        }));
        callback(null, contacts);
    });
}

// Função para obter histórico de mensagens do banco de dados
function getMessages(username, contact, callback) {

    dbUsers.get('SELECT nome_social FROM users WHERE username = ?', [username], (err, row) => {
        if(err) {
            console.error(err.message);
        }
        const msg_from = row.nome_social;

        dbUsers.get('SELECT nome_social FROM users WHERE username = ?', [contact], (err, row_b) => {
            if(err) {
                console.error(err.message);
            }
            const msg_to = row_b.nome_social;

            dbUsers.all('SELECT * FROM historico WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?)', [msg_from, msg_to, msg_to, msg_from], (err, rows) => {
                if (err) {
                    console.error(err.message);
                    return callback(err, null);
                }
                const messages = rows.map(row => ({
                    from: row.from_user,
                    to: row.to_user,
                    message: row.message,
                    hour: row.hour,
                    username: row.username
                }));
                callback(null, messages);
            });
        })
    })
}

function saveMessages(from, to, message, today, hour, ano, mes, dia, hora, min, seg) {
    dbUsers.get('SELECT nome_social FROM users WHERE username = ?', [from], (err, row) => {
        if(err) {
            console.error(err.message);
        }
        const msg_from = row.nome_social;

        dbUsers.get('SELECT nome_social FROM users WHERE username = ?', [to], (err, row_b) => {
            if(err) {
                console.error(err.message);
            }
            const msg_to = row_b.nome_social;

            dbUsers.get('INSERT INTO historico (message, from_user, to_user, date, hour, years, months, days, hours, minutes, seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [message, msg_from, msg_to, today, hour, ano, mes, dia, hora, min, seg], (err) => {
                if (err) {
                    console.error(err.message);
                }
            });
        })
    })  
}

// Função para cadastrar usuários novos no banco de dados
function createUsers(username, nome_social) {
    dbUsers.get('INSERT INTO users (username, nome_social) VALUES (?, ?)', [username, nome_social], (err) => {
        if(err) {
            console.error(err.message);
        }
    });
}

// Função para atualizar dados de usuários no banco de dados
function updateUsers(id, username, nome_social) {
    dbUsers.get(`UPDATE users SET username = '${username}', nome_social = '${nome_social}' WHERE id = ${id};`, (err) => {
        if(err) {
            console.error(err.message);
        }
    });
}

// Função para deletar usuarios do bando de dados
function deleteUsers(username) {
    dbUsers.get(`DELETE FROM users WHERE username = '${username}';`, (err) => {
        if(err) {
            console.error(err.message);
        }
    })
}

async function checkUsers(contact, callback) {
    dbUsers.get('SELECT nome_social FROM users WHERE username = ?', [contact], (err, row) => {
        if (err) {
            console.error(err.message);
            return callback(err, null);
        }
        const checkedUser = row;
        callback(null, checkedUser);
    });
}

module.exports = { getContacts, getMessages, saveMessages, createUsers, updateUsers, deleteUsers, checkUsers};