/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const { execSync } = require("child_process");
const path = require("path");
const { SuccessModal, ErrorModal } = require("../model");

const Router = express.Router;
const router = new Router();

/**
 * @api {get} /reset 重置数据
 * @apiDescription 重置数据
 * @apiName reset
 * @apiGroup reset: 重置数据
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/reset
 * @apiVersion 1.0.0
 */
router.get("/reset", (req, res) => {
  try {
    const pathname = path.resolve(__dirname, "../test/index.js");
    execSync(`node ${pathname}`);
    res.json(
      new SuccessModal({
        data: {},
      })
    );
  } catch (e) {
    res.json(
      new ErrorModal({
        message: e,
      })
    );
  }
});

module.exports = router;
