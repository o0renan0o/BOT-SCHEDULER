const date = require('date-and-time')
require('date-and-time/locale/pt');
date.locale('pt')
const fs = require('fs');

let old_json = fs.readFileSync('./date/dias_uteis.json');
let old_data = JSON.parse(old_json);
let raw_data = fs.readFileSync('./date/dias_uteis_2021.json');
let data = JSON.parse(raw_data);
const pattern = date.compile('ddd D MMM YYYY');

/**
 *     *    *    *    *    *    *
 ┬    ┬    ┬    ┬    ┬    ┬
 │    │    │    │    │    │
 │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
 │    │    │    │    └───── month (1 - 12)
 │    │    │    └────────── day of month (1 - 31)
 │    │    └─────────────── hour (0 - 23)
 │    └──────────────────── minute (0 - 59)
 └───────────────────────── second (0 - 59, OPTIONAL)
 */

let get_today_date = () => {
    let now = date.format(new Date(), 'D MMM YYYY'); // => Mar 3 2020
    return data.find(date => date.data.complete === now)
}

let get_today_time = () => {
    return date.format(new Date(), 'HH:mm'); // => 23:56
}

let convert = () => {
    let calendar = [];

    old_data.tbody.tr.forEach(date => {
        calendar.push({
            "data": regularize_sentence_convert_date(date.td[0]),
            "dia_util": date.td[2]["#text"],
            "feriado":  {
                "classification": date.td[3]["title"],
                "boolean": date.td[3]["#text"]
            }
        })
    })
    fs.writeFile('dias_uteis_2021.json', JSON.stringify(calendar), 'utf8', () => {
        log.log("OK")
    });
}
//Put accent out
let regularize_sentence_convert_date = text => {
    //Error treatment
    text = text.toLowerCase();
    text = text.replace(new RegExp('[ÁÀÂÃ]','gi'), 'a');
    text = text.replace(new RegExp('[ÉÈÊ]','gi'), 'e');
    text = text.replace(new RegExp('[ÍÌÎ]','gi'), 'i');
    text = text.replace(new RegExp('[ÓÒÔÕ]','gi'), 'o');
    text = text.replace(new RegExp('[ÚÙÛ]','gi'), 'u');
    text = text.replace(new RegExp('[Ç]','gi'), 'c');
    text = text.replace(new RegExp('[?!.[{};/,]','gi'), '');

    let words = text.trim().split(" ")

    //Get dates
    let day = words[1];
    let week = (() => {
        let in_date = words[0].charAt(0).toUpperCase();
        let x = `${in_date}${words[0].slice(1, 3)}`
        return x
    })();
    let month = (() => {
        let in_date = words[2].charAt(0).toUpperCase()
        return in_date + words[2].trim().slice(1, 3)
    })();
    let year = words[3];
    let treated_date = `${day} ${month} ${year}`

    return {
        dia: day,
        mes: month,
        ano: year,
        complete: treated_date,
        complete_format: date.parse(treated_date, 'D MMM YYYY')
    }; // => Mar 3 2020
};

module.exports = {
    get_today_date,
    get_today_time,
    convert
}