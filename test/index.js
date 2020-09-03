const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

function resolve(relative) {
	return path.resolve(__dirname, relative);
}

// 删库
execSync('mongo react_admin --eval "db.dropDatabase()"');
// 创建数据库
execSync("mongo react_admin");

const dirs = fs.readdirSync(resolve("dbs"));

for (let i = 0; i < dirs.length; i++) {
	const dir = dirs[i];

	const name = dir.split(".")[1];

	// 导入基本数据
	execSync(
		`mongoimport --db react_admin --collection ${name} --type json --file ${resolve(
			`dbs/${dir}`
		)}`
	);
}
