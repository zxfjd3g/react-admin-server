/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const Users = require("../../db/models/acl/users");
const Roles = require("../../db/models/acl/roles");
const Permissions = require("../../db/models/acl/permissions");
const { SuccessModal, ErrorModal } = require("../../model");
const md5 = require("../../utils/md5");
const { sign, verify } = require("../../utils/jwt");

const Router = express.Router;

const router = new Router();

/**
 * @api {post} /admin/acl/index/login 用户登录
 * @apiDescription 用户登录
 * @apiName login
 * @apiGroup index-controller: 后台登录与权限管理
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 * @apiSuccess {String} token 权限令牌
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *          "token" : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlN2Q1YWQ0MDA0YjM2MGM5YzhkN2IwZiIsImlhdCI6MTU4NjA5OTg3NywiZXhwIjoxNTg2NzA0Njc3fQ.B-N-xZXgxA_LOmEAJ0ZTYmXPt89KRGo0ZSjvwx9dhog",
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/index/login
 * @apiVersion 1.0.0
 */
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await Users.findOne({ username });

  if (!user) {
    res.json(new ErrorModal({ message: "用户名找不到" }));
    return;
  }

  if (md5(password, user.salt) !== user.password) {
    res.json(new ErrorModal({ message: "密码错误" }));
    return;
  }
  
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
      await verify(user.token);
    }
  } catch {
    token = await sign({ id: user.id });
    // 存在数据库中
    user.token = token;
    await user.save();
  }

  // 返回响应
  res.json(new SuccessModal({ data: { token } }));
});

/**
 * @api {post} /admin/acl/index/logout 用户登出
 * @apiDescription 用户登出
 * @apiName logout
 * @apiGroup index-controller: 后台登录与权限管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/index/logout
 * @apiVersion 1.0.0
 */
router.post("/logout", async (req, res) => {
  const { token } = req.headers;

  await Users.updateOne({ token }, { $set: { token: "" } });

  // 注册失败返回失败的数据
  res.json(new SuccessModal({}));
});

/**
 * @api {get} /admin/acl/index/info 查询用户信息
 * @apiDescription 查询用户信息
 * @apiName info
 * @apiGroup index-controller: 后台登录与权限管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccess {String} name 用户名
 * @apiSuccess {String} avatar 用户头像
 * @apiSuccess {String[]} permissionValueList 用户按钮权限列表
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *        "name":" "admin",
 *        "avatar": "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
 *        "permissionValueList": ["user.add", "user.update", "user.remove", "user.assign"]
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/index/info
 * @apiVersion 1.0.0
 */
router.get("/info", async (req, res) => {
  const { token } = req.headers;

  try {
    const user = await Users.findOne(
      { token },
      { nickName: 1, avatar: 1, roleId: 1, _id: 0 }
    );

    const role = await Roles.findById(
      { _id: user.roleId },
      { remark: 1, permissionId: 1, _id: 0 }
    );

    const permissionValueList = await Permissions.find(
      { _id: { $in: role.permissionId } },
      { permissionValue: 1, _id: 0 }
    );

    const result = {
      name: user.nickName,
      avatar: user.avatar,
      // roles: [role.remark],
      permissionValueList: permissionValueList
        .map((item) => item.permissionValue)
        .filter(Boolean),
    };

    // 返回响应
    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    res.json(new ErrorModal({ message: JSON.stringify(e) }));
  }
});

function filterKeys({ path, component, children, icon, name, level }) {
  return {
    path,
    component,
    name,
    icon,
    redirect: children ? path + children[0].path : "noredirect",
    children,
    hidden: level === 4 ? true : false,
  };
}

function composeMenus(permissions) {
  const permissionObj = permissions.reduce(
    (allItems, item) => {
      if (item.level === 1) return allItems;
      allItems[item.level].push(item);
      return allItems;
    },
    { 2: [], 3: [], 4: [] }
  );

  const arr2 = permissionObj[2];
  const arr3 = permissionObj[3];
  const arr4 = permissionObj[4];

  for (let i = 0; i < arr2.length; i++) {
    const item2 = arr2[i];
    for (let j = 0; j < arr3.length; j++) {
      const item3 = arr3[j];
      if (item3.pid === item2._id) {
        if (item2.children) {
          item2.children.push(filterKeys(item3));
        } else {
          item2.children = [filterKeys(item3)];
        }

        for (let k = 0; k < arr4.length; k++) {
          const item4 = arr4[k];
          if (item4.pid === item3._id) {
            item2.children.push(filterKeys(item4));
            arr4.splice(k, 1);
            k--;
          }
        }
      }
    }
    arr2[i] = filterKeys(item2);
  }

  return arr2;
}

/**
 * @api {get} /admin/acl/index/menu 查询用户菜单
 * @apiDescription 查询用户菜单
 * @apiName menu
 * @apiGroup index-controller: 后台登录与权限管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccess {Object[]} permissionList 用户路由权限列表
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *        "permissionList": [{}]
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/index/menu
 * @apiVersion 1.0.0
 */
router.get("/menu", async (req, res) => {
  const { token } = req.headers;

  try {
    const user = await Users.findOne(
      { token },
      { nickName: 1, avatar: 1, roleId: 1, _id: 0 }
    );

    const role = await Roles.findById(
      { _id: user.roleId },
      { remark: 1, permissionId: 1, _id: 0 }
    );

    let permissions = await Permissions.find(
      {
        _id: { $in: role.permissionId },
      },
      { __v: 0, gmtCreate: 0, gmtModified: 0, deleted: 0, type: 0, status: 0 }
    );

    permissions = JSON.parse(JSON.stringify(permissions));
    const result = composeMenus(permissions);

    // 返回响应
    res.json(new SuccessModal({ data: { permissionList: result } }));
  } catch (e) {
    console.log(e);

    res.json(new ErrorModal({ message: JSON.stringify(e) }));
  }
});

module.exports = router;
