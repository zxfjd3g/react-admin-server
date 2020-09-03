/*
  所有服务器和数据库的配置
 */
const isDev = process.env.NODE_ENV === "development";

// mongodb的配置
const MONGO_CONFIG = {
  port: 27017,
  host: "localhost",
  database: "react_admin",
};
// 服务器配置
let SERVER_CONFIG = {
  port: 80,
  host: "0.0.0.0",
};

if (isDev) {
  SERVER_CONFIG = {
    port: 5000,
    host: "localhost",
  };
}

// 手机号oauth
const PHONE_URL = "http://139.196.108.241:8080/Api/HttpSendSMYzm.ashx";
const ACCOUNT = 17688317990;
const PSWD = "Xiongjian2020";

// github oauth
const CLIENT_ID = "1758351dca38ad311ec7";
const CLIENT_SECRET = "c4064cfc4238f33d3bda011dd8621755f6240256";

// 七牛云配置
const ACCESS_KEY = "E7nFXkXGiqs5RxkOPFOGprfPN2SyyNDkwyk4CdLn";
const SECRET_KEY = "aFgqIUxJhkDrWyDaqxfOF9a67hEQi0GmqVzlJ8QC";
const BUCKET = "atguigu-200317"; // 对象存储的标识名称
const EXPIRES = 7200; //7200秒

const SECRET = "Zrrf2mvs^sD@xquG";

const SAFE_PATHS = ["/admin/acl/index/login"];

module.exports = {
  MONGO_CONFIG,
  SERVER_CONFIG,
  SECRET,
  SAFE_PATHS,

  ACCESS_KEY,
  SECRET_KEY,
  BUCKET,
  EXPIRES,

  CLIENT_ID,
  CLIENT_SECRET,

  PHONE_URL,
  ACCOUNT,
  PSWD,
};
