const crypto = require("crypto");

const { SECRET } = require("../config");

// 加密
function md5(password, salt = SECRET) {
  return crypto
    .createHmac("md5", salt) // 加盐
    .update(password, "utf8") // 加密
    .digest("hex"); // 转换16进制
}

module.exports = md5;
