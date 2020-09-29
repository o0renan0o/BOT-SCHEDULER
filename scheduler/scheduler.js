const schedule = require('node-schedule');
const cron = require('node-cron');
const open_browser = require('../job/job')
const shell = require('shelljs');
const notification = require('../notification/windows')
const date = require('date-and-time');
require('date-and-time/locale/pt');
date.locale('pt')

let punching_the_clock = [9, 12, 13, 18]

// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *

let scheduler = (log) => {
    cron.schedule('1 * * * *', () => {

        try{
            let hour = Number(date.format(new Date(), 'H'));
            if (!hour) throw new Error('Error getting hour !');
            if (punching_the_clock.includes(hour)) {

                open_browser(hour, log)
                    .then(r => {
                        if (r.title) notification("Ponto", r.message)
                    })
                    .catch(e => notification("Ponto Error", e.message))
            }
        }catch (e) {
            log.log(e.message)
        }


    }, {
        scheduled: true,
        timezone: "America/Sao_Paulo"
    });
}

module.exports = {
    scheduler
}