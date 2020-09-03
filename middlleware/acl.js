const { verify } = require("../utils/jwt");
const { SAFE_PATHS } = require("../config");
const Users = require("../db/models/acl/users");

module.exports = async (req, res, next) => {
  try {
    // 白名单内不要验证token
    const url = req.url;
    if (SAFE_PATHS.indexOf(url) >= 0) {
      next();
      return;
    }

    // 验证是否有效且没有过期
    const { token } = req.headers;
    await verify(token);

    const result = await Users.findOne({ token });

    if (!result) {
      throw "error";
    }

    next();
  } catch (e) {
    res.status(401).send("token无效或者过期");
  }
};
