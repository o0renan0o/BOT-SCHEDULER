const notifier = require('node-notifier');

module.exports = (title, message) => {
// Object
    notifier.notify({
        title: title,
        message: message
    });
}
