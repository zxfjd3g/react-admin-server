const mongoose = require("mongoose");

const { MONGO_CONFIG } = require("../config");

mongoose.connect(
  `mongodb://${MONGO_CONFIG.host}:${MONGO_CONFIG.port}/${MONGO_CONFIG.database}`,
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
);

mongoose.connection.once("open", err => {
  if (!err) {
    console.log(" 数据库连接成功!");
  } else {
    console.log(err);
  }
});
