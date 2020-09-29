require('chromedriver');
const {until} = require("selenium-webdriver");
const {By, Key} = require("selenium-webdriver");
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const {get_today_date, get_today_time} = require('../date/date_treatment');
const send_email = require('../mail/email_service')
const date = require('date-and-time');
require('date-and-time/locale/pt');
date.locale('pt')


async function avoid_same_minute_and_wait(ponto_list, log) {
    let right_list = get_just_interest_in_list(ponto_list)
    let possible_min_to_use = [0,1,2,3,4,5,6]
    right_list.forEach((ponto, index) => {
        let minutes = Number(ponto.time.split(":")[1])
        if (possible_min_to_use.includes(minutes)){
            possible_min_to_use.splice(possible_min_to_use.indexOf(minutes), 1)
        }
    })
    await sleep(possible_min_to_use[Math.floor(Math.random() * possible_min_to_use.length)], log)
        .then();
}

module.exports = async (hour, log) => {

    let json_date = get_today_date()
    if (json_date.dia_util === "0") return {title: false}// 0 is not work day return false

    let options = new chrome.Options();

    //options.addArguments('--headless');
    options.addArguments('--disable-gpu');
    options.addArguments('--no-sandbox');

    let driver = new webdriver.Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    let user = encodeURI("ctis\\"+ process.env.PONTO_LOGIN.toString())
    let pass = encodeURI(process.env.EMAIL_PASS.toString())
    driver.get('https://' + user + ':' + pass + '@' + process.env.PONTO_WEBPAGE.toString())


    //Bater ponto pelo horário
    await driver.findElement(By.id("createNewPoint")).click();
    let ponto_list = await get_list(driver);

    //let total = await driver.findElement(By.id("NormalTotal")).getAttribute("value");
    try{
        //await avoid_same_minute_and_wait(ponto_list, log);
    }catch (e) {
        log.log("Wait Error... Proceeding with script !")
    }


    try {
        switch (hour) {
            case 9:
                return await bater_inicio_dia(driver, ponto_list, log)
            case 12:
                return await bater_almoco(driver, ponto_list, log)
            case 13:
                return await bater_volta_almoco(driver, ponto_list, log)
            case 18:
                return await bater_fim_dia(driver, ponto_list, log)
            default:
                return { title: false}
        }
    } catch (e) {
        driver.quit()
        return e
    }
}

async function get_list(driver) {
    let list = await driver.findElements(By.css('#hourPointTableBody tr'));

    let ponto_list = [];
    for (const element of list) {
        await element.getText().then(function (text) {
            text = text.split(" ")
            ponto_list.push({
                "ponto": text[0],
                "time": text[1],
                "status": text[2]
            })
        });
    }
    return ponto_list;
}

function sleep(min, log) {
    let ms = milliseconds(min)
    log.log("Vamos esperar só : "+ min + " minutos!")
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let milliseconds = min => {
    return ((min * 60) * 1000);
}

function millisToMinutesAndSeconds(millis) {
    let minutes = Math.floor(millis / 60000);
    let seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


function sum_if_find_in_list(ponto_list) {
    let len = ponto_list.reduce((a, b) => {
        if (b.ponto === "Ponto" || b.ponto === "Intervalo") return ++a
        return a
    }, 0)
    return len;
}

function get_just_interest_in_list(ponto_list) {
    let right_list = [];
    ponto_list.forEach(b => {
        if (b.ponto === "Ponto" || b.ponto === "Intervalo") return right_list.push(b)
    })
    return right_list;
}

let bater_inicio_dia = async (driver, ponto_list, log) => {
    log.log("Ponto inicial !" + get_today_time())
    let sum_result_ponto_list = sum_if_find_in_list(ponto_list);
    if (sum_result_ponto_list > 0){
        driver.close()
        return { title: true, message: "Ponto Já Existe !"}
    }

    return await validate_and_save(driver, "pointImage"); // "pointImage" click the button
}

let bater_almoco = async (driver, ponto_list, log) => {
    log.log("Saída para almoço " + get_today_time())
    let sum_result_ponto_list = sum_if_find_in_list(ponto_list);
    if (sum_result_ponto_list === 3){
        log.log("Ponto Já Existe !")
        driver.close()
        return { title: true, message: "Ponto Já Existe !"}
    }
    return await validate_and_save(driver, "mealImage"); // "mealImage" click the button
}

let bater_volta_almoco = async (driver, ponto_list, log) => {
    log.log("Volta do almoço " + get_today_time())
    let sum_result_ponto_list = sum_if_find_in_list(ponto_list);
    if (sum_result_ponto_list === 5){
        log.log("Ponto Já Existe !")
        driver.close()
        return { title: true, message: "Ponto Já Existe !"}
    }
    return await validate_and_save(driver, "mealImage"); // "mealImage" click the button
}

let bater_fim_dia = async (driver, ponto_list, log) => {
    log.log("Fim do dia ! " + get_today_time())
    let sum_result_ponto_list = sum_if_find_in_list(ponto_list);
    if (sum_result_ponto_list >= 6) {
        log.log("Ponto Já Existe !")
        driver.close()
        return { title: true, message: "Ponto Já Existe !"}
    }
    return await validate_and_save(driver, "pointImage"); // "pointImage" click the button
}

async function validate_and_save(driver, action) {
    try {
        await driver.findElement(By.id(action)).click();
        await driver.findElement(By.id("Save")).click();
        await new Promise((resolve) => {
            setTimeout(resolve, 4000);
        });
        driver.close()
        return {title: true, message: "Ponto Batido !"}
    } catch (e) {
        driver.close()
        return {title: false, message: "Erro no ponto !"}
    }
    // let dialog = await driver.findElement(By.id("simple-message-dialog"));
    // if (dialog) return { title: true, message: "Ponto Batido !"}
    // return { title: false, message: "Erro no ponto !"}
}
