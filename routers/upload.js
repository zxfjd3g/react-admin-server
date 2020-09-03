/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const qiniu = require("qiniu");

const { ACCESS_KEY, SECRET_KEY, BUCKET, EXPIRES } = require("../config");

const { SuccessModal, ErrorModal } = require("../model");

const Router = express.Router;
const router = new Router();

/**
 * @api {get} /uploadtoken 获取七牛云上传凭据
 * @apiDescription 获取七牛云上传凭据
 * @apiName uploadtoken
 * @apiGroup uploadtoken: 七牛云管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccess {String} uploadToken 上传凭证
 * @apiSuccess {Number} expires 过期时间
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {"uploadToken": "", "expires": ""},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/uploadtoken
 * @apiVersion 1.0.0
 */
router.get("/uploadtoken", (req, res) => {
	try {
		const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
		const putPolicy = new qiniu.rs.PutPolicy({
			scope: BUCKET,
			expires: EXPIRES, // 指定凭证过期时间
		});
		const uploadToken = putPolicy.uploadToken(mac);

		console.log(uploadToken);
		// 默认过期时间2小时～
		res.json(
			new SuccessModal({
				data: {
					uploadToken,
					expires: EXPIRES,
				},
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
