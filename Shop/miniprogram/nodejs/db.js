var mysql = require('mysql');//引用Mysql
    var connection = mysql.createConnection({//配置连接
        host: 'localhost',//数据库地址
        user : "root",//数据库用户
        password: "123456",//数据库密码
        database : "mogujie"//需要连接的数据库
    });
    
    connection.connect();//连接数据库
    module.exports = {connection}