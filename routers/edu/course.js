/**
 * @description 路由器中间件 - 封装登录/注册路由
 */
const express = require("express");
const courses = require("../../db/models/edu/courses");
const { SuccessModal, ErrorModal } = require("../../model");

const Router = express.Router;
const router = new Router();

const filter = {
	__v: 0,
};

/**
 * @api {post} /admin/edu/course/save 新增课程
 * @apiDescription 新增课程
 * @apiName save
 * @apiGroup course-admin-controller: 课程管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} teacherId 讲师id
 * @apiParam {String} subjectId 课程分类id
 * @apiParam {String} subjectParentId 父级课程分类id(0代表一级分类)
 * @apiParam {String} title 课程名称
 * @apiParam {Number} price 课程价格（0代表免费）
 * @apiParam {Number} lessonNum 课程总课时
 * @apiParam {String} description 课程简介
 * @apiParam {String} cover 可选，课程图片
 * @apiSuccess {Object} data 课程数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/course/save
 * @apiVersion 1.0.0
 */
router.post("/save", async (req, res) => {
	const body = req.body;

	try {
		const result = await courses.create(body);

		// 保存成功
		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		console.log(e);

		// 保存失败
		res.json(new ErrorModal({ message: "缺少必要课程数据" }));
	}
});

/**
 * @api {put} /admin/edu/course/publish 发布课程
 * @apiDescription 发布课程
 * @apiName publish
 * @apiGroup course-admin-controller: 课程管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} courseId 课程id
 * @apiSuccess {Object} data 课程数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/course/publish
 * @apiVersion 1.0.0
 */
router.put("/publish", async (req, res) => {
	const { courseId } = req.body;

	try {
		const result = await courses.updateOne(
			{
				_id: courseId,
			},
			{ $set: { status: 1 } }
		);

		// 更新成功
		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		// 更新失败
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

/**
 * @api {put} /admin/edu/course/update 更新课程
 * @apiDescription 更新课程
 * @apiName update
 * @apiGroup course-admin-controller: 课程管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} courseId 课程id
 * @apiParam {String} teacherId 可选，讲师id
 * @apiParam {String} subjectId 可选，课程分类id
 * @apiParam {String} subjectParentId 可选，父级课程分类id(0代表一级分类)
 * @apiParam {String} title 可选，课程名称
 * @apiParam {String} price 可选，课程价格（0代表免费）
 * @apiParam {String} lessonNum 可选，课程总课时
 * @apiParam {String} description 可选，课程简介
 * @apiParam {String} cover 可选，课程图片
 * @apiSuccess {Object} data 课程数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/course/update
 * @apiVersion 1.0.0
 */
router.put("/update", async (req, res) => {
	const { courseId, ...body } = req.body;

	try {
		const result = await courses.updateOne(
			{
				_id: courseId,
			},
			{ $set: body }
		);

		// 更新成功
		res.json(new SuccessModal({ data: result }));
	} catch (e) {
		// 更新失败
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

/**
 * @api {get} /admin/edu/course/:page/:limit 获取课程分页列表
 * @apiDescription 获取课程分页列表
 * @apiName get
 * @apiGroup course-admin-controller: 课程管理
 * @apiHeader {String} token 权限令牌
 * @apiParam {String} page 当前页码
 * @apiParam {String} limit 每页数量
 * @apiParam {String} teacherId 可选，讲师id
 * @apiParam {String} subjectId 可选，课程分类id
 * @apiParam {String} subjectParentId 可选，父级课程分类id(0代表一级分类)
 * @apiParam {String} title 可选，课程名称(模糊匹配)
 * @apiSuccess {Object} data 课程数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/course/:page/:limit
 * @apiVersion 1.0.0
 */
router.get("/:page/:limit", async (req, res) => {
	const { page, limit } = req.params;
	const { title, teacherId, subjectId, subjectParentId } = req.query;

	const condition = {};

	if (title) {
		condition.title = new RegExp(title);
	}
	if (teacherId) {
		condition.teacherId = teacherId;
	}
	if (subjectId) {
		condition.subjectId = subjectId;
	}
	if (subjectParentId) {
		condition.subjectParentId = subjectParentId;
	}

	try {
		let skip = 0;
		let limitOptions = {};
		limitOptions = { skip };

		if (limit !== 0) {
			skip = (page - 1) * limit;
			limitOptions.skip = skip;
			limitOptions.limit = +limit;
		}

		const total = await courses.countDocuments(condition);
		const items = await courses.find(condition, filter, limitOptions);

		res.json(
			new SuccessModal({
				data: {
					total,
					items,
				},
			})
		);
	} catch (e) {
		// 更新失败
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

/**
 * @api {get} /admin/edu/course 获取所有课程列表
 * @apiDescription 获取所有课程列表
 * @apiName getall
 * @apiGroup course-admin-controller: 课程管理
 * @apiHeader {String} token 权限令牌
 * @apiSuccess {Object} data 课程数据
 * @apiSuccessExample {json} Success-Response:
 *  {
 *      "code": 20000,
 *      "success" : true,
 *      "data" : {
 *      },
 *      "message": ""
 *  }
 * @apiSampleRequest http://localhost:5000/admin/edu/course
 * @apiVersion 1.0.0
 */
router.get("/", async (req, res) => {
	try {
		const items = await courses.find({}, filter);

		res.json(
			new SuccessModal({
				data: items,
			})
		);
	} catch (e) {
		// 更新失败
		res.json(new ErrorModal({ message: "网络错误～" }));
	}
});

module.exports = router;
