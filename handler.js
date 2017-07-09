var mysql = require('mysql')
var myconf = require('./config.json')

var pool = mysql.createPool({
    connectionLimit: 100, //important
    host: myconf.host,
    user: myconf.user,
    password : myconf.password,
    database: myconf.database,
    debug: false
})

class Handle {
    constructor(req,res){
        this.req = req
        this.res = res

        this.pool = mysql.createPool({
            connectionLimit: 100, //important
            host: myconf.host,
            user: myconf.user,
            password : myconf.password,
            database: myconf.database,
            debug: false
        })

        this.database_tunes = this.database_tunes.bind(this)
        this.database_name = this.database_name.bind(this)
    }

    database_tunes(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }

            connection.query("select * from Tunes", (err,rows) => {
                connection.release()
                if(!err){
                    this.res.json(rows)
                }
            })

            connection.on('error', (err) => {
                this.res.json({"code": 100, "status": "error in connection database"})
                return
            })
        })
    }

    database_tuneID(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }

            connection.query(`select svg from Svg WHERE tuneID=${this.req.query.id}`, (err,rows) => {
                connection.release()
                if(!err){
                    this.res.json(rows)
                }
            })

            connection.on('error', (err) => {
                this.res.json({"code": 100, "status": "error in connection database"})
                return
            })
        })
    }
    
    database_name(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }

            connection.query(`select name from Musicians WHERE id=${this.req.query.id}`, (err,rows) => {
                connection.release()
                if(!err){
                    this.res.json(rows)
                }
            })

            connection.on('error', (err) => {
                this.res.json({"code": 100, "status": "error in connection database"})
                return
            })
        })
    }
}

module.exports = Handle
