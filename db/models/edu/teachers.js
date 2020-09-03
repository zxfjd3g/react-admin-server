const mongoose = require("mongoose");

const teachers = new mongoose.Schema({
  // 名称
  name: {
    type: String,
    unique: true,
    required: true,
  },
  // 讲师详细介绍
  intro: {
    type: String,
    required: true,
  },
  // 讲师简介
  career: {
    type: String,
    required: true,
  },
  // 讲师头衔 (1高级讲师 2首席讲师)
  level: {
    type: Number,
    required: true,
  },
  // 头像
  avatar: {
    type: String,
    required: true,
  },
  // 排序
  sort: {
    type: Number,
    required: true,
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
});

// 一定是普通函数！
teachers.pre("save", function (next) {
  const date = new Date().toLocaleString();

  if (this.isNew) {
    this.gmtCreate = date;
  }

  this.gmtModified = date;

  next();
});

module.exports = mongoose.model("teachers", teachers);
