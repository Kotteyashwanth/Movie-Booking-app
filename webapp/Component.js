sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "project1/model/models"
], function (UIComponent, JSONModel, models) {
    "use strict";

    return UIComponent.extend("project1.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createLoginModel());

            var oAppModel = models.createAppModel();
            var oDefaultAppData = oAppModel.getData() || {};
            var oSavedAppData = {};

            try {
                oSavedAppData = JSON.parse(window.localStorage.getItem("movieTicketAppState") || "{}") || {};
            } catch (e) {
                oSavedAppData = {};
            }

            oAppModel.setData(Object.assign({}, oDefaultAppData, oSavedAppData));

            oAppModel.attachPropertyChange(function () {
                try {
                    window.localStorage.setItem(
                        "movieTicketAppState",
                        JSON.stringify(oAppModel.getData())
                    );
                } catch (e) {
                    // ignore storage errors
                }
            });

            this.setModel(oAppModel, "app");

            var oSavedUserData = {};
            try {
                oSavedUserData = JSON.parse(window.localStorage.getItem("movieTicketUserState") || "{}") || {};
            } catch (e) {
                oSavedUserData = {};
            }

            var oUserModel = new JSONModel(oSavedUserData);

            oUserModel.attachPropertyChange(function () {
                try {
                    window.localStorage.setItem(
                        "movieTicketUserState",
                        JSON.stringify(oUserModel.getData())
                    );
                } catch (e) {
                    // ignore storage errors
                }
            });

            sap.ui.getCore().setModel(oUserModel, "user");
            this.setModel(oUserModel, "user");

            this.getRouter().initialize();
        }

    });
});