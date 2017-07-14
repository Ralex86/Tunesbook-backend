var mysql = require('mysql')
var {Abc} = require('./abc2svg.js')
var myconf = require('./../config.json')

class Sheet2sql{
    constructor(src_table, dest_table){
        this.svg = ""
        this.tuneID = null
        this.src = ""
        this.src_table = src_table
        this.dest_table = dest_table

        this.connection = mysql.createConnection({
            host: myconf.host,
            user: myconf.user,
            password : myconf.password,
            database: myconf.database
        })

        this.convert = this.convert.bind(this)
        this.run = this.run.bind(this)
        this.mysql_real_escape_string = this.mysql_real_escape_string.bind(this)
    }

    run(){
        this.connection.connect((err) => {
            if (err) throw err
            var query = `SELECT * FROM ${this.src_table}` 
            this.connection.query(query, (error, result, fields) => {
                if (error) throw error

                //console.log(result)

                for(var i=0; i<result.length;i++){
                    this.tuneID = result[i].id
                    this.src =  `X: ${result[i].id}\n` +
                                `T: ${result[i].T.split('\n').splice(1)}\n` +
                                `R: ${result[i].R}\n` + 
                                `M: ${result[i].M}\n` + 
                                `K: ${result[i].K}\n` +
                                `${result[i].body}\n`

                    this.convert(this.src, (svg) => {
                        var insert = `INSERT INTO ${this.dest_table} (tuneID, svg) VALUES (
                        ${result[i].id}, 
                        "${this.mysql_real_escape_string(svg)}")`
                        
                        this.connection.query(insert, (err, result) => {
                            if (err) throw err
                            console.log("1 record inserted")
                        })
                    }) // convert
                } // for loop
            })
        })
    }
    
    mysql_real_escape_string (str) {
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0" 
                case "\x08":
                    return "\\b" 
                case "\x09":
                    return "\\t" 
                case "\x1a":
                    return "\\z" 
                case "\n":
                    return "\\n" 
                case "\r":
                    return "\\r" 
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char  // prepends a backslash to backslash, percent,
                    // and double/single quotes
            }
        }) 
    }

    convert(src, callback){
        var errtxt = "", new_page = ""
        var user = {
            img_out: function(str){
                this.svg = ((typeof this.svg === 'undefined') ? "" : this.svg + '\n') + str
                if (str == "</div>")
                    callback(this.svg)
            },
            errmsg: function(msg,l,c){
                errtxt += msg + '\n'
                console.log(errtxt)
                console.log('line, column', l, c)
            },
            page_format: true
        }
        var abc = new Abc(user)
        abc.tosvg("a", src)
    }
}

var addTuples = new Sheet2sql("Jigs", "SVGJIGS")
addTuples.run()
