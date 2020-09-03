const mongoose = require("mongoose");

const chapters = new mongoose.Schema({
	// 章节名称
	title: {
		type: String,
		required: true,
	},
	// 课程id
	courseId: {
		type: String,
		required: true,
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
chapters.pre("save", function (next) {
	const date = new Date().toDateString();

	if (this.isNew) {
		this.gmtCreate = date;
	}

	this.gmtModified = date;

	next();
});

module.exports = mongoose.model("chapters", chapters);
