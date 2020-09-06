/**
 * @description 路由器中间件
 */
const express = require("express");
const Lessons = require("../../db/models/edu/lessons");
const { SuccessModal, ErrorModal } = require("../../model");

const Router = express.Router;
const router = new Router();

const filter = {
  __v: 0,
};

/**
 * @api {post} /admin/edu/lesson/save 新增课时
 * @apiDescription 新增课时
 * @apiName save
 * @apiGroup lesson-admin-controller: 课时管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} chapterId 章节id
 * @apiParam {String} title 课时名称
 * @apiParam {Boolean} free 是否免费
 * @apiParam {String} video 视频路径
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": {
    "free": true,
    "video": "http://vfx.mtime.cn/Video/2019/03/19/mp4/190319212559089721.mp4",
    "gmtCreate": "2020-07-04T16:00:00.000Z",
    "gmtModified": "2020-07-04T16:00:00.000Z",
    "_id": "5f019458becd5c186cb6fd26",
    "chapterId": "5f019154becd5c186cb6fd1e",
    "title": "第1课时-超文本标记语言"
  },
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/lesson/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
  const body = req.body;

  try {
    const result = await Lessons.create(body);

    // 保存成功
    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    // 保存失败
    res.json(new ErrorModal({ message: "网络出错～" }));
  }
});

/**
 * @api {get} /admin/edu/lesson/get/:chapterId 获取章节所有课时列表
 * @apiDescription 获取章节所有课时列表
 * @apiName get
 * @apiGroup lesson-admin-controller: 课时管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} chapterId 章节id
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": [{
    "free": true,
    "video": "http://vfx.mtime.cn/Video/2019/03/19/mp4/190319212559089721.mp4",
    "gmtCreate": "2020-07-04T16:00:00.000Z",
    "gmtModified": "2020-07-04T16:00:00.000Z",
    "_id": "5f019458becd5c186cb6fd26",
    "chapterId": "5f019154becd5c186cb6fd1e",
    "title": "第1课时-超文本标记语言"
  }],
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/lesson/get/:chapterId
 * @apiVersion 1.0.0
 */
router.get("/get/:chapterId", async (req, res) => {
  const { chapterId } = req.params;

  try {
    const items = await Lessons.find({ chapterId }, filter);

    res.json(
      new SuccessModal({
        data: items,
      })
    );
  } catch (e) {
    res.json(new ErrorModal({ message: "网络错误～" }));
  }
});

/**
 * @api {put} /admin/edu/lesson/update 更新课时
 * @apiDescription 更新课时
 * @apiName update
 * @apiGroup lesson-admin-controller: 课时管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} lessonId 课时id
 * @apiParam {String} title 课时标题
 * @apiParam {Boolean} free 是否免费
 * @apiParam {String} video 视频路径
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": {
		"ok":1,
		"nModified":1,
		"n":1
	},
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/lesson/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
  const { lessonId, title, free, video } = req.body;

  const condition = {};
  if (title) {
    condition.title = title;
  }
  if (free) {
    condition.free = free;
  }
  if (video) {
    condition.video = video;
  }

  try {
    const result = await Lessons.updateOne(
      {
        lessonId,
      },
      { $set: condition }
    );

    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    res.json(new ErrorModal({ message: "网络错误～" }));
  }
});

/**
 * @api {delete} /admin/edu/lesson/remove/:lessonId 删除课时
 * @apiDescription 删除课时
 * @apiName remove
 * @apiGroup lesson-admin-controller: 课时管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} lessonId 课时id
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": {
    "ok": 1,
    "n": 1,
    "deletedCount": 1
  },
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/lesson/remove/:lessonId
 * @apiVersion 1.0.0
 */
router.delete("/remove/:lessonId", async (req, res) => {
  const { lessonId } = req.params;

  try {
    const result = await Lessons.deleteOne({
      _id: lessonId,
    });

    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    res.json(new ErrorModal({ message: "网络错误～" }));
  }
});

/**
 * @api {delete} /admin/edu/lesson/batchRemove 批量删除多个课时
 * @apiDescription 批量删除多个课时
 * @apiName batchRemove
 * @apiGroup lesson-admin-controller: 课时管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String[]} idList 课时id列表
 * @apiSuccess {Object} data
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": {
    "ok": 1,
    "n": 2,
    "deletedCount": 2
  },
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/lesson/batchRemove
 * @apiVersion 1.0.0
 */
router.delete("/batchRemove", async (req, res) => {
  const { idList } = req.body;

  try {
    const result = await Lessons.deleteMany({
      _id: { $in: idList },
    });

    res.json(new SuccessModal({ data: result }));
  } catch (e) {
    res.json(new ErrorModal({ message: "网络错误～" }));
  }
});

module.exports = router;
