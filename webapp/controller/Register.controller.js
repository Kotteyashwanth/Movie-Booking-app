sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "project1/model/Firebase"
], function (
    Controller,
    JSONModel,
    MessageToast,
    Firebase
) {
    "use strict";

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidPhone(value) {
        return /^[0-9]{10}$/.test(value);
    }

    function isStrongPassword(value) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
    }

    return Controller.extend("project1.controller.Register", {

        onInit: function () {

            var oModel = new JSONModel({
                name: "",
                email: "",
                phone: "",
                password: "",
                confirmPassword: "",
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

        onToggleConfirmPassword: function () {

            var oInput = this.byId("confirmPasswordInput");

            if (oInput.getType() === "Password") {

                oInput.setType("Text");
                oInput.setValueHelpIconSrc("sap-icon://show");

            } else {

                oInput.setType("Password");
                oInput.setValueHelpIconSrc("sap-icon://hide");
            }
        },

        onPhoneLiveChange: function (oEvent) {

            var sValue = oEvent.getParameter("value") || "";

            sValue = sValue
                .replace(/\D/g, "")
                .slice(0, 10);

            oEvent.getSource().setValue(sValue);
        },

        onSignUp: async function () {

            var oModel = this.getView().getModel();

            var sName =
                (oModel.getProperty("/name") || "").trim();

            var sEmail =
                (oModel.getProperty("/email") || "").trim();

            var sPhone =
                (oModel.getProperty("/phone") || "").trim();

            var sPassword =
                (oModel.getProperty("/password") || "").trim();

            var sConfirmPassword =
                (oModel.getProperty("/confirmPassword") || "").trim();

            if (!sName) {

                oModel.setProperty(
                    "/message",
                    "Please enter full name"
                );

                return;
            }

            if (!sEmail) {

                oModel.setProperty(
                    "/message",
                    "Please enter email"
                );

                return;
            }

            if (!isValidEmail(sEmail)) {

                oModel.setProperty(
                    "/message",
                    "Please enter valid email address"
                );

                return;
            }

            if (!sPhone) {

                oModel.setProperty(
                    "/message",
                    "Please enter phone number"
                );

                return;
            }

            if (!isValidPhone(sPhone)) {

                oModel.setProperty(
                    "/message",
                    "Phone number must be exactly 10 digits"
                );

                return;
            }

            if (!sPassword) {

                oModel.setProperty(
                    "/message",
                    "Please enter password"
                );

                return;
            }

            if (!isStrongPassword(sPassword)) {

                oModel.setProperty(
                    "/message",
                    "Password must contain uppercase, lowercase, number and symbol"
                );

                return;
            }

            if (!sConfirmPassword) {

                oModel.setProperty(
                    "/message",
                    "Please confirm password"
                );

                return;
            }

            if (sPassword !== sConfirmPassword) {

                oModel.setProperty(
                    "/message",
                    "Password and confirm password must match"
                );

                return;
            }

            try {

                const oFB = await Firebase.loadFirebase();

                await oFB.authMod.createUserWithEmailAndPassword(
                    oFB.auth,
                    sEmail,
                    sPassword
                );

                if (oFB.auth.currentUser) {
                    await oFB.authMod.updateProfile(oFB.auth.currentUser, {
                        displayName: sName
                    });
                }

                MessageToast.show(
                    "Account created successfully"
                );

                oModel.setProperty("/message", "");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("login");

            } catch (e) {

                oModel.setProperty(
                    "/message",
                    e.message
                );
            }
        },

        onBack: function () {

            this.getOwnerComponent()
                .getRouter()
                .navTo("login");
        }

    });

});