const { authJwt } = require("../middlewares");
const controller = require("../controllers/mod.controller");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/getAllServicesMod", [authJwt.verifyToken, authJwt.isModerator],
        controller.getAllServicesMod);

    app.post("/api/editTrackStatusMod", [authJwt.verifyToken, authJwt.isModerator, authJwt.isAssignedToUpstreamService],
        controller.editTrackStatusMod);

    app.post("/api/addTrackMod", [authJwt.verifyToken, authJwt.isModerator, authJwt.isAssignedToUpstreamService],
        controller.addTrackMod);

    app.post("/api/addNoteMod", [authJwt.verifyToken, authJwt.isModerator, authJwt.isAssignedToUpstreamService],
        controller.addNoteMod);

};