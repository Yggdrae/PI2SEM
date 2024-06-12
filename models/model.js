const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexão com o banco de dados SQLite para Banco de Dados
const dbUsers = new sqlite3.Database(path.join(__dirname, 'users.sqlite'));

module.exports = { dbUsers };