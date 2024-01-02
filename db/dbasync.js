var db = require('./dbpool');
const mysql = require('mysql');

module.exports = {
    myexec: async(sql,parameters) => {
        return new Promise((resolve, reject) => {
            db.connectionpool.getConnection(function(err, connection) {
                // console.log(connection)
                var querySQL = mysql.format(sql, parameters)
                var query = connection.query(querySQL, function(err, result,fields) {
                    connection.release();
                    if (err) {
                        if(process.env.NODE_ENV=='development'){

                            console.log(query.sql);
                            console.error(err);
                        }
        
                        reject(query.sql+''+err.sqlMessage);
                    }
                    if(process.env.NODE_ENV=='development'){
                       console.log('\033[32m', "SQL QUERY => " + query.sql);
                     }

     
                    resolve(result);
                });
            });
        })
    },

    beginTrans: async () => {
        return new Promise((resolve, reject) => {
            db.connectionpool.getConnection(function (err, connection) {
                connection.beginTransaction(function (err) {
                    // console.log(err)
                    if (err) {
                        reject(err.sqlMessage);
                    }
                    resolve(connection);
                    if (process.env.NODE_ENV == 'development') {
                        console.log('\033[32m', "BEGIN TRANSACTION");
                    }
                });

            });
        })
    },

    execTrans: async (connection, sql, parameters) => {
        return new Promise((resolve, reject) => {
            var querySQL = mysql.format(sql, parameters)
            var query=connection.query(querySQL, function (err, result, fields) {
                if (err) {
                    if (process.env.NODE_ENV == 'development') {
                        console.log(query.sql);
                        console.error(err);
                    }
                    reject(query.sql+''+err.sqlMessage);
                    return connection.rollback(function (error) {
                        throw error;
                    });
                }
                if (process.env.NODE_ENV == 'development') {
                    console.log('\033[32m', "SQL QUERY => " + query.sql);
                }
                resolve(result);
            });

        })
    },

    commitTrans: async (connection) => {
        return new Promise((resolve, reject) => {
            connection.commit(function (err) {
                if (err) {

                    if (process.env.NODE_ENV == 'development') {
                        console.log(query.sql);
                        console.error(err);
                    }

                    reject(err.sqlMessage);
                    
                    return connection.rollback(function () {
                        throw err;
                    });
                }
                if (process.env.NODE_ENV == 'development') {
                    console.log('\033[32m', "COMMIT");
                }
                resolve();
            });
        })
    }

}
