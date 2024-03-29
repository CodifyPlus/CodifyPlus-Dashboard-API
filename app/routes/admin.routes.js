const { authJwt } = require("../middlewares");
const controller = require("../controllers/admin/index.js");

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

    app.get("/api/getAllTemplates", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getAllTemplates);

    app.post("/api/changeUserRole", [authJwt.verifyToken, authJwt.isAdmin],
        controller.changeUserRole);

    app.post("/api/addNewUser", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNewUser);

    app.get("/api/getAllServices", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getAllServices);

    app.get("/api/getAllUsernames", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getAllUsernames);

    app.get("/api/getTemplateNames", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getTemplateNames);

    app.get("/api/getAllModerators", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getAllModerators);

    app.post("/api/addNewService", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNewService);

    app.post("/api/addNote", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addNote);

    app.post("/api/addTemplate", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addTemplate);

    app.post("/api/addTrack", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addTrack);

    app.post("/api/addTemplateTrack", [authJwt.verifyToken, authJwt.isAdmin],
        controller.addTemplateTrack);

    app.post("/api/editTrack", [authJwt.verifyToken, authJwt.isAdmin],
        controller.editTrack);

    app.post("/api/editTrackStatus", [authJwt.verifyToken, authJwt.isAdmin],
        controller.editTrackStatus);

    app.post("/api/markAsCompleted", [authJwt.verifyToken, authJwt.isAdmin],
        controller.markAsCompleted);

    app.post("/api/markOnHold", [authJwt.verifyToken, authJwt.isAdmin],
        controller.markOnHold);

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

    app.get("/api/admin/getSubscribedChatBoxes", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getSubscribedChatBoxes);

    app.get("/api/getAdminStats", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getAdminStats);

    app.get("/api/getUserStatsForAdmin", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getUserStatsForAdmin);

    app.post("/api/toggleTimelineDatesVisibility", [authJwt.verifyToken, authJwt.isAdmin],
        controller.toggleTimelineDatesVisibility);

    app.post("/api/sendNoteEmail", [authJwt.verifyToken, authJwt.isAdmin],
        controller.sendNoteEmail);

    app.post("/api/editServiceDetails", [authJwt.verifyToken, authJwt.isAdmin],
        controller.editServiceDetails);

    app.get("/api/exportUsers", [authJwt.verifyToken, authJwt.isAdmin],
        controller.exportUsers);

    app.get("/api/exportChats", [authJwt.verifyToken, authJwt.isAdmin],
        controller.exportChats);

    app.get("/api/exportServices", [authJwt.verifyToken, authJwt.isAdmin],
        controller.exportServices);

    app.get("/api/getTemplateInfo", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getTemplateInfo);

    app.get("/api/getTotalRevenueByService", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getTotalRevenueByService);

    app.get("/api/getServicesSoldData", [authJwt.verifyToken, authJwt.isAdmin],
        controller.getServicesSoldData);

    app.post("/api/deleteTemplate", [authJwt.verifyToken, authJwt.isAdmin],
        controller.deleteTemplate);

};
