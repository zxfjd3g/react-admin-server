/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const Permissions = require("../../db/models/acl/permissions");
const Roles = require("../../db/models/acl/roles");
const { SuccessModal, ErrorModal } = require("../../model");

const Router = express.Router;
const router = new Router();

const filter = {
  __v: 0,
  deleted: 0,
};

/**
 * @api {post} /admin/acl/permission/save 新增菜单
 * @apiDescription 新增菜单
 * @apiName save
 * @apiGroup permission-admin-controller: 菜单管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} name 菜单名称
 * @apiParam {String} path 可选, 菜单访问路径
 * @apiParam {String} pid 父级菜单id
 * @apiParam {Number=1,2} type 菜单类型(1: 菜单 2: 按钮)
 * @apiParam {Number=1,2,3,4} level 菜单等级
 * @apiParam {String} icon 可选, 菜单图标
 * @apiParam {String} permissionValue 可选, 菜单权限值
 * @apiSuccess {Object} data 新建的菜单
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/permission/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
  const body = req.body;

  try {
    // const date = new Date().toLocaleString();

    let result = await Permissions.create({
      ...body,
      // gmtCreate: date,
      // gmtModified: date,
    });

    result = result.toObject();

    delete result.deleted;
    delete result.__v;

    // 注册成功
    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    // 注册失败
    res.json(new ErrorModal({ message: e }));
  }
});

function composeMenus(permissions) {
  const permissionObj = {};

  while (permissions.length) {
    const item = permissions.shift();
    if (!permissionObj[item.level]) {
      permissionObj[item.level] = [item];
    } else {
      permissionObj[item.level].push(item);
    }
  }

  const keys = Object.keys(permissionObj);

  let lastArr = permissionObj[keys.pop()];

  while (keys.length) {
    const secArr = permissionObj[keys.pop()];
    for (let i = 0; i < lastArr.length; i++) {
      const lastItem = lastArr[i];
      for (let j = 0; j < secArr.length; j++) {
        const secItem = secArr[j];
        if (lastItem.pid === secItem._id) {
          if (secItem.children) {
            secItem.children.push(lastItem);
          } else {
            secItem.children = [lastItem];
          }
          break;
        }
      }
    }
    lastArr = secArr;
  }

  return lastArr;
}

/**
 * @api {get} /admin/acl/permission 获取所有菜单
 * @apiDescription 获取所有菜单
 * @apiName /
 * @apiGroup permission-admin-controller: 菜单管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccess {Object[]} menuList 所有权限菜单列表
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *        "menuList": [{}]
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/permission
 * @apiVersion 1.0.0
 */
router.get("/", async (req, res) => {
  try {
    const permissions = await Permissions.find({}, filter);

    const menuList = composeMenus(JSON.parse(JSON.stringify(permissions)));

    res.json(new SuccessModal({ data: { menuList } }));
  } catch (e) {
    console.log(e);

    res.json(new ErrorModal({ message: JSON.stringify(e) }));
  }
});

/**
 * @api {post} /admin/acl/permission/doAssign 给角色分配权限菜单
 * @apiDescription 给角色分配权限菜单
 * @apiName doAssign
 * @apiGroup permission-admin-controller: 菜单管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} roleId 角色id
 * @apiParam {String[]} permissionId 权限菜单id列表
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/permission/doAssign
 * @apiVersion 1.0.0
 */
router.post("/doAssign", async (req, res) => {
  const { roleId, permissionId } = req.body;

  try {
    await Roles.findByIdAndUpdate(
      {
        _id: roleId,
      },
      {
        $set: {
          permissionId,
        },
      }
    );

    res.json(new SuccessModal({}));
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {delete} /admin/acl/permission/remove/:id 递归删除权限菜单
 * @apiDescription 递归删除权限菜单
 * @apiName remove
 * @apiGroup permission-admin-controller: 菜单管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 菜单id
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/permission/remove/:id
 * @apiVersion 1.0.0
 */
router.delete("/remove/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const permissions = await Permissions.find().sort("level");

    const idList = [id];
    for (let i = 0; i < permissions.length; i++) {
      const item = permissions[i];
      if (idList.indexOf(item.pid) >= 0 || idList.indexOf(item.id) >= 0) {
        idList.push(item.id);
      }
    }

    await Permissions.deleteMany({
      _id: {
        $in: idList,
      },
    });

    res.json(new SuccessModal({}));
  } catch (e) {
    console.log(e);

    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {get} /admin/acl/permission/toAssign/:id 根据角色获取权限菜单
 * @apiDescription 根据角色获取权限菜单
 * @apiName remove
 * @apiGroup permission-admin-controller: 菜单管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 角色id
 * @apiSuccess {Object[]} data 权限菜单列表
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : [{}],
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/permission/remove/:id
 * @apiVersion 1.0.0
 */
router.get("/toAssign/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const { permissionId } = await Roles.findById(
      {
        _id: id,
      },
      { permissionId: 1, _id: 0 }
    );

    const permissions = await Permissions.find(
      { _id: { $in: permissionId } },
      filter
    );

    res.json(new SuccessModal({ data: permissions }));
  } catch (e) {
    console.log(e);

    res.json(new ErrorModal({ message: e }));
  }
});

/**
 * @api {put} /admin/acl/permission/update 修改菜单
 * @apiDescription 修改菜单
 * @apiName update
 * @apiGroup permission-admin-controller: 菜单管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {Object} permission 权限菜单对象
 * @apiParamExample {json} Request-Example:
 *     {
 *        "id": "5e7d9b9aca7cca2214abf435",
 *        "name": "用户管理",
 *        "path": "/user/list",
 *        "pid": "5e7d9bb3ca7cca2214abf436",
 *        "type": 1,
 *        "level": 2,
 *        "icon": "user",
 *        "permissionValue": []
 *     }
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/acl/permission/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
  const { permission } = req.body;

  try {
    await Permissions.findByIdAndUpdate(
      { _id: permission._id },
      { $set: permission }
    );

    res.json(
      new SuccessModal({
        data: {},
      })
    );
  } catch (e) {
    res.json(new ErrorModal({ message: e }));
  }
});

module.exports = router;
