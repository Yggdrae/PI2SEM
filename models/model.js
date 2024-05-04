const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexão com o banco de dados SQLite para usuários
const dbUsers = new sqlite3.Database(path.join(__dirname, 'users.sqlite'));
// Conexão com o banco de dados SQLite para histórico de mensagens
const dbHistory = new sqlite3.Database(path.join(__dirname, 'historico.sqlite'));

module.exports = { dbUsers, dbHistory };