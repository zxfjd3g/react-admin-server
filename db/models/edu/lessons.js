const mongoose = require("mongoose");

const lessons = new mongoose.Schema({
	// 课时名称
	title: {
		type: String,
		required: true,
	},
	// 章节id
	chapterId: {
		type: String,
		required: true,
	},
	// 是否免费
	free: {
		type: Boolean,
		default: false,
	},
	// 视频
	video: {
		type: String,
		default: "",
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
lessons.pre("save", function (next) {
	const date = new Date().toDateString();

	if (this.isNew) {
		this.gmtCreate = date;
	}

	this.gmtModified = date;

	next();
});

module.exports = mongoose.model("lessons", lessons);
