const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/getUserStats", [authJwt.verifyToken], controller.getUserStats);

  app.get("/api/getServiceInfo", [authJwt.verifyToken], controller.getServiceInfo);

  app.get("/api/getAllNotifications", [authJwt.verifyToken], controller.getAllNotifications);

  app.post("/api/deleteNotification", [authJwt.verifyToken], controller.deleteNotification);

  app.post("/api/updateProfile", [authJwt.verifyToken], controller.updateProfile);

  app.post("/api/changePassword", [authJwt.verifyToken], controller.changePassword);

};


