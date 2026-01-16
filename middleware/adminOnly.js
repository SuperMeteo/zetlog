module.exports = (req, res, next) => {
  if (req.session.role !== "admin") {
    return res.status(403).send("Access denied");
  }
  next();
};
