/**
 * @description 路由器中间件
 */
const express = require("express");
const Teachers = require("../../db/models/edu/teachers");
const { SuccessModal, ErrorModal } = require("../../model");

const Router = express.Router;
const router = new Router();

/**
 * @api {get} /admin/edu/teacher/list 获取所有讲师列表
 * @apiDescription 获取所有讲师列表
 * @apiName list
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccess {Object[]} data 所有讲师列表
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : [{}],
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/list
 * @apiVersion 1.0.0
 */
router.get("/list", async (req, res) => {
  try {
    const teachers = await Teachers.find({}, { deleted: 0 });
    // 返回响应
    res.json(new SuccessModal({ data: teachers }));
  } catch {
    res.json(new ErrorModal({ message: "获取所有讲师列表失败" }));
  }
});

/**
 * @api {get} /admin/edu/teacher/get/:id 获取讲师
 * @apiDescription 获取讲师
 * @apiName get
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 讲师id
 * @apiSuccess {String} _id 讲师id
 * @apiSuccess {String} name 讲师名称
 * @apiSuccess {String} intro 讲师详细介绍
 * @apiSuccess {String} career 讲师简介
 * @apiSuccess {Number=1,2} level 讲师头衔(1: 高级讲师, 2: 首席讲师)
 * @apiSuccess {String} avatar 讲师头像
 * @apiSuccess {Number} sort 讲师排序
 * @apiSuccess {Date} gmtCreate 创建时间
 * @apiSuccess {Date} gmtModified 修改时间
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *        "_id": "1196725201876611073",
 *        "gmtCreate": "2019-11-19 17:41:37",
 *        "gmtModified": "2019-11-19 17:43:30",
 *        "name": "测试",
 *        "intro": "江苏省重大科技成果转化项目",
 *        "career": "高级讲师",
 *        "level": 1,
 *        "avatar": "https://guli-file-190513.oss-cn-beijing.aliyuncs.com/avatar/default.jpg",
 *        "sort": 0
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/get/:id
 * @apiVersion 1.0.0
 */
router.get("/get/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const teacher = await Teachers.findById({ _id: id }, { deleted: 0 });
    // 返回响应
    res.json(new SuccessModal({ data: teacher }));
  } catch {
    res.json(new ErrorModal({ message: "获取讲师失败" }));
  }
});

/**
 * @api {get} /admin/edu/teacher/name/:key 查询讲师姓名列表
 * @apiDescription 根据讲师姓名关键字查询讲师姓名列表
 * @apiName name
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} key 讲师姓名关键字
 * @apiSuccess {Object[]} data 讲师列表数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : [{"_id": "xxx", "name": "yyy"}],
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/name/:key
 * @apiVersion 1.0.0
 */
router.get("/name/:key", async (req, res) => {
  try {
    const { key } = req.params;

    const teachers = await Teachers.find(
      { name: new RegExp(key) },
      { name: 1 }
    );
    // 返回响应
    res.json(new SuccessModal({ data: teachers }));
  } catch {
    res.json(new ErrorModal({ message: "查询讲师姓名列表失败" }));
  }
});

/**
 * @api {get} /admin/edu/teacher/:page/:limit 获取讲师分页列表
 * @apiDescription 获取讲师分页列表
 * @apiName page
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {Number} page 当前页数
 * @apiParam {Number} limit 每页数量
 * @apiParam {String} name 可选, 讲师姓名
 * @apiParam {Number=1,2} level 可选,讲师级别
 * @apiParam {Date} gmtCreateBegin 可选,开始时间
 * @apiParam {Date} gmtCreateEnd 可选,结束时间
 * @apiSuccess {Number} total 总数
 * @apiSuccess {Object[]} items 讲师列表数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {"total": 10, "items": [{}, {}]},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/:page/:limit
 * @apiVersion 1.0.0
 */
router.get("/:page/:limit", async (req, res) => {
  try {
    const { page, limit } = req.params;
    const { name, level, gmtCreateBegin, gmtCreateEnd } = req.query;

    const conditions = {};

    if (name) {
      conditions.name = new RegExp(name);
    }
    if (level) {
      conditions.level = level;
    }
    if (gmtCreateBegin) {
      conditions.gmtCreate = {
        $gte: gmtCreateBegin,
      };
    }
    if (gmtCreateEnd) {
      if (conditions.gmtCreate) {
        conditions.gmtCreate.$lte = gmtCreateEnd;
      } else {
        conditions.gmtCreate = {
          $lte: gmtCreateEnd,
        };
      }
    }

    const skip = (page - 1) * limit;

    const total = await Teachers.countDocuments(conditions);
    const items = await Teachers.find(
      conditions,
      { deleted: 0 },
      {
        skip,
        limit: +limit,
      }
    );

    // 返回响应
    res.json(new SuccessModal({ data: { total, items } }));
  } catch {
    res.json(new ErrorModal({ message: "查询讲师分页列表失败" }));
  }
});

/**
 * @api {post} /admin/edu/teacher/save 新增讲师
 * @apiDescription 新增讲师
 * @apiName save
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} name 讲师姓名
 * @apiParam {Number=1,2} level 讲师级别
 * @apiParam {String} intro 详细介绍
 * @apiParam {String} career 简介
 * @apiParam {String} avatar 头像
 * @apiParam {Number} sort 排序
 * @apiSuccess {Object} data 讲师数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
  try {
    const body = req.body;
    const teacher = await Teachers.create(body);
    // 返回响应
    res.json(new SuccessModal({ data: teacher }));
  } catch {
    res.json(new ErrorModal({ message: "新增讲师失败" }));
  }
});

/**
 * @api {put} /admin/edu/teacher/update 修改讲师
 * @apiDescription 修改讲师
 * @apiName update
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 讲师id
 * @apiParam {String} name 讲师姓名
 * @apiParam {Number=1,2} level 讲师级别
 * @apiParam {String} intro 详细介绍
 * @apiParam {String} career 简介
 * @apiParam {String} avatar 头像
 * @apiParam {Number} sort 排序
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
  try {
    const { id, ...body } = req.body;

    await Teachers.updateOne({ _id: id }, { $set: body });
    // 返回响应
    res.json(new SuccessModal({ data: {} }));
  } catch {
    res.json(new ErrorModal({ message: "更新讲师失败" }));
  }
});

/**
 * @api {delete} /admin/edu/teacher/remove/:id 删除讲师
 * @apiDescription 删除讲师
 * @apiName remove
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} id 讲师id
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/remove/:id
 * @apiVersion 1.0.0
 */
router.delete("/remove/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await Teachers.deleteOne({ _id: id });
    // 返回响应
    res.json(new SuccessModal({ data: {} }));
  } catch {
    res.json(new ErrorModal({ message: "删除讲师失败" }));
  }
});

/**
 * @api {delete} /admin/edu/teacher/batchRemove 批量删除讲师
 * @apiDescription 批量删除讲师
 * @apiName batchRemove
 * @apiGroup teacher-admin-controller: 讲师管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String[]} idList 讲师id列表
 * @apiSuccess {json} data
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {},
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/teacher/batchRemove
 * @apiVersion 1.0.0
 */
router.delete("/batchRemove", async (req, res) => {
  try {
    const { idList } = req.body;

    await Teachers.deleteMany({ _id: { $in: idList } });
    // 返回响应
    res.json(new SuccessModal({ data: {} }));
  } catch {
    res.json(new ErrorModal({ message: "批量删除讲师失败" }));
  }
});

module.exports = router;
