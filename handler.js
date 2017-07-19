var mysql = require('mysql')
var myconf = require('./config.json')
var getYouTubeID = require('get-youtube-id');

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
        this.database_svg = this.database_svg.bind(this)
        this.database_youtube = this.database_youtube.bind(this)
        this.database_name = this.database_name.bind(this)
    }

    database_submit_video(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({
                    "code": 100, 
                    "status" : "error in connection database"})
                return
            }

            var title = this.req.body.title
            var youtubeID = getYouTubeID(this.req.body.url)
            var tuneID = this.req.body.tuneid
            var rhythm = this.req.body.rhythm

            var sql = `INSERT INTO youtube (tuneID, rhythm, youtubeID, title) VALUES (${tuneID},"${rhythm}","${youtubeID}","${title}");`
            connection.query(sql, (err,rows) => {
                connection.release()
                if(!err){
                    this.res.json({"success" : "Video added to the database"})
                }
            })

            connection.on('error', (err) => {
                this.res.json({"code": 100, "status": "error in connection database"})
                return
            })
        })
    }

    database_tunes(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }

            connection.query(`select * from ${this.req.params.rhythm}`, (err,rows) => {
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
    
    database_svg(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }

            connection.query(`select svg from SVG${this.req.params.rhythm} WHERE tuneID=${this.req.params.id}`, (err,rows) => {
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
    
    database_youtube(){
        pool.getConnection((err, connection) => {
            if (err){
                this.res.json({"code": 100, "status" : "error in connection database"})
                return
            }

            connection.query(`select youtubeID, title, id from youtube WHERE tuneID=${this.req.params.id} AND rhythm="${this.req.params.rhythm }"`, (err,rows) => {
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
