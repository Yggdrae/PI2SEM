const { dbUsers, dbHistory, dbConnHistory } = require('../models/model');
const { DateTime } = require('luxon');

// Função para obter contatos do banco de dados
function getContacts(username, callback) {
    dbUsers.all('SELECT username, nome_social FROM users WHERE username != ? ORDER BY username ASC', [username], (err, rows) => {
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
            message: row.message,
            hour: row.hour
        }));
        callback(null, messages);
    });
}

// Função para incluir dados no dbHistory
function saveMessages(from, to, message, today, hour) {
    dbHistory.get('INSERT INTO historico (message, from_user, to_user, date, hour) VALUES (?, ?, ?, ?, ?)', [message, from, to, today, hour], (err) => {
        if (err) {
            console.error(err.message);
        }
    });
}

// Função para incluir dados no dbConnHistory
function saveConnHistory(from, to, today, hour) {
    // Verifica se já existe uma linha com os valores 'from' e 'to'
    dbConnHistory.get('SELECT * FROM connectionHistory WHERE from_user = ? AND to_user = ?', [from, to], (err, row) => {
        if (err) {
            console.error(err.message);
            return;
        }

        if (row) {
            // Atualiza a linha existente com os novos valores
            dbConnHistory.run('UPDATE connectionHistory SET date = ?, hour = ? WHERE from_user = ? AND to_user = ?', [today, hour, from, to], (updateErr) => {
                if (updateErr) {
                    console.error(updateErr.message);
                }
            });
        } else {
            // Cria uma nova linha
            dbConnHistory.run('INSERT INTO connectionHistory (from_user, to_user, date, hour) VALUES (?, ?, ?, ?)', [from, to, today, hour], (insertErr) => {
                if (insertErr) {
                    console.error(insertErr.message);
                }
            });
        }
    });
}

// Função para verificar se a última connectionHistory é mais recente que a última mensagem enviada
function isLastConnectionMoreRecent(from, to, callback) {
    dbConnHistory.get(`SELECT * 
         FROM connectionHistory 
         WHERE from_user = ? AND to_user = ? 
         ORDER BY 
             strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) DESC, 
             hour DESC 
         LIMIT 1`, 
        [from, to], 
        (connErr, lastConnection) => {
            if (connErr) {
                return callback(connErr, null);
            }

            dbHistory.get(
                `SELECT * 
                 FROM historico 
                 WHERE (from_user = ? AND to_user = ?) OR (from_user = ? AND to_user = ?) 
                 ORDER BY 
                     strftime('%Y-%m-%d', substr(date, 7, 4) || '-' || substr(date, 4, 2) || '-' || substr(date, 1, 2)) DESC, 
                     hour DESC 
                 LIMIT 1`, 
                [from, to, to, from], 
                (msgErr, lastMessage) => {
                    if (msgErr) {
                        return callback(msgErr, null);
                    }

                    if (!lastConnection || !lastMessage) {
                        return callback(new Error('Dados insuficientes para comparação'), null);
                    }

                    const lastConnDateTime = DateTime.fromFormat(lastConnection.date + ' ' + lastConnection.hour, 'dd/MM/yyyy HH:mm:ss');
                    const lastMsgDateTime = DateTime.fromFormat(lastMessage.date + ' ' + lastMessage.hour, 'dd/MM/yyyy HH:mm:ss');

                    const isMoreRecent = lastConnDateTime > lastMsgDateTime;
                    callback(null, isMoreRecent);
                }
            );
        }
    );
}

module.exports = { getContacts, getMessages, saveMessages, saveConnHistory, isLastConnectionMoreRecent };
