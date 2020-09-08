/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const Chapters = require("../../db/models/edu/chapters");
const { SuccessModal, ErrorModal } = require("../../model");

const Router = express.Router;
const router = new Router();

const filter = {
	__v: 0,
	courseId: 0,
	gmtCreate: 0,
	gmtModified: 0,
};

/**
 * @api {post} /admin/edu/chapter/save 新增章节
 * @apiDescription 新增章节
 * @apiName save
 * @apiGroup chapter-admin-controller: 章节管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} courseId 课程id
 * @apiParam {String} title 章节名称
 * @apiSuccess {Object} data 章节数据
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": {
		"_id": "5f019154becd5c186cb6fd1e",
		"title": "第一章节-初始HTML"
	},
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/chapter/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
	const { courseId, title } = req.body;

	try {
		const result = await Chapters.create({ courseId, title });

		// 保存成功
		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		// 保存失败
		res.json(new ErrorModal({ message: "网络出错～" }));
	}
});

/**
 * @api {get} /admin/edu/chapter/:page/:limit 获取章节分页列表
 * @apiDescription 获取章节分页列表
 * @apiName get
 * @apiGroup chapter-admin-controller: 章节管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {Number} page 当前页码
 * @apiParam {Number} limit 每页数量
 * @apiParam {String} courseId 课程id
 * @apiSuccess {Object} data 章节数据
 * @apiSuccessExample {json} Success-Response:
{
  "code": 20000,
  "data": {
    "total": 8,
    "items": [{
      "_id": "5f019154becd5c186cb6fd1e",
      "title": "第一章节-初始HTML"
    }]
  },
  "message": "成功",
  "success": true
}
 * @apiSampleRequest http://localhost:5000/admin/edu/chapter/:page/:limit
 * @apiVersion 1.0.0
 */
router.get("/:page/:limit", async (req, res) => {
	const { page, limit } = req.params;
	const { courseId } = req.query;

	try {
		let skip = 0;
		let limitOptions = {};
		limitOptions = { skip };

		if (limit !== 0) {
			skip = (page - 1) * limit;
			limitOptions.skip = skip;
			limitOptions.limit = +limit;
		}

		const total = await Chapters.countDocuments({ courseId });
		const items = await Chapters.find({ courseId }, filter, limitOptions);

		res.json(
			new SuccessModal({
				data: {
					total,
					items,
				},
			})
		);
	} catch (e) {
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

/**
 * @api {put} /admin/edu/chapter/update 更新章节
 * @apiDescription 更新章节
 * @apiName update
 * @apiGroup chapter-admin-controller: 章节管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} chapterId 章节id
 * @apiParam {String} title 章节标题
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
 * @apiSampleRequest http://localhost:5000/admin/edu/chapter/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
	const { chapterId, title } = req.body;
	console.log('/update',  chapterId, title)
	try {
		const result = await Chapters.updateOne(
			{
				_id: chapterId,
			},
			{ $set: { title } }
		);

		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

/**
 * @api {delete} /admin/edu/chapter/remove/:chapterId 删除章节
 * @apiDescription 删除章节
 * @apiName remove
 * @apiGroup chapter-admin-controller: 章节管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} chapterId 章节id
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
 * @apiSampleRequest http://localhost:5000/admin/edu/chapter/remove/:chapterId
 * @apiVersion 1.0.0
 */
router.delete("/remove/:chapterId", async (req, res) => {
	const { chapterId } = req.params;

	try {
		const result = await Chapters.deleteOne({
			_id: chapterId,
		});

		

		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

/**
 * @api {delete} /admin/edu/chapter/batchRemove 批量删除多个章节
 * @apiDescription 批量删除多个章节
 * @apiName batchRemove
 * @apiGroup chapter-admin-controller: 章节管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String[]} idList 章节id列表
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
 * @apiSampleRequest http://localhost:5000/admin/edu/chapter/batchRemove
 * @apiVersion 1.0.0
 */
router.delete("/batchRemove", async (req, res) => {
	const { idList } = req.body;

	try {
		const result = await Chapters.deleteMany({
			_id: { $in: idList },
		});

		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

module.exports = router;
