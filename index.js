const {job_one, convert} = require('./job/job');
const {scheduler} = require('./scheduler/scheduler');
require('dotenv').config();

const blessed = require('blessed')
    , contrib = require('blessed-contrib')
    , screen = blessed.screen();

let grid = new contrib.grid({rows: 10, cols: 4, screen: screen})

let log = grid.set(5, 0, 5, 4, contrib.log,
    { fg: "green"
        , selectedFg: "green"
        , label: 'Bot Log'});


const pic_show = () => {
    let pic = grid.set(0, 0, 5, 4, contrib.picture,
        {
            file: './bot.png',
            cols: 25,
            label: 'Bot 1.0',
            onReady: ready
        })
    screen.on('resize', function() {
        pic.emit('attach');
        log.emit('attach')
    });
    log.log("Bot is up !")
    function ready() {screen.render()}
}


// Start Bot
( () => {
    pic_show();
    scheduler(log)
})();

module.exports = {
    job_one
}