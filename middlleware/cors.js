module.exports = (req, res, next) => {
  const method = req.method;

  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Credentials", true);
  res.set("Access-Control-Allow-Headers", "Content-Type, token");
  res.set("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.set("Access-Control-Max-Age", 86400);

  if (method.toLowerCase() === "options") {
    res.end();
    return;
  }

  next();
};
