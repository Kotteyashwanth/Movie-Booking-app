sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.Register", {
    onInit: function () {
      var oModel = new JSONModel({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        message: ""
      });
      this.getView().setModel(oModel);
    },

    onSignUp: function () {
      var oModel = this.getView().getModel();
      var sName = oModel.getProperty("/name");
      var sEmail = oModel.getProperty("/email");
      var sPassword = oModel.getProperty("/password");
      var sConfirmPassword = oModel.getProperty("/confirmPassword");

      if (!sName) {
        oModel.setProperty("/message", "Please enter full name");
        return;
      }

      if (!sEmail) {
        oModel.setProperty("/message", "Please enter email");
        return;
      }

      if (sEmail.indexOf("@") === -1) {
        oModel.setProperty("/message", "Email must contain @");
        return;
      }

      if (!sPassword) {
        oModel.setProperty("/message", "Please enter password");
        return;
      }

      if (sPassword !== sConfirmPassword) {
        oModel.setProperty("/message", "Password and confirm password must match");
        return;
      }

      oModel.setProperty("/message", "");
      MessageToast.show("Account created successfully");
      this.getOwnerComponent().getRouter().navTo("login");
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("login");
    }
  });
});