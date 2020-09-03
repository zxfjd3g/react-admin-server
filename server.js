/**
 * @description 主模块
 */
const express = require("express");
const { resolve } = require("path");

const { SERVER_CONFIG } = require("./config");

// 引入数据库
require("./db/mongo");

// 引入中间件
const cors = require("./middlleware/cors");
const acl = require("./middlleware/acl");

// 引入路由
const resetRouter = require("./routers/reset");
const oauthRouter = require("./routers/oauth");
const uploadRouter = require("./routers/upload");
const loginRouter = require("./routers/acl/login");
const userRouter = require("./routers/acl/user");
const roleRouter = require("./routers/acl/role");
const permissionRouter = require("./routers/acl/permission");
const teacherRouter = require("./routers/edu/teacher");
const subjectRouter = require("./routers/edu/subject");
const chapterRouter = require("./routers/edu/chapter");
const courseRouter = require("./routers/edu/course");
const lessonRouter = require("./routers/edu/lesson");

const app = express();

app.use(express.static(resolve(__dirname, "./public")));

// 内置中间件：用来解析POST请求体参数
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// 重置数据~
app.use(resetRouter);
app.use(oauthRouter);
// 使用中间件
// app.use(cors);
app.use(acl);

// 应用 路由器中间件
app.use(uploadRouter);
app.use("/admin/acl/index", loginRouter);
app.use("/admin/acl/user", userRouter);
app.use("/admin/acl/role", roleRouter);
app.use("/admin/acl/permission", permissionRouter);
app.use("/admin/edu/teacher", teacherRouter);
app.use("/admin/edu/subject", subjectRouter);
app.use("/admin/edu/chapter", chapterRouter);
app.use("/admin/edu/course", courseRouter);
app.use("/admin/edu/lesson", lessonRouter);

app.listen(SERVER_CONFIG.port, SERVER_CONFIG.host, (err) => {
	if (!err)
		console.log(
			` 服务器启动成功，地址: http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}\n`,
			`接口文档创建成功，地址: http://${SERVER_CONFIG.host}:${SERVER_CONFIG.port}/docs`
		);
	else console.log(err);
});
