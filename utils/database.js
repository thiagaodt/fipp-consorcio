import mysql from 'mysql2'
import dotenv from "dotenv";

dotenv.config();

export default class Database {

    #conexao;

    get conexao() { return this.#conexao;} set conexao(conexao) { this.#conexao = conexao; }

    constructor() {

        this.#conexao = mysql.createPool({
<<<<<<< HEAD
            host: process.env.DB_HOST, 
            database: process.env.DB_NAME, 
            user: process.env.DB_USER, 
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT,
=======
            host: process.env.DB_HOST || 'localhost', 
            database: process.env.DB_NAME || 'consorcio', 
            user: process.env.DB_USER || 'root', 
            password: process.env.DB_PASSWORD|| '',
>>>>>>> 8cf7bf51b5af06b39174e510a472c5da3e22f92d
            idleTimeout: 30000,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }

    AbreTransacao() {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query("START TRANSACTION", function (error, results, fields) {
                if (error) 
                    rej(error);
                else
                    res(results);
            });
        })
    }
    
    Rollback() {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query("ROLLBACK", function (error, results, fields) {
                if (error) 
                    rej(error);
                else
                    res(results);
            });
        })
    }
    
    Commit() {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query("COMMIT", function (error, results, fields) {
                if (error) 
                    rej(error);
                else
                    res(results);
            });
        })
    }

    ExecutaComando(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results);
            });
        })
    }
    
    ExecutaComandoNonQuery(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results.affectedRows > 0);
            });
        })
    }

    ExecutaComandoLastInserted(sql, valores) {
        var cnn = this.#conexao;
        return new Promise(function(res, rej) {
            cnn.query(sql, valores, function (error, results, fields) {
                if (error) 
                    rej(error);
                else 
                    res(results.insertId);
            });
        })
    }

}