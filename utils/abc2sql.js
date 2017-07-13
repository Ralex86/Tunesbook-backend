var fs = require('fs')
var readline = require('readline')

var logger = fs.createWriteStream('tunebook.sql', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})

class Abc2sql {
    constructor(file,startId){
        this.tunes = []
        this.currentId = startId
        this.file = file
        this.lineReader = readline.createInterface({input: fs.createReadStream(file)})

        this.inHeader = this.inHeader.bind(this)
        this.run = this.run.bind(this)
        this.readLine = this.readLine.bind(this)
        this.addslashes = this.addslashes.bind(this)
    }

    addslashes(str){
        return (str + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0')
    }

    inHeader(line){
        return (
            line[0] + line[1] != "P:"
            && line[0].charCodeAt(0) >= "A".charCodeAt(0)
            && line[0].charCodeAt(0) <= "Z".charCodeAt(0)
            && line[1] === ":"
        )
    }

    run(callback){
        this.lineReader.on('line', this.readLine)
        this.lineReader.on('close', () => {
            console.log(`${this.tunes.length} tunes added !!`)
            callback(this.tunes)
        })
    }

    readLine(line){
        //order matter because we have to check if line is not undefined
        //inHeader crash if line is undef

        if(!line) {return false}
        var header = this.inHeader(line)
        if(0 === this.currentId && !header) {return false}

        if (header){
            var field = line[0]
            var fieldValue = line.split(":").splice(1)

            if (field === "X"){
                this.currentId = Number(fieldValue)
                this.tunes[this.currentId -1] = {}
                this.tunes[this.currentId -1].X = this.currentId
                this.tunes[this.currentId -1].body = ""
            } else {
                if (field === "T"){
                    this.tunes[this.currentId -1][field] = (this.tunes[this.currentId -1][field]) ? this.tunes[this.currentId -1][field] + this.addslashes(fieldValue) + '\n' : this.addslashes(fieldValue) + '\n'
                } else {
                    this.tunes[this.currentId -1][field] = fieldValue
                }
            }
        } else { 
            this.tunes[this.currentId -1].body += this.addslashes(line) + '\n'
        }
    }
}

var tunebook
var readTunes = new Abc2sql('tunebook.abc', 0)

// Lets the fun begin

readTunes.run((tunebook) => {
for(var i = 0; i < tunebook.length; i++){
// T, R, M, K, body
logger.write(`
INSERT INTO Jigs (T,R,M,K,body) VALUES(
"${tunebook[i].T}",
"${tunebook[i].R}",
"${tunebook[i].M}",
"${tunebook[i].K}",
"${tunebook[i].body}");\n`)
}
    logger.end()
})
