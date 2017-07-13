var fs = require('fs')
var readline = require('readline')
var logger = fs.createWriteStream('musicians.sql', {
    flags: 'a'
})

class Musicians {
    constructor(file){
        this.names = []
        this.file = file
        this.lineReader = readline.createInterface({input: fs.createReadStream(file)})

        this.run = this.run.bind(this)
        this.readLine = this.readLine.bind(this)
        this.mysql_real_escape_string = this.mysql_real_escape_string.bind(this)
    }
    
    run(callback){
        this.lineReader.on('line', this.readLine)
        this.lineReader.on('close', () => {
            console.log(`${this.names.length} names added !!`)
            callback(this.names)
        })
    }

    mysql_real_escape_string(str){
        return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function (char) {
            switch (char) {
                case "\0":
                    return "\\0";
                case "\x08":
                    return "\\b";
                case "\x09":
                    return "\\t";
                case "\x1a":
                    return "\\z";
                case "\n":
                    return "\\n";
                case "\r":
                    return "\\r";
                case "\"":
                case "'":
                case "\\":
                case "%":
                    return "\\"+char; // prepends a backslash to backslash, percent,
                    // and double/single quotes
            }
        })
    }

    readLine(line){
        if (!line) {
            return false
        } else {
            var name = line.split("  ")[0]
            console.log(name)
            this.names.push(this.mysql_real_escape_string(name))
        }
        
    }

}

var musicians
var readMusicians = new Musicians('musicians.txt')
readMusicians.run((musicians) => {
    for(var i = 0; i < musicians.length; i++){
        logger.write(`INSERT INTO Musicians (name) VALUES("${musicians[i]}");\n`)
    }
    logger.end()
})
