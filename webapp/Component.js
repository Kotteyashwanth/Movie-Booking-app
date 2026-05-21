sap.ui.define([
    "sap/ui/core/UIComponent",
    "project1/model/models"
], function (UIComponent, models) {
    "use strict";

    return UIComponent.extend("project1.Component", {

        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(models.createLoginModel());

            var oAppModel = models.createAppModel();
            var oDefaultData = oAppModel.getData() || {};
            var oSavedData = {};

            try {
                oSavedData = JSON.parse(window.localStorage.getItem("movieTicketAppState") || "{}") || {};
            } catch (e) {
                oSavedData = {};
            }

            // Restore saved app state after refresh
            oAppModel.setData(Object.assign({}, oDefaultData, oSavedData));

            // Auto-save app state whenever anything changes in the model
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

            this.getRouter().initialize();
        }

    });

});