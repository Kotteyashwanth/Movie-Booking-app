sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/ui/core/UIComponent"
], function (Controller, JSONModel, MessageBox, MessageToast, UIComponent) {
  "use strict";

  return Controller.extend("project1.controller.Login", {

    onInit: function () {
      var oModel = new JSONModel({
        email: "",
        password: "",
        message: ""
      });

      this.getView().setModel(oModel);
    },

    onLogin: function () {
      var oModel = this.getView().getModel();
      var sEmail = oModel.getProperty("/email");
      var sPassword = oModel.getProperty("/password");

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

      oModel.setProperty("/message", "");
      MessageToast.show("Login successful");

      var oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("home", {}, true);

      setTimeout(function () {
        window.location.hash = "#/home";
      }, 100);
    },

    onForgotPassword: function () {
      MessageBox.information(
        "Please use your registered email to reset the password."
      );
    },

    onCreateAccount: function () {
      var oRouter = UIComponent.getRouterFor(this);
      oRouter.navTo("register");
    }

  });
});