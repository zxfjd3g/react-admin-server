const jwt = require("jsonwebtoken");

const { SECRET } = require("../config");

/**
 * 派发签名（加密用户数据，生成token）
 * @param {any} payload 用户数据
 */
function sign(payload) {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, SECRET, { expiresIn: "7d" }, (err, token) => {
    // jwt.sign(payload, SECRET, { expiresIn: 2 }, (err, token) => {
      if (err) {
        reject(err);
        return;
      }
      // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwicGFzc3dvcmQiOiI0Mjk3ZjQ0YjEzOTU1MjM1MjQ1YjI0OTczOTlkN2E5MyIsImlhdCI6MTU3NjY1MDI0NiwiZXhwIjoxNTc3MjU1MDQ2fQ.mmgO9X0DPR1s8d90-VIo5DsMhInE71VfTJ97NrM_3lU
      resolve(token);
    });
  });
}

/**
 * 验证签名(对jwt加密后的token进行解密)
 * @param {string} token jwt加密后的token
 */
function verify(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(decoded);
    });
  });
}

module.exports = {
  sign,
  verify
};
