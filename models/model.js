const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Conexão com o banco de dados SQLite para Banco de Dados
const dbUsers = new sqlite3.Database(path.join(__dirname, 'users.sqlite'));
dbUsers.run( 'PRAGMA foreign_keys = ON;' );



module.exports = { dbUsers };