/**
 * @description 定义成功/失败响应的类
 */

class BaseModal {
  constructor({ code, data = {}, message, success }) {
    /*
      code 错误代码： 成功：20000  
      data 成功的数据
      message 失败的原因
      success 成功
        {
          "code": 20000,
          "data": {},
          "message": "string",
          "success": false
        }
    */
    this.code = code;
    this.data = data;
    this.message = message;
    this.success = success;
  }
}

class SuccessModal extends BaseModal {
  constructor({ code = 20000, data, success = true, message = "成功" }) {
    super({ code, data, success, message }); // 调用父类的constructor
  }
}

class ErrorModal extends BaseModal {
  constructor({ code = 20001, data, message = "失败", success = false }) {
    super({ code, message, success, data }); // 调用父类的constructor
  }
}

module.exports = {
  SuccessModal,
  ErrorModal
};
