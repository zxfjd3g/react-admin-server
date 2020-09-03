const mongoose = require("mongoose");

const { SECRET } = require("../../../config");

const users = new mongoose.Schema({
	code: {
		type: Number,
		default: 0,
	},
	expires: {
		type: Number,
		default: 0,
	},
	token: {
		type: String,
		default: "",
	},
	// 加盐
	salt: {
		type: String,
		default: SECRET,
	},
	// 软删除
	deleted: {
		type: Boolean,
		default: false,
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
	// 用户名
	username: {
		type: String,
		required: true,
		unique: true,
	},
	// 密码
	password: {
		type: String,
		required: true,
	},
	// 昵称
	nickName: {
		type: String,
		required: true,
	},
	// 角色id
	roleId: {
		type: String,
		default: "",
	},
	// 头像
	avatar: {
		type: String,
		default:
			"https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
	},
});

// 一定是普通函数！
users.pre("save", function (next) {
	const date = new Date().toLocaleString();

	if (this.isNew) {
		this.gmtCreate = date;
	}

	this.gmtModified = date;

	next();
});

module.exports = mongoose.model("users", users);
