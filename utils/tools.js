const filterKeys = ["password", "salt", "token", "__v", "deleted", "roleId"];

function filterPassword(data, keys = filterKeys) {
  const result = {};
  // 文档对象转换为普通对象
  data = data.toObject();
  for (const key in data) {
    if (data.hasOwnProperty(key) && keys.indexOf(key) === -1) {
      result[key] = data[key];
    }
  }
  return result;
}

module.exports = { filterPassword };
