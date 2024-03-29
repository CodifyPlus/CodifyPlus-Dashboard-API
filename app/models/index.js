const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.service = require("./service.model");
db.template = require("./template.model");
db.chatBox = require("./chatBox.model");
db.notificationBox = require("./notifications.model");

db.ROLES = ["USER", "ADMIN", "MODERATOR"];

module.exports = db;