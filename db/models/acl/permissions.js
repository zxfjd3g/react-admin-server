const mongoose = require("mongoose");

const permissions = new mongoose.Schema({
  // 状态(0:禁止,1:正常)
  status: {
    type: Number,
    default: 1,
  },
  // 菜单类型：1菜单 2按钮
  type: {
    type: Number,
    default: 1,
  },
  // 父级菜单id
  pid: {
    type: String,
    required: true,
  },
  // 菜单等级
  level: {
    type: Number,
    required: true,
  },
  // 图标
  icon: {
    type: String,
    default: "",
  },
  // 组件
  component: {
    type: String,
    default: "",
  },
  // 子菜单
  // children: {
  //   type: [Object],
  //   default: null
  // },
  // 是否在侧边导航显示
  // select: {
  //   type: Boolean,
  //   default: true
  // },
  // 按钮权限
  permissionValue: {
    type: String,
    default: "",
  },
  // 路径
  path: {
    type: String,
    default: "",
  },
  // 标题
  name: {
    type: String,
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

permissions.pre("save", function (next) {
  const date = new Date().toLocaleString();

  if (this.isNew) {
    this.gmtCreate = date;
  }

  this.gmtModified = date;

  next();
});

module.exports = mongoose.model("permissions", permissions);
