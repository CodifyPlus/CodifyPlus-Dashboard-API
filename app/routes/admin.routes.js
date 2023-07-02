const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

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

    app.post("/api/addNewService", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNewService);

    app.post("/api/addNote", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNote);

    app.post("/api/addTrack", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addTrack);

    //TBD
    app.post("/api/editNote", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNewService);
    //TBD
    app.post("/api/editTrack", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNewService);

    app.post("/api/editTrackStatus", [authJwt.verifyToken, authJwt.isAdmin],
        controller.editTrackStatus);

    app.post("/api/markAsCompleted", [authJwt.verifyToken, authJwt.isAdmin],
        controller.markAsCompleted);

    app.post("/api/deleteService", [authJwt.verifyToken, authJwt.isAdmin],
        controller.deleteService);

    app.post("/api/deleteUser", [authJwt.verifyToken, authJwt.isAdmin],
        controller.deleteUser);

    app.post("/api/sendNotification", [authJwt.verifyToken, authJwt.isAdmin],
        controller.sendNotification);

    app.post("/api/approveTrack", [authJwt.verifyToken, authJwt.isAdmin],
        controller.approveTrack);

    app.post("/api/approveNote", [authJwt.verifyToken, authJwt.isAdmin],
        controller.approveNote);

};
