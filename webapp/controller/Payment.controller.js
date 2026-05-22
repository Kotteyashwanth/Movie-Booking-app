sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/Dialog",
    "sap/m/VBox",
    "sap/m/Text",
    "sap/m/BusyIndicator"
], function (
    Controller,
    JSONModel,
    MessageToast,
    Dialog,
    VBox,
    Text,
    BusyIndicator
) {
    "use strict";

    return Controller.extend("project1.controller.Payment", {

        onInit: function () {
            this.getOwnerComponent()
                .getRouter()
                .getRoute("payment")
                .attachPatternMatched(this._onPaymentMatched, this);
        },

        onAfterRendering: function () {
            this._clearAutofillFields();
        },

        _hasValue: function (vValue) {
            return vValue !== undefined && vValue !== null && String(vValue).trim() !== "";
        },

        _pickValue: function (vPrimary, vFallback) {
            return this._hasValue(vPrimary) ? vPrimary : vFallback;
        },

        _toNumber: function (vValue) {
            if (vValue === null || vValue === undefined || vValue === "") {
                return NaN;
            }

            var s = String(vValue).replace(/[^\d.-]/g, "");
            var n = parseFloat(s);
            return isNaN(n) ? NaN : n;
        },

        _formatCurrency: function (vValue) {
            var n = this._toNumber(vValue);
            if (isNaN(n)) {
                n = 0;
            }
            return "₹" + n.toFixed(2);
        },

        _parseLanguageAndFormat: function (sLanguageLine, sFallbackLanguage, sFallbackFormat) {
            var sLine = String(sLanguageLine || "").trim();
            var sLanguage = String(sFallbackLanguage || "Telugu").trim() || "Telugu";
            var sFormat = String(sFallbackFormat || "2D").trim().toUpperCase() || "2D";

            if (sLine) {
                var m = sLine.match(/^(.*?)(?:\s*\(\s*(2D|3D)\s*\))?$/i);
                if (m) {
                    if (m[1] && m[1].trim()) {
                        sLanguage = m[1].trim();
                    }
                    if (m[2]) {
                        sFormat = m[2].toUpperCase();
                    }
                } else {
                    if (sLine.toUpperCase().indexOf("3D") > -1) {
                        sFormat = "3D";
                    } else if (sLine.toUpperCase().indexOf("2D") > -1) {
                        sFormat = "2D";
                    }

                    if (sLine.toUpperCase().indexOf("TELUGU") > -1) {
                        sLanguage = "Telugu";
                    } else if (sLine.toUpperCase().indexOf("ENGLISH") > -1) {
                        sLanguage = "English";
                    }
                }
            }

            return {
                language: sLanguage,
                format: sFormat
            };
        },

        _normalizeSeatDetails: function (vSeats) {
            var aSeats = [];

            if (Array.isArray(vSeats)) {
                aSeats = vSeats;
            } else if (typeof vSeats === "string" && vSeats.trim()) {
                aSeats = vSeats.split(",").map(function (sItem) {
                    return sItem.trim();
                }).filter(Boolean).map(function (sSeat) {
                    return { seatNo: sSeat };
                });
            } else if (vSeats && typeof vSeats === "object") {
                aSeats = [vSeats];
            }

            return aSeats.map(function (oItem) {
                if (typeof oItem === "string") {
                    return {
                        seatNo: oItem.trim(),
                        seatId: oItem.trim(),
                        rowLabel: "",
                        category: ""
                    };
                }

                var o = oItem || {};
                return {
                    seatNo: o.seatNo || o.seatId || o.id || "",
                    seatId: o.seatId || o.seatNo || o.id || "",
                    rowLabel: o.rowLabel || o.row || "",
                    category: o.category || ""
                };
            }).filter(function (oItem) {
                return !!(oItem.seatNo || oItem.seatId || oItem.rowLabel || oItem.category);
            });
        },

        _buildSeatSummary: function (aSeatDetails, sCategory, sRowLabel, sSelectedSeats) {
            var a = Array.isArray(aSeatDetails) ? aSeatDetails : [];
            if (a.length) {
                var sCat = String(a[0].category || sCategory || "").toUpperCase();
                var sRow = String(a[0].rowLabel || sRowLabel || "").toUpperCase();
                var aSeats = a.map(function (oItem) {
                    return String(oItem.seatNo || oItem.seatId || oItem.id || "").trim();
                }).filter(Boolean);

                return [
                    sCat,
                    sRow ? ("Row " + sRow) : "",
                    aSeats.length ? ("Seats " + aSeats.join(", ")) : ""
                ].filter(Boolean).join(" | ");
            }

            var aFallback = [];
            if (sCategory) {
                aFallback.push(String(sCategory).toUpperCase());
            }
            if (sRowLabel) {
                aFallback.push("Row " + String(sRowLabel).toUpperCase());
            }
            if (sSelectedSeats) {
                aFallback.push("Seats " + String(sSelectedSeats));
            }

            return aFallback.join(" | ");
        },

        _formatDateParts: function (sDateLine) {
            var s = String(sDateLine || "");
            var a = s.split("|").map(function (x) {
                return x.trim();
            }).filter(Boolean);

            return {
                day: a[0] || "",
                date: a[1] || "",
                time: a[2] || ""
            };
        },

        _getBookingData: function () {
            var oAppModel = this.getOwnerComponent().getModel("app");
            var oAppBooking = oAppModel ? (oAppModel.getProperty("/booking") || {}) : {};

            var oStorageBooking = {};
            try {
                oStorageBooking = JSON.parse(localStorage.getItem("bookingDetails") || "{}") || {};
            } catch (e) {
                oStorageBooking = {};
            }

            var oMerged = {};
            Object.keys(oStorageBooking).forEach(function (sKey) {
                oMerged[sKey] = oStorageBooking[sKey];
            });

            Object.keys(oAppBooking).forEach(function (sKey) {
                if (this._hasValue(oAppBooking[sKey])) {
                    oMerged[sKey] = oAppBooking[sKey];
                }
            }.bind(this));

            return oMerged;
        },

        _onPaymentMatched: function () {
            var oBooking = this._getBookingData();
            var oSeatModel = this.getOwnerComponent().getModel("seat");

            var sMovieTitle =
                this._pickValue(oBooking.movieDisplayTitle,
                this._pickValue(oBooking.movieTitle,
                this._pickValue(oBooking.movieName,
                this._pickValue(oBooking.title, ""))));

            var sLanguageLine =
                this._pickValue(oBooking.languageFormatLine, "");

            var oLangFormat = this._parseLanguageAndFormat(
                sLanguageLine,
                this._pickValue(oBooking.language, "Telugu"),
                this._pickValue(oBooking.showFormat, "2D")
            );

            var sLanguage = this._pickValue(oBooking.language, oLangFormat.language || "Telugu");
            var sShowFormat = this._pickValue(oBooking.showFormat, oLangFormat.format || "2D");

            var sTheatreLine =
                this._pickValue(oBooking.theatreLine,
                this._pickValue(oBooking.theatreName,
                this._pickValue(oBooking.theatre,
                this._pickValue(oBooking.theatreDisplay, ""))));

            var sDateLine =
                this._pickValue(oBooking.dateLine, "");

            var sDayText = this._pickValue(oBooking.dayText, "");
            var sDateText = this._pickValue(oBooking.dateText, "");
            var sTimeText = this._pickValue(oBooking.timeText, "");

            if ((!sDayText || !sDateText || !sTimeText) && sDateLine) {
                var oParts = this._formatDateParts(sDateLine);
                sDayText = sDayText || oParts.day;
                sDateText = sDateText || oParts.date;
                sTimeText = sTimeText || oParts.time;
            }

            var vSeatSource = this._pickValue(oBooking.seatDetails, this._pickValue(oBooking.selectedSeats, this._pickValue(oBooking.seats, [])));
            var aSeatDetails = this._normalizeSeatDetails(vSeatSource);

            var sSelectedSeats = aSeatDetails.map(function (oSeat) {
                return String(oSeat.seatNo || oSeat.seatId || "").trim();
            }).filter(Boolean).join(", ");

            if (!sSelectedSeats && typeof oBooking.selectedSeats === "string") {
                sSelectedSeats = oBooking.selectedSeats;
            }

            var iSeatCount = this._toNumber(oBooking.seatCount);
            if (isNaN(iSeatCount) || iSeatCount < 1) {
                iSeatCount = aSeatDetails.length || (sSelectedSeats ? sSelectedSeats.split(",").filter(Boolean).length : 1);
            }

            var sCategory = String(
                this._pickValue(
                    oBooking.selectedCategory,
                    (aSeatDetails[0] && aSeatDetails[0].category) || "PLATINUM"
                )
            ).trim().toUpperCase();

            var sRowLabel = String(
                this._pickValue(
                    oBooking.selectedRowLabel,
                    (aSeatDetails[0] && aSeatDetails[0].rowLabel) || ""
                )
            ).trim().toUpperCase();

            var bIs3D =
                String(sShowFormat).toUpperCase() === "3D" ||
                !!oBooking.isThreeD ||
                String(sLanguageLine).toUpperCase().indexOf("3D") > -1;

            var iRate = this._toNumber(oBooking.ticketRate);
            if (isNaN(iRate) || iRate < 1) {
                iRate = this._toNumber(oBooking.selectedRate);
            }
            if (isNaN(iRate) || iRate < 1) {
                iRate = oSeatModel ? this._toNumber(oSeatModel.getProperty("/selectedRate")) : NaN;
            }
            if (isNaN(iRate) || iRate < 1) {
                iRate = 145;
            }

            var iTicketAmount = this._toNumber(oBooking.ticketAmount);
            if (isNaN(iTicketAmount)) {
                iTicketAmount = this._toNumber(oBooking.totalPrice);
            }
            if (isNaN(iTicketAmount)) {
                iTicketAmount = iSeatCount * iRate;
            }

            var iConvenienceBaseAmount = this._toNumber(oBooking.convenienceBaseAmount);
            if (isNaN(iConvenienceBaseAmount)) {
                iConvenienceBaseAmount = iSeatCount * 17;
            }

            var iConvenienceGstAmount = this._toNumber(oBooking.convenienceGstAmount);
            if (isNaN(iConvenienceGstAmount)) {
                iConvenienceGstAmount = parseFloat((iConvenienceBaseAmount * 0.18).toFixed(2));
            }

            var iConvenienceFeeAmount = this._toNumber(oBooking.convenienceFeeAmount);
            if (isNaN(iConvenienceFeeAmount)) {
                iConvenienceFeeAmount = parseFloat((iConvenienceBaseAmount + iConvenienceGstAmount).toFixed(2));
            }

            var iGlassesFee = this._toNumber(oBooking.threeDGlassAmount);
            if (isNaN(iGlassesFee)) {
                iGlassesFee = bIs3D ? (20 * iSeatCount) : 0;
            }

            var iGrandTotal = this._toNumber(oBooking.orderTotal);
            if (isNaN(iGrandTotal)) {
                iGrandTotal = this._toNumber(oBooking.totalAmount);
            }
            if (isNaN(iGrandTotal)) {
                iGrandTotal = parseFloat((iTicketAmount + iConvenienceFeeAmount + iGlassesFee).toFixed(2));
            }

            var oDateParts = this._formatDateParts(
                this._pickValue(oBooking.dateLine, [sDayText, sDateText, sTimeText].filter(Boolean).join(" | "))
            );

            var sDateFinalDay = sDayText || oDateParts.day;
            var sDateFinalDate = sDateText || oDateParts.date;
            var sDateFinalTime = sTimeText || oDateParts.time;

            var sSeatSummary = this._buildSeatSummary(aSeatDetails, sCategory, sRowLabel, sSelectedSeats);

            var oPaymentModel = new JSONModel({
                movieTitle: sMovieTitle,
                movieName: sMovieTitle,
                language: sLanguage,
                showFormat: sShowFormat,
                languageFormatText: [sLanguage, sShowFormat].join(" "),
                theatreLine: sTheatreLine,

                dayText: sDateFinalDay,
                dateText: sDateFinalDate,
                timeText: sDateFinalTime,

                seatCount: iSeatCount,
                selectedSeats: sSelectedSeats,
                selectedSeatDetails: aSeatDetails,
                selectedCategory: sCategory,
                selectedRowLabel: sRowLabel,
                seatSummary: sSeatSummary,

                ticketAmount: iTicketAmount,
                convenienceBase: iConvenienceBaseAmount,
                convenienceGst: iConvenienceGstAmount,
                convenienceFee: iConvenienceFeeAmount,
                glassesFee: iGlassesFee,
                grandTotal: iGrandTotal,

                ticketAmountFormatted: this._formatCurrency(iTicketAmount),
                convenienceBaseFormatted: this._formatCurrency(iConvenienceBaseAmount),
                convenienceGstFormatted: this._formatCurrency(iConvenienceGstAmount),
                convenienceFeeFormatted: this._formatCurrency(iConvenienceFeeAmount),
                glassesFeeFormatted: this._formatCurrency(iGlassesFee),
                grandTotalFormatted: this._formatCurrency(iGrandTotal),

                glassesFeeVisible: bIs3D,

                selectedMethodIndex: 0,
                selectedMethod: "UPI",

                upiId: "",
                cardNumber: "",
                cardHolder: "",
                cardExpiry: "",
                cardCvv: "",
                bankName: "",
                netBankUserId: "",
                netBankPassword: ""
            });

            this.getView().setModel(oPaymentModel, "payment");
            this._clearAutofillFields();
        },

        _clearAutofillFields: function () {
            var aIds = [
                "upiInput",
                "cardNumberInput",
                "cardHolderInput",
                "cardExpiryInput",
                "cardCvvInput",
                "netUserIdInput",
                "netPasswordInput"
            ];

            aIds.forEach(function (sId) {
                var oControl = this.byId(sId);
                if (!oControl) {
                    return;
                }

                if (oControl.setValue) {
                    oControl.setValue("");
                }

                var oDom = oControl.getDomRef && oControl.getDomRef();
                if (oDom) {
                    oDom.setAttribute("autocomplete", "off");
                    oDom.setAttribute("autocorrect", "off");
                    oDom.setAttribute("autocapitalize", "off");
                    oDom.setAttribute("spellcheck", "false");
                }

                var oInnerDom = oControl.getDomRef && oControl.getDomRef("inner");
                if (oInnerDom) {
                    oInnerDom.value = "";
                    oInnerDom.setAttribute("autocomplete", "off");
                    oInnerDom.setAttribute("autocorrect", "off");
                    oInnerDom.setAttribute("autocapitalize", "off");
                    oInnerDom.setAttribute("spellcheck", "false");
                    oInnerDom.setAttribute("readonly", "readonly");

                    setTimeout(function () {
                        try {
                            oInnerDom.removeAttribute("readonly");
                        } catch (e) {
                            // ignore
                        }
                    }, 100);
                }
            }.bind(this));

            var oBankSelect = this.byId("bankSelect");
            if (oBankSelect && oBankSelect.setSelectedKey) {
                oBankSelect.setSelectedKey("");
            }

            var oGroup = this.byId("paymentMethodGroup");
            if (oGroup && oGroup.setSelectedIndex) {
                oGroup.setSelectedIndex(0);
            }
        },

        onBack: function () {
            window.history.back();
        },

        onPaymentMethodChange: function (oEvent) {
            var oModel = this.getView().getModel("payment");
            var iIndex = oEvent.getParameter("selectedIndex");

            if (!oModel) {
                return;
            }

            oModel.setProperty("/selectedMethodIndex", iIndex);

            var sMethod = "UPI";
            if (iIndex === 1) {
                sMethod = "CARD";
            } else if (iIndex === 2) {
                sMethod = "NETBANKING";
            }

            oModel.setProperty("/selectedMethod", sMethod);
            this._clearAutofillFields();
        },

        onPayNow: function () {
            var oModel = this.getView().getModel("payment");
            if (!oModel) {
                MessageToast.show("Payment data not loaded");
                return;
            }

            var sMethod = oModel.getProperty("/selectedMethod");
            var bValid = true;
            var sMsg = "";

            if (sMethod === "UPI") {
                var sUpi = (oModel.getProperty("/upiId") || "").trim();
                if (!sUpi) {
                    bValid = false;
                    sMsg = "Please enter UPI ID";
                }
            }

            if (sMethod === "CARD") {
                var sCardNumber = (oModel.getProperty("/cardNumber") || "").trim();
                var sCardHolder = (oModel.getProperty("/cardHolder") || "").trim();
                var sCardExpiry = (oModel.getProperty("/cardExpiry") || "").trim();
                var sCardCvv = (oModel.getProperty("/cardCvv") || "").trim();

                if (!sCardNumber || !sCardHolder || !sCardExpiry || !sCardCvv) {
                    bValid = false;
                    sMsg = "Please fill all card details";
                }
            }

            if (sMethod === "NETBANKING") {
                var sBank = (oModel.getProperty("/bankName") || "").trim();
                var sUser = (oModel.getProperty("/netBankUserId") || "").trim();
                var sPass = (oModel.getProperty("/netBankPassword") || "").trim();

                if (!sBank || !sUser || !sPass) {
                    bValid = false;
                    sMsg = "Please fill all net banking details";
                }
            }

            if (!bValid) {
                MessageToast.show(sMsg);
                return;
            }

            if (!this._oBusyDialog) {
                this._oBusyDialog = new Dialog({
                    showHeader: false,
                    draggable: false,
                    resizable: false,
                    contentWidth: "280px",
                    contentHeight: "160px",
                    content: new VBox({
                        width: "100%",
                        height: "100%",
                        justifyContent: "Center",
                        alignItems: "Center",
                        items: [
                            new BusyIndicator({ size: "1.5rem" }),
                            new Text({ text: "Processing payment..." }).addStyleClass("sapUiSmallMarginTop")
                        ]
                    }).addStyleClass("sapUiContentPadding")
                });

                this.getView().addDependent(this._oBusyDialog);
            }

            this._oBusyDialog.open();

            setTimeout(function () {
                this._oBusyDialog.close();
                MessageToast.show("Payment successful (Test Mode)");
            }.bind(this), 2000);
        }

    });
});