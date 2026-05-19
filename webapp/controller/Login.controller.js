sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "project1/model/Firebase"
], function (
    Controller,
    JSONModel,
    MessageBox,
    MessageToast,
    UIComponent,
    Firebase
) {
    "use strict";

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidPhone(value) {
        return /^[0-9]{10}$/.test(value);
    }

    return Controller.extend("project1.controller.Login", {

        onInit: function () {
            var oModel = new JSONModel({
                identifier: "",
                password: "",
                message: ""
            });

            this.getView().setModel(oModel);
        },

        onTogglePassword: function () {
            var oInput = this.byId("passwordInput");

            if (oInput.getType() === "Password") {
                oInput.setType("Text");
                oInput.setValueHelpIconSrc("sap-icon://show");
            } else {
                oInput.setType("Password");
                oInput.setValueHelpIconSrc("sap-icon://hide");
            }
        },

        onLogin: async function () {
            var oModel = this.getView().getModel();

            var sIdentifier = (oModel.getProperty("/identifier") || "").trim();
            var sPassword = (oModel.getProperty("/password") || "").trim();

            if (!sIdentifier) {
                oModel.setProperty("/message", "Please enter email or phone number");
                return;
            }

            if (!sPassword) {
                oModel.setProperty("/message", "Please enter password");
                return;
            }

            if (sIdentifier.indexOf("@") !== -1 && !isValidEmail(sIdentifier)) {
                oModel.setProperty("/message", "Please enter valid email address");
                return;
            }

            if (sIdentifier.indexOf("@") === -1 && !isValidPhone(sIdentifier)) {
                oModel.setProperty("/message", "Phone number must be exactly 10 digits");
                return;
            }

            try {
                const oFB = await Firebase.loadFirebase();

                if (sIdentifier.indexOf("@") !== -1) {
                    await oFB.authMod.signInWithEmailAndPassword(
                        oFB.auth,
                        sIdentifier,
                        sPassword
                    );

                    oModel.setProperty("/message", "");
                    MessageToast.show("Login successful");
                    this.getOwnerComponent().getRouter().navTo("home", {}, true);
                    return;
                }

                oModel.setProperty(
                    "/message",
                    "Phone login with password is not supported. Use OTP flow for phone users."
                );
            } catch (e) {
                oModel.setProperty("/message", "Invalid email or password");
            }
        },

        onForgotPassword: async function () {
            var oModel = this.getView().getModel();
            var sIdentifier = (oModel.getProperty("/identifier") || "").trim();

            if (!sIdentifier) {
                MessageBox.information("Please enter your email first.");
                return;
            }

            if (sIdentifier.indexOf("@") === -1) {
                MessageBox.information(
                    "Phone reset needs OTP screen. Email reset works here."
                );
                return;
            }

            try {
                const oFB = await Firebase.loadFirebase();
                await oFB.authMod.sendPasswordResetEmail(oFB.auth, sIdentifier);
                MessageBox.success("Password reset email sent.");
            } catch (e) {
                MessageBox.error(e.message || "Reset failed");
            }
        },

        onCreateAccount: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("register");
        }

    });
});