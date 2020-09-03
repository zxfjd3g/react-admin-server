const mongoose = require("mongoose");

const roles = new mongoose.Schema({
  // 权限菜单数组
  permissionId: {
    type: [String],
    default: []
  },
  // 软删除
  deleted: {
    type: Boolean,
    default: false
  },
  // 创建时间
  gmtCreate: {
    type: Date,
    default: ""
  },
  // 修改时间
  gmtModified: {
    type: Date,
    default: ""
  },
  // 昵称
  roleName: {
    type: String,
    required: true,
    unique: true
  },
  // 别名
  remark: {
    type: String,
    required: true
  }
});


// 一定是普通函数！
roles.pre("save", function (next) {
  const date = new Date().toLocaleString();

  if (this.isNew) {
    this.gmtCreate = date;
  }

  this.gmtModified = date;

  next();
});

module.exports = mongoose.model("roles", roles);
