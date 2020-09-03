const mongoose = require("mongoose");

const courses = new mongoose.Schema({
	// 讲师id
	teacherId: {
		type: String,
		required: true,
	},
	// 分类id
	subjectId: {
		type: String,
		required: true,
	},
	// 父级分类id
	subjectParentId: {
		type: String,
		required: true,
	},
	// 课程标题
	title: {
		type: String,
		required: true,
	},
	// 课程价格
	price: {
		type: Number,
		required: true,
	},
	// 课程总课时
	lessonNum: {
		type: Number,
		required: true,
	},
	// 课程简介
	description: {
		type: String,
		required: true,
	},
	// 课程图片
	cover: {
		type: String,
		// required: true,
		default:
			"http://www.gulixueyuan.com/files/course/2020/02-19/184934e02ec5993956.jpg",
	},
	// 课程购买数量
	buyCount: {
		type: Number,
		default: 0,
	},
	// 课程查看数量
	viewCount: {
		type: Number,
		default: 0,
	},
	// 课程版本
	version: {
		type: Number,
		default: 1,
	},
	// 课程状态(1 已发布 / 2 未发布)
	status: {
		type: Number,
		default: 2,
	},
	// 创建时间
	gmtCreate: {
		type: Date,
		default: "",
	},
	// 修改时间
	gmtModified: {
		type: Date,
		default: "",
	},
});

// 一定是普通函数！
courses.pre("save", function (next) {
	const date = new Date().toLocaleString();

	if (this.isNew) {
		this.gmtCreate = date;
	}

	this.gmtModified = date;

	next();
});

module.exports = mongoose.model("courses", courses);
