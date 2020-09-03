/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const Roles = require("../../db/models/acl/roles");
const { SuccessModal, ErrorModal } = require("../../model");

const Router = express.Router;
const router = new Router();

const filter = {
  __v: 0,
  deleted: 0,
};

/**
 * @api {post} /admin/acl/role/save 添加角色
 * @apiDescription 添加角色
 * @apiName save
 * @apiGroup role-admin-controller: 角色管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} roleName 角色名称
 * @apiParam {String} remark 角色昵称
 * @apiSuccess {Object} data 角色数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/role/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
  const body = req.body;

  try {
    const result = await Roles.create(body);
    // 注册成功
    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    // 注册失败
    res.json(new ErrorModal({ message: "roleName已存在" }));
  }
});

/**
 * @api {get} /admin/acl/role/get/:id 根据id获取角色数据
 * @apiDescription 根据id获取角色数据
 * @apiName get
 * @apiGroup role-admin-controller: 角色管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 角色id
 * @apiSuccess {Object} data 角色数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/role/get/:id
 * @apiVersion 1.0.0
 */
router.get("/get/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const role = await Roles.findById(
      {
        _id: id,
      },
      filter
    );

    res.json(new SuccessModal({ data: role }));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {delete} /admin/acl/role/remove/:id 删除单个角色数据
 * @apiDescription 删除单个角色数据
 * @apiName remove
 * @apiGroup role-admin-controller: 角色管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 角色id
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/role/remove/:id
 * @apiVersion 1.0.0
 */
router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Roles.findByIdAndDelete({
      _id: id,
    });

    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {delete} /admin/acl/role/batchRemove 批量删除多个角色数据
 * @apiDescription 批量删除多个角色数据
 * @apiName batchRemove
 * @apiGroup role-admin-controller: 角色管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String[]} idList 角色id列表
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/role/batchRemove
 * @apiVersion 1.0.0
 */
router.delete("/batchRemove", async (req, res) => {
  const { idList } = req.body;

  try {
    for (let i = 0; i < idList.length; i++) {
      const id = idList[i];

      await Roles.findByIdAndDelete({
        _id: id,
      });
    }
    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {put} /admin/acl/role/update 更新角色数据
 * @apiDescription 更新角色数据
 * @apiName update
 * @apiGroup role-admin-controller: 角色管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} roleName 角色名称
 * @apiParam {String} remark 角色昵称
 * @apiParam {String} id 角色id
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/role/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
  const body = req.body;

  try {
    let role = await Roles.findByIdAndUpdate(
      {
        _id: body.id,
      },
      {
        $set: {
          ...body,
          gmtModified: new Date().toLocaleString(),
        },
      }
    );

    role = role.toObject();

    delete role.__v;
    delete role.deleted;

    res.json(new SuccessModal({ data: role }));
  } catch (e) {
    console.log(e);

    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {get} /admin/acl/role/:page/:limit 获取角色分页列表
 * @apiDescription 获取角色分页列表
 * @apiName page
 * @apiGroup role-admin-controller: 角色管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {Number} page 当前页码
 * @apiParam {Number} limit 每页数量
 * @apiParam {String} roleName 可选, 角色名称
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Object[]} items 角色列表分页数据
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
 * @apiSampleRequest http://localhost:5000/admin/acl/role/:page/:limit
 * @apiVersion 1.0.0
 */
router.get("/:page/:limit", async (req, res) => {
  const { page, limit } = req.params;
  const { roleName } = req.query;

  try {
    const conditions = {
      roleName: new RegExp(roleName),
    };

    let skip = 0;
    let limitOptions = { skip };

    if (limit !== 0) {
      skip = (page - 1) * limit;
      limitOptions.limit = +limit;
    }

    const total = await Roles.countDocuments(conditions);
    const items = await Roles.find(conditions, filter, limitOptions);

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

module.exports = router;
