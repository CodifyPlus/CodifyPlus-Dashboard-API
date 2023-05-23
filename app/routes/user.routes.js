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

  app.get("/api/test/all", controller.allAccess);

  app.get("/api/test/user", [authJwt.verifyToken], controller.userBoard);

  app.get(
    "/api/test/mod",
    [authJwt.verifyToken, authJwt.isModerator],
    controller.moderatorBoard
  );

  app.get(
    "/api/test/admin",
    [authJwt.verifyToken, authJwt.isAdmin],
    controller.adminBoard
  );

  app.get("/api/getUserStats", [authJwt.verifyToken], controller.getUserStats);

  app.get("/api/getServiceInfo", [authJwt.verifyToken], controller.getServiceInfo);

  app.get("/api/getAllUsers", [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsers);

  app.post("/api/changeUserRole", [authJwt.verifyToken, authJwt.isAdmin],
    controller.changeUserRole);

  app.post("/api/addNewUser", [authJwt.verifyToken, authJwt.isAdmin],
    controller.addNewUser);

  app.get("/api/getAllServices", [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllServices);

  app.get("/api/getAllUsernames", [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllUsernames);

  app.get("/api/getAllModerators", [authJwt.verifyToken, authJwt.isAdmin],
    controller.getAllModerators);

};


