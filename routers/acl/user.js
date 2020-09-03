/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const Users = require("../../db/models/acl/users");
const Roles = require("../../db/models/acl/roles");
const { SuccessModal, ErrorModal } = require("../../model");
const md5 = require("../../utils/md5");
const { filterPassword } = require("../../utils/tools");

const Router = express.Router;
const router = new Router();

const filter = {
  password: 0,
  __v: 0,
  token: 0,
  salt: 0,
  deleted: 0,
  roleId: 0,
};

/**
 * @api {post} /admin/acl/user/save 添加用户
 * @apiDescription 添加用户
 * @apiName save
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} nickName 昵称
 * @apiParam {String} salt 可选, 加盐
 * @apiParam {String} avatar 可选, 用户头像
 * @apiSuccess {Object} data 用户数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
  const body = req.body;

  try {
    const result = await Users.create({
      ...body,
      password: md5(body.password, body.salt),
    });

    // 注册成
    res.json(new SuccessModal({ data: filterPassword(result) }));
  } catch (e) {
    // 注册失败
    res.json(new ErrorModal({ message: "用户名已存在" }));
  }
});

/**
 * @api {get} /admin/acl/user/get/:id 根据id获取用户数据
 * @apiDescription 根据id获取用户数据
 * @apiName get
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 用户id
 * @apiSuccess {Object} data 用户数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/get/:id
 * @apiVersion 1.0.0
 */
router.get("/get/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findById(
      {
        _id: id,
      },
      filter
    );

    res.json(new SuccessModal({ data: user }));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {delete} /admin/acl/user/remove/:id 删除单个用户
 * @apiDescription 删除单个用户
 * @apiName remove
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 用户id
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/remove/:id
 * @apiVersion 1.0.0
 */
router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Users.findByIdAndDelete({
      _id: id,
    });

    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {delete} /admin/acl/user/batchRemove 批量删除用户
 * @apiDescription 批量删除用户
 * @apiName batchRemove
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String[]} idList 用户id列表
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/batchRemove
 * @apiVersion 1.0.0
 */
router.delete("/batchRemove", async (req, res) => {
  const { idList } = req.body;

  try {
    for (let i = 0; i < idList.length; i++) {
      const id = idList[i];

      await Users.findByIdAndDelete({
        _id: id,
      });
    }
    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {put} /admin/acl/user/update 更新用户
 * @apiDescription 更新用户
 * @apiName update
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 用户id
 * @apiParam {String} username 用户名
 * @apiParam {String} password 密码
 * @apiParam {String} nickName 昵称
 * @apiParam {String} salt 可选, 加盐
 * @apiParam {String} avatar 可选, 用户头像
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
  const body = req.body;
  console.log(body);

  try {
    const user = await Users.findById({
      _id: body.id,
    });
    for (const key in body) {
      if (body.hasOwnProperty(key)) {
        const value = body[key];
        if (key === "password") {
          user[key] = md5(value, body.salt || user.salt);
        }
        user[key] = value;
      }
    }
    user.gmtModified = new Date().toLocaleString();
    await user.save();

    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: JSON.stringify(e) }));
  }
});

/**
 * @api {get} /admin/acl/user/:page/:limit 获取用户分页列表
 * @apiDescription 获取用户分页列表
 * @apiName page
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {Number} page 当前页码
 * @apiParam {Number} limit 每页数量
 * @apiParam {String} nickName 可选, 昵称
 * @apiParam {String} username 可选, 用户名
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Object[]} items 用户列表分页数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *        "total": 100,
 *        "items": [{}, {}]
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/:page/:limit
 * @apiVersion 1.0.0
 */
router.get("/:page([0-9]+)/:limit", async (req, res) => {
  const { page, limit } = req.params;
  const { username, nickName } = req.query;

  try {
    const conditions = {
      username: new RegExp(username),
      nickName: new RegExp(nickName),
    };

    const skip = (page - 1) * limit;

    const total = await Users.countDocuments(conditions);

    const items = await Users.find(conditions, filter, { limit: +limit, skip });

    res.json(
      new SuccessModal({
        data: {
          total,
          items,
        },
      })
    );
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {post} /admin/acl/user/doAssign 给用户分配角色
 * @apiDescription 给用户分配角色
 * @apiName doAssign
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} userId 用户id
 * @apiParam {String} roleId 角色id
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/doAssign
 * @apiVersion 1.0.0
 */
router.post("/doAssign", async (req, res) => {
  const { userId, roleId } = req.body;
  try {
    await Users.findByIdAndUpdate(
      { _id: userId },
      {
        $set: {
          roleId,
        },
      }
    );
    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {get} /admin/acl/user/toAssign/:id 查询用户的角色数据
 * @apiDescription 查询用户的角色数据（自己所属角色数据和所有角色数据）
 * @apiName toAssign
 * @apiGroup user-admin-controller: 用户管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 用户id
 * @apiSuccess {Object} assignRoles 当前用户的角色数据
 * @apiSuccess {Object[]} allRolesList 所有角色列表数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *        "assignRoles": {},
 *        "allRolesList": [{}, {}]
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/user/toAssign/:id
 * @apiVersion 1.0.0
 */
router.get("/toAssign/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { roleId } = await Users.findById({ _id: id }, { roleId: 1 });

    const roles = await Roles.find({}, { deleted: 0, __v: 0 });

    res.json(
      new SuccessModal({
        data: {
          assignRoles: roles.find((role) => role._id == roleId), // 不能全等
          allRolesList: roles,
        },
      })
    );
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

module.exports = router;
