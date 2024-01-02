const dotenv = require('dotenv');
const path = require('path');
dotenv.config({
  path: path.resolve(__dirname,'../'+process.env.NODE_ENV + '.env')
  
});

var mysql = require('mysql')
   var pool = mysql.createPool({
   connectionLimit:50,
   host: '127.0.0.1',
   user:'jati',
   password: 'jati123',
   port: 3306,
   database:'dbtes',
   timezone: 'utc'
})


module.exports.connectionpool = pool;