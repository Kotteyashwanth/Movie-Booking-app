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

            this.setModel(oAppModel, "app");

            this.getRouter().initialize();

        }

    });

});