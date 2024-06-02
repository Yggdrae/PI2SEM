const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexão com o banco de dados SQLite para usuários
const dbUsers = new sqlite3.Database(path.join(__dirname, 'users.sqlite'));
// Conexão com o banco de dados SQLite para histórico de mensagens
const dbHistory = new sqlite3.Database(path.join(__dirname, 'historico.sqlite'));
// Conexão com o banco de dados SQLite para histórico de conexões
const dbConnHistory = new sqlite3.Database(path.join(__dirname, 'connectionHistory.sqlite'));

module.exports = { dbUsers, dbHistory, dbConnHistory };


/*

dbConnHistory
connectionHistory.sqlite

*/