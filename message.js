var moment = require('./moment');

var generateMessage = (from, body) => {
  return {
      from,
      body,
      createdAt: moment().format('HH:mm')  //valueOf() //new Date().getTime()
    }
}

module.exports = {generateMessage}
