/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const axios = require("axios");
const dayjs = require("dayjs");
const md5 = require("md5");
const { SuccessModal, ErrorModal } = require("../model");
const {
  CLIENT_ID,
  CLIENT_SECRET,
  PHONE_URL,
  PSWD,
  ACCOUNT,
} = require("../config");

const { sign, verify } = require("../utils/jwt");

const Users = require("../db/models/acl/users");

const Router = express.Router;
const router = new Router();

/*
 * @api {get} /oauth/redirect github oauth 登陆
 * @apiDescription github oauth 登陆
 * @apiName oauth
 * @apiGroup oauth: github oauth 登陆
 * @apiParam {Number} code 授权码
 * @apiSuccess {Object} data
 * @apiSampleRequest http://localhost:5000/oauth/redirect
 * @apiVersion 1.0.0
 */
router.get("/oauth/redirect", async (req, res) => {
  try {
    // 获取到了授权码 code
    const { code } = req.query;
    // 接着去请求令牌 token
    const tokenResponse = await axios({
      method: "post",
      url: `https://github.com/login/oauth/access_token`,
      data: {
        client_id: CLIENT_ID, // 固定不变
        client_secret: CLIENT_SECRET, // 固定不变，只在服务器保存，安全性更高
        code, // 上一步返回的code
      },
      headers: {
        accept: "application/json",
      },
    });
    // 得到用户token（类似于我们得到了用户登陆github的token了）
    const accessToken = tokenResponse.data.access_token;
    console.log(accessToken); // 1928a75941bbdae194d4935d2f1be893cf37a31c

    // 有了token，就有了访问用户信息权限的token
    // 根据token请求用户数据
    const { data } = await axios({
      method: "get",
      url: "https://api.github.com/user",
      headers: {
        accept: "application/json",
        Authorization: `token ${accessToken}`,
      },
    });

    const user = await Users.findOne({ username: data.login });

    let token;

    if (!user) {
      token = await sign({ id: data.id });

      await Users.create({
        username: data.login,
        avatar: data.avatar_url,
        nickName: data.name || '硅谷fans',
        password: data.node_id,
        token: token,
        roleId: "5e7c6d21b3071d0e44c8b231", // 假设都是管理员用户～
      });
    } else {
      // console.log(user);

      try {
        token = user.token;
        await verify(user.token);
      } catch {
        token = await sign({ id: user.id });
        user.token = token;
        await user.save();
      }
    }

    // 将得到的用户数据返回到页面上~
    res.redirect(`http://localhost:3000/oauth?token=${token}`);
  } catch (e) {
    console.log(e);
  }
});

/**
 * @api {post} /oauth/sign_in/digits 发送验证码
 * @apiDescription digits 发送验证码
 * @apiName digits
 * @apiGroup login 登陆
 * @apiParam {Number} mobile 手机号
 * @apiSuccess {Object} data
 * @apiSampleRequest http://localhost:5000/oauth/sign_in/digits
 * @apiVersion 1.0.0
 */
router.post("/oauth/sign_in/digits", async (req, res) => {
  const { mobile } = req.body;

  const verify_code = getVerifyCode(6);
  // https://www.shmiaosai.com/support/cate-60.html

  const ts = dayjs().format("YYYYMMDDHHmmss");

  const pswd = md5(ACCOUNT + PSWD + ts);

  const { data } = await axios({
    method: "get",
    url: PHONE_URL,
    params: {
      account: ACCOUNT,
      pswd,
      mobile,
      ts,
      msg: getMsg(verify_code),
      sms_sign: "秒赛云",
    },
  });

  const user = await Users.findOne({ username: mobile });

  if (!user) {
    await Users.create({
      username: mobile,
      password: pswd,
      roleId: "5e7c6d21b3071d0e44c8b231",
      code: verify_code,
      expires: Date.now(),
      nickName: mobile,
    });
  } else {
    user.code = verify_code;
    user.expires = Date.now();
    await user.save();
  }

  console.log(data);
  console.log(verify_code);

  res.json(new SuccessModal({}));
});

function getVerifyCode(len = 6) {
  let verify_code = "";
  for (let i = 0; i < len; i++) {
    verify_code += Math.floor(Math.random() * 10);
  }
  return verify_code;
}

function getMsg(verify_code) {
  return `您正在登陆硅谷教育管理系统，验证码：${verify_code}（30分钟内有效），如非本人操作，请忽略此短信。`;
}

const EXPIRES = 30 * 60 * 1000;

/**
 * @api {post} /oauth/mobile 手机号登陆
 * @apiDescription mobile 手机号登陆
 * @apiName mobile
 * @apiGroup login 登陆
 * @apiParam {Number} mobile 手机号
 * @apiParam {Number} code 验证码
 * @apiSuccess {Object} data
 * @apiSampleRequest http://localhost:5000/oauth/mobile
 * @apiVersion 1.0.0
 */
router.post("/oauth/mobile", async (req, res) => {
  const { mobile, code } = req.body;

  const user = await Users.findOne(
    { username: mobile },
    { password: 0, __v: 0 }
  );

  if (user.expires + EXPIRES > Date.now() && code == user.code) {
    let token;
    try {
      token = user.token;
      // 登录成功
      if (!token) {
        // 签发签名
        token = await sign({ id: user.id });
        // 存在数据库中
        user.token = token;
        await user.save();
      } else {
        await verify(token);
      }
    } catch {
      token = await sign({ id: user.id });
      // 存在数据库中
      user.token = token;
      await user.save();
    }

    res.json(new SuccessModal({ data: { token } }));
  } else {
    res.json(new ErrorModal({ message: "验证码无效～" }));
  }
});

module.exports = router;
