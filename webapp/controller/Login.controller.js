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
                oModel.setProperty("/message", "Please enter email");
                return;
            }

            if (!sPassword) {
                oModel.setProperty("/message", "Please enter password");
                return;
            }

            if (!isValidEmail(sIdentifier)) {
                oModel.setProperty("/message", "Please enter valid email address");
                return;
            }

            try {
                const oFB = await Firebase.loadFirebase();

                const oUserCredential =
                    await oFB.authMod.signInWithEmailAndPassword(
                        oFB.auth,
                        sIdentifier,
                        sPassword
                    );

                var oUser = oUserCredential.user;

                var oUserData = {
                    loggedIn: true,
                    uid: oUser.uid,
                    displayName: oUser.displayName || "User",
                    email: oUser.email || sIdentifier,
                    phoneNumber: oUser.phoneNumber || "",
                    photoURL: oUser.photoURL || "",
                    initials: (
                        (oUser.displayName || "U")
                            .charAt(0)
                            .toUpperCase()
                    )
                };

                var oUserModel = new JSONModel(oUserData);

                sap.ui.getCore().setModel(oUserModel, "user");
                this.getOwnerComponent().setModel(oUserModel, "user");

                try {
                    window.localStorage.setItem(
                        "movieTicketUserState",
                        JSON.stringify(oUserData)
                    );
                } catch (e) {
                }

                oModel.setProperty("/message", "");

                MessageToast.show("Login successful");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("home", {}, true);

            } catch (e) {
                console.error("Login error:", e);

                oModel.setProperty(
                    "/message",
                    e.code || "Invalid email or password"
                );
            }
        },

        onForgotPassword: async function () {
            var oModel = this.getView().getModel();

            var sIdentifier =
                (oModel.getProperty("/identifier") || "").trim();

            if (!sIdentifier) {
                MessageBox.information(
                    "Please enter your email first."
                );
                return;
            }

            if (!isValidEmail(sIdentifier)) {
                MessageBox.information(
                    "Please enter a valid email address."
                );
                return;
            }

            try {
                const oFB = await Firebase.loadFirebase();

                await oFB.authMod.sendPasswordResetEmail(
                    oFB.auth,
                    sIdentifier
                );

                MessageToast.show("Password reset email sent.");

            } catch (e) {
                console.error(
                    "Reset password error:",
                    e
                );

                MessageBox.error(
                    e.code || e.message || "Reset failed"
                );
            }
        },

        onCreateAccount: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("register");
        },

        onLogout: async function () {
            try {
                const oFB = await Firebase.loadFirebase();

                await oFB.auth.signOut();

                try {
                    window.localStorage.removeItem("movieTicketUserState");
                } catch (e) {
                }

                sap.ui.getCore().setModel(
                    new JSONModel({
                        loggedIn: false,
                        displayName: "",
                        email: "",
                        initials: "",
                        photoURL: ""
                    }),
                    "user"
                );

                this.getOwnerComponent().setModel(
                    new JSONModel({
                        loggedIn: false,
                        displayName: "",
                        email: "",
                        initials: "",
                        photoURL: ""
                    }),
                    "user"
                );

                MessageToast.show("Logged out");

                this.getOwnerComponent()
                    .getRouter()
                    .navTo("login", {}, true);

            } catch (e) {
                MessageBox.error(
                    e.message || "Logout failed"
                );
            }
        }

    });
});