sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/core/HTML",
    "sap/m/FlexAlignItems",
    "sap/m/FlexJustifyContent",
    "sap/m/FlexWrap",
    "sap/ui/model/json/JSONModel"
], function (
    Controller,
    Fragment,
    VBox,
    HBox,
    Text,
    Button,
    HTML,
    FlexAlignItems,
    FlexJustifyContent,
    FlexWrap,
    JSONModel
) {
    "use strict";

    return Controller.extend("project1.controller.SeatSelection", {

       onInit: function () {

    this._bBuilt = false;
    this._sTheatreKey = "";

    // TICKET PRICES
    this._mRates = {
        silver: 80,
        gold: 100,
        platinum: 145
    };

    var oRouter = this.getOwnerComponent().getRouter();

    oRouter
        .getRoute("seatSelection")
        .attachPatternMatched(this._onRouteMatched, this);
},
    _onRouteMatched: function (oEvent) {

    var oArgs = oEvent.getParameter("arguments") || {};
    var sTheatreKey = "";

    if (oArgs.theatreName) {
        try {
            sTheatreKey = decodeURIComponent(oArgs.theatreName);
        } catch (e) {
            sTheatreKey = oArgs.theatreName;
        }
    }

    this._sTheatreKey = this._normalizeKey(sTheatreKey);

    var oAppModel = this.getOwnerComponent().getModel("app");
    var oBooking = oAppModel ? oAppModel.getProperty("/booking") : null;
    var oMovie = oAppModel ? oAppModel.getProperty("/selectedMovie") : null;
    var aTheatres = oAppModel ? (oAppModel.getProperty("/selectedTheatres") || []) : [];

    var oMatchedTheatre = null;

    // Match using route key
    for (var i = 0; i < aTheatres.length; i++) {

        var sName = aTheatres[i].name || "";

        if (this._normalizeKey(sName) === this._sTheatreKey) {
            oMatchedTheatre = aTheatres[i];
            break;
        }
    }

    // Fallback theatre names
    if (!oMatchedTheatre) {

      var oFallbackMap = {

    sandhya: {
        name: "NVR Sandhya",
        format: "4K Dolby Atmos",
        timings: [
            { time: "11:10 AM" },
            { time: "02:20 PM" },
            { time: "06:40 PM" },
            { time: "09:50 PM" }
        ]
    },

    pgr: {
        name: "PGR Cinemas",
        format: "4K Dolby Atmos",
        timings: [
            { time: "11:00 AM" },
            { time: "02:00 PM" },
            { time: "06:30 PM" },
            { time: "09:30 PM" }
        ]
    },

    pratap: {
        name: "Pratap Theatre",
        format: "Dolby Atmos",
        timings: [
            { time: "10:45 AM" },
            { time: "02:15 PM" },
            { time: "06:15 PM" },
            { time: "09:45 PM" }
        ]
    },

    svCineplex: {
        name: "SV Cineplex",
        format: "4K Dolby Atmos",
        timings: [
            { time: "11:00 AM" },
            { time: "02:30 PM" },
            { time: "06:30 PM" },
            { time: "10:00 PM" }
        ]
    },

    krishnaTeja: {
        name: "Krishna Teja",
        format: "Dolby Atmos",
        timings: [
            { time: "11:15 AM" },
            { time: "02:45 PM" },
            { time: "06:45 PM" },
            { time: "10:15 PM" }
        ]
    },

    palani: {
        name: "Palani Theatre",
        format: "Dolby Atmos",
        timings: [
            { time: "11:30 AM" },
            { time: "03:00 PM" },
            { time: "07:00 PM" },
            { time: "10:30 PM" }
        ]
    },

    devendra: {
        name: "CS Cinemas Devendra",
        format: "4K Dolby",
        timings: [
            { time: "10:30 AM" },
            { time: "01:45 PM" },
            { time: "05:45 PM" },
            { time: "09:15 PM" }
        ]
    },

    jaysyam: {
        name: "Jaysyam Theatre",
        format: "Dolby Atmos",
        timings: [
            { time: "11:20 AM" },
            { time: "02:50 PM" },
            { time: "06:50 PM" },
            { time: "10:20 PM" }
        ]
    }
};
        oMatchedTheatre = oFallbackMap[this._sTheatreKey];
    }

    var sSelectedTime =
        (oBooking && oBooking.showTime) ||
        (oMovie && oMovie.selectedTime) ||
        "";

    var aShowTimes = [];

    if (oMatchedTheatre && Array.isArray(oMatchedTheatre.timings)) {

        aShowTimes = oMatchedTheatre.timings.map(function (oItem) {
            return {
                time: oItem.time,
                selected: oItem.time === sSelectedTime
            };
        });
    }

    var sCity = "Tirupati";

    var sTheatreLine =
        oMatchedTheatre.name +
        " | " +
        (oMatchedTheatre.format || "") +
        " | " +
        sCity;

    var sMovieTitle =
        (oBooking && oBooking.movieTitle) ||
        (oMovie && (oMovie.movieTitle || oMovie.title)) ||
        "";

    var sLanguage =
        (oMovie && oMovie.language) ||
        "Telugu";

    var sSelectedDate =
        (oBooking && oBooking.selectedDate) ||
        (oMovie && oMovie.selectedDate) ||
        "";

    var sSelectedDateISO =
        (oBooking && oBooking.selectedDateISO) ||
        (oMovie && oMovie.selectedDateISO) ||
        "";

   var iSeats = parseInt(oArgs.seats, 10);

if (isNaN(iSeats) || iSeats < 1) {
    iSeats = parseInt(oBooking && oBooking.seatCount, 10);
}

if (isNaN(iSeats) || iSeats < 1) {
    iSeats = parseInt(oMovie && oMovie.selectedSeatCount, 10);
}

if (isNaN(iSeats) || iSeats < 1) {
    iSeats = 1;
}

this._iSelectedTicketCount = iSeats;
this.selectedSeats = [];

var sDateLine = this._formatHeaderDateLine(
        sSelectedDateISO,
        sSelectedDate,
        sSelectedTime
    );

  var oSeatModel = new JSONModel({
    movieTitle: sMovieTitle,
    language: sLanguage,
    theatreLine: sTheatreLine,
    dateLine: sDateLine,
    baseDateLine: sDateLine,
    selectedShowTime: sSelectedTime,
    tickets: iSeats + " Tickets",
    selectedCategory: "platinum",
    selectedRate: 145,
    totalAmount: 0,
    footerVisible: false,
    showTimes: aShowTimes
});
    this.getView().setModel(oSeatModel, "seat");

    var oHost = this.byId("seatLayoutHost");

    if (oHost) {
        oHost.removeAllItems();
    }

    this._buildSeatLayout();
},
        _normalizeKey: function (sText) {
            var s = String(sText || "").toLowerCase();

            if (s.indexOf("krishna teja") > -1 || s.indexOf("krishnateja") > -1) {
                return "krishnaTeja";
            }

            if (s.indexOf("palani") > -1) {
                return "palani";
            }

            if (s.indexOf("cs cinemas") > -1 || s.indexOf("devendra") > -1) {
                return "devendra";
            }

            if (s.indexOf("pgr") > -1) {
                return "pgr";
            }

            if (
                s.indexOf("jaysyam") > -1 ||
                s.indexOf("jaysam") > -1 ||
                s.indexOf("jayasam") > -1 ||
                s.indexOf("jayasyam") > -1
            ) {
                return "jaysyam";
            }

            if (s.indexOf("sandhya") > -1) {
                return "sandhya";
            }

            if (s.indexOf("pratap") > -1) {
                return "pratap";
            }

            if (s.indexOf("sv cineplex") > -1 || s.indexOf("svcineplex") > -1 || s.indexOf("svcin") > -1) {
                return "svCineplex";
            }

            return "krishnaTeja";
        },

        onAfterRendering: function () {
            if (this._bBuilt) {
                return;
            }
            this._bBuilt = true;
            this._buildSeatLayout();
        },

       onBack: function () {
    var oRouter = this.getOwnerComponent().getRouter();
    oRouter.navTo("theatreList");
},

        _buildSeatLayout: function () {
            var oHost = this.byId("seatLayoutHost");
            if (!oHost) {
                return;
            }

            oHost.removeAllItems();

            var oLayouts = this._getLayouts();
            var oLayout = oLayouts[this._sTheatreKey] || oLayouts.krishnaTeja;

            var oMain = new VBox({ width: "100%" });
            oMain.addStyleClass("seatLayoutMain");

            oLayout.sections.forEach(function (oSection) {
                oMain.addItem(this._createSection(oSection));
            }.bind(this));

            oMain.addItem(this._createLegend());
            oMain.addItem(this._createScreen());

            oHost.addItem(oMain);
        },

        _range: function (iStart, iEnd) {
            var a = [];
            var i;

            if (iStart <= iEnd) {
                for (i = iStart; i <= iEnd; i++) {
                    a.push(i);
                }
            } else {
                for (i = iStart; i >= iEnd; i--) {
                    a.push(i);
                }
            }

            return a;
        },

        _isInArray: function (iValue, aList) {
            if (!Array.isArray(aList)) {
                return false;
            }

            return aList.indexOf(iValue) > -1;
        },

        _getLayouts: function () {
            var r = this._range.bind(this);

            return {
                krishnaTeja: {
                    sections: [
                        {
                            title: "₹145 PLATINUM",
                            rows: [
                                { label: "AA", blocks: [[1, 10], [11, 20]] },
                                { label: "BB", blocks: [[1, 9], [10, 18]] },
                                { label: "CC", blocks: [[1, 9], [10, 18]] },
                                { label: "DD", blocks: [[1, 9], [10, 18]] },
                                { label: "-", blocks: [] },
                                { label: "FF", blocks: [[1, 11], [12, 22]] },
                                { label: "GG", blocks: [[1, 11], [12, 22]], spacerAfter: true }
                            ]
                        },
                        {
                            title: "₹145 PLATINUM",
                            rows: [
                                { label: "A", blocks: [[1, 9], [10, 18]] },
                                { label: "B", blocks: [[1, 7], [8, 14]] },
                                { label: "C", blocks: [[1, 21]] },
                                { label: "D", blocks: [[1, 21]] },
                                { label: "E", blocks: [[1, 21]] },
                                { label: "F", blocks: [[1, 21]] },
                                { label: "G", blocks: [[1, 21]] },
                                { label: "H", blocks: [[1, 21]] },
                                { label: "I", blocks: [[1, 21]] },
                                { label: "J", blocks: [[1, 21]] },
                                { label: "K", blocks: [[1, 21]] },
                                { label: "L", blocks: [[1, 21]] },
                                { label: "M", blocks: [[1, 21]] },
                                { label: "N", blocks: [[1, 21]] },
                                { label: "O", blocks: [[1, 21]] },
                                { label: "P", blocks: [[1, 21]] },
                                { label: "Q", blocks: [[1, 21]] },
                                { label: "R", blocks: [[1, 21]] },
                                { label: "S", blocks: [[1, 21]], spacerAfter: true }
                            ]
                        },
                        {
                            title: "₹100 Gold",
                            rows: [
                                { label: "P", blocks: [[1, 21]] },
                                { label: "Q", blocks: [[1, 21]] },
                                { label: "R", blocks: [[1, 21]] },
                                { label: "S", blocks: [[1, 21]] },
                                { label: "T", blocks: [[1, 21]] },
                                { label: "U", blocks: [[1, 21]] }
                            ]
                        },
                        {
                            title: "₹80 SILVER",
                            rows: [
                                { label: "V", blocks: [[1, 21]] },
                                { label: "W", blocks: [[1, 21]] },
                                { label: "X", blocks: [[1, 21]] },
                                { label: "Y", blocks: [[1, 21]] }
                            ]
                        }
                    ]
                },

                svCineplex: {
                    sections: [
                        {
                            title: "₹145 PLATINUM",
                            rows: [
                                { label: "A", blocks: [[1, 26]] },
                                { label: "B", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "C", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "D", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "E", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "F", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "G", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "H", blocks: [[1, 6], [7, 16], [17, 22]], spacerAfter: true },
                                { label: "I", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "J", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "K", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "L", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "M", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "N", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "O", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "P", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "Q", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "R", blocks: [[1, 6], [7, 16], [17, 22]], spacerAfter: true }
                            ]
                        },
                        {
                            title: "₹100 Gold",
                            rows: [
                                { label: "S", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "T", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "U", blocks: [[3, 6], [7, 16], [17, 20]] },
                                { label: "V", blocks: [[1, 6], [7, 16], [17, 22]] }
                            ]
                        },
                        {
                            title: "₹80 SILVER",
                            rows: [
                                { label: "W", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "X", blocks: [[1, 6], [7, 16], [17, 22]] }
                            ]
                        }
                    ]
                },

                palani: {
                    sections: [
                        {
                            title: "₹100 DIAMOND",
                            rows: [
                                { label: "A", blocks: [[28, 1]] },
                                { label: "B", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "C", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "D", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "E", blocks: [[19, 16], [15, 5], [4, 1]] },
                                { label: "-", blocks: [] },
                                { label: "F", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "G", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "H", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "I", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "J", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "K", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "L", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "M", blocks: [[25, 19], [18, 8], [7, 1]], spacerAfter: true }
                            ]
                        },
                        {
                            title: "₹100 GOLD",
                            rows: [
                                { label: "N", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "O", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "P", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "Q", blocks: [[25, 19], [18, 8], [7, 1]] }
                            ]
                        },
                        {
                            title: "₹80 SILVER",
                            rows: [
                                { label: "R", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "S", blocks: [[25, 19], [18, 8], [7, 1]] },
                                { label: "T", blocks: [[11, 1]] }
                            ]
                        }
                    ]
                },

                devendra: {
                    sections: [
                        {
                            title: "₹145 Diamond Class",
                            rows: [
                                { label: "A", blocks: [[18, 10], [9, 1]] },
                                { label: "B", blocks: [[20, 11], [10, 1]] },
                                { label: "C", blocks: [[24, 13], [12, 1]] },
                                { label: "D", blocks: [[28, 15], [14, 1]] },
                                { label: "E", blocks: [[28, 15], [14, 1]] },
                                { label: "F", blocks: [[28, 15], [14, 1]] },
                                { label: "G", blocks: [[28, 15], [14, 1]] },
                                { label: "H", blocks: [[28, 15], [14, 1]] },
                                { label: "I", blocks: [[28, 15], [14, 1]] },
                                { label: "J", blocks: [[28, 15], [14, 1]] },
                                { label: "K", blocks: [[26, 14], [13, 1]] },
                                { label: "L", blocks: [[24, 13], [12, 1]] },
                                { label: "M", blocks: [[24, 13], [12, 1]] }
                            ]
                        },
                        {
                            title: "₹100 Gold Class",
                            rows: [
                                { label: "N", blocks: [[25, 14], [13, 1]] },
                                { label: "O", blocks: [[25, 14], [13, 1]] }
                            ]
                        },
                        {
                            title: "₹80 Silver Class",
                            rows: [
                                { label: "P", blocks: [[22, 12], [11, 1]] },
                                { label: "Q", blocks: [[20, 11], [10, 1]] },
                                { label: "R", blocks: [[18, 11], [9, 1]] },
                                { label: "S", blocks: [[18, 11], [9, 1]] }
                            ]
                        }
                    ]
                },

                sandhya: {
                    sections: [
                        {
                            title: "₹145 Diamond",
                            rows: [
                                { label: "AA", blocks: [[1, 22]] },
                                { label: "BB", blocks: [[1, 19]] },
                                { label: "CC", blocks: [[1, 19]] },
                                { label: "DD", blocks: [[1, 19]] },
                                { label: "EE", blocks: [[1, 19]] },
                                { label: "FF", blocks: [[1, 19]], spacerAfter: true },

                                { label: "A", blocks: [[1, 23]] },
                                { label: "B", blocks: [[1, 19]] },
                                { label: "C", blocks: [[1, 19]] },
                                { label: "D", blocks: [[1, 19]] },
                                { label: "E", blocks: [[1, 19]] },
                                { label: "F", blocks: [[1, 19]] },
                                { label: "G", blocks: [[1, 19]] },
                                { label: "H", blocks: [[1, 19]] },
                                { label: "I", blocks: [[1, 19]] },
                                { label: "J", blocks: [[1, 19]] },
                                { label: "K", blocks: [[1, 19]] },
                                { label: "L", blocks: [[1, 19]] },
                                { label: "M", blocks: [[1, 19]] },
                                { label: "N", blocks: [[1, 19]] },
                                { label: "O", blocks: [[1, 19]], spacerAfter: true },

                                { label: "P", blocks: [[1, 19]] },
                                { label: "Q", blocks: [[1, 19]] },
                                { label: "R", blocks: [[1, 19]], spacerAfter: true }
                            ]
                        },
                        {
                            title: "₹100 Gold",
                            rows: [
                                { label: "S", blocks: [[1, 19]] },
                                { label: "T", blocks: [[1, 19]] },
                                { label: "U", blocks: [[1, 19]] },
                                { label: "V", blocks: [[1, 19]] },
                                { label: "W", blocks: [[1, 19]] }
                            ]
                        },
                        {
                            title: "₹80 Silver",
                            rows: [
                                { label: "X", blocks: [[1, 19]] },
                                { label: "Y", blocks: [[1, 19]] }
                            ]
                        }
                    ]
                },

                pgr: {
                    sections: [
                        {
                            title: "₹145 PLATINUM",
                            rows: [
                                { label: "A", blocks: [[1, 6], [7, 12]] },
                                { label: "B", blocks: [[1, 7], [8, 14]] },
                                { label: "C", blocks: [[1, 7], [8, 14]] },
                                { label: "D", blocks: [[1, 7], [8, 14]] },
                                { label: "E", blocks: [[1, 7], [8, 14]] },
                                { label: "F", blocks: [[1, 7], [8, 14]] },
                                { label: "G", blocks: [[1, 7], [8, 14]] },
                                { label: "H", blocks: [[1, 7], [8, 14]], spacerAfter: true },

                                { label: "J", blocks: [[1, 11], [12, 22]] },
                                { label: "K", blocks: [[1, 11], [12, 22]] },
                                { label: "L", blocks: [[1, 11], [12, 22]] },
                                { label: "M", blocks: [[1, 11], [12, 22]] },
                                { label: "N", blocks: [[1, 11], [12, 22]] },
                                { label: "O", blocks: [[1, 11], [12, 22]] },
                                { label: "P", blocks: [[1, 11], [12, 22]] }
                            ]
                        },
                        {
                            title: "₹100 GOLD",
                            rows: [
                                { label: "U", blocks: [[1, 10], [11, 22]] },
                                { label: "V", blocks: [[1, 10], [11, 22]] },
                                { label: "W", blocks: [[1, 10], [11, 22]] },
                                { label: "X", blocks: [[1, 10], [11, 22]] },
                                { label: "Y", blocks: [[1, 10], [11, 22]] },
                                { label: "Z", blocks: [[1, 10], [11, 22]] }
                            ]
                        },
                        {
                            title: "₹80 SILVER",
                            rows: [
                                { label: "XX", blocks: [[1, 13], [14, 26]] },
                                { label: "YY", blocks: [[1, 12], [14, 24]] },
                                { label: "ZZ", blocks: [[1, 11], [12, 22]] }
                            ]
                        }
                    ]
                },

                jaysyam: {
                    sections: [
                        {
                            title: "₹145 Diamond",
                            rows: [
                                { label: "AA", blocks: [[1, 11], [12, 20]] },
                                { label: "BB", blocks: [[1, 11], [12, 20]], spacerAfter: true },

                                { label: "A", blocks: [[1, 32]] },
                                { label: "B", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "C", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "D", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "E", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "F", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "G", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "H", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "I", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "J", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "K", blocks: [[1, 7], [8, 21], [22, 28]], spacerAfter: true },

                                { label: "L", blocks: [[1, 7], [8, 21], [22, 28]] },
                                { label: "M", blocks: [[1, 6], [7, 20], [21, 26]] },
                                { label: "N", blocks: [[1, 6], [7, 20], [21, 26]] },
                                { label: "O", blocks: [[1, 6], [7, 20], [21, 26]] }
                            ]
                        },
                        {
                            title: "₹100 Gold",
                            rows: [
                                { label: "P", blocks: [[1, 6], [7, 20], [21, 26]] },
                                { label: "Q", blocks: [[1, 6], [7, 20], [21, 26]] },
                                { label: "R", blocks: [[1, 6], [7, 20], [21, 26]] },
                                { label: "S", blocks: [[1, 6], [7, 20], [21, 26]] }
                            ]
                        },
                        {
                            title: "₹80 SILVER",
                            rows: [
                                { label: "T", blocks: [[1, 5], [6, 19], [20, 24]] },
                                { label: "U", blocks: [[1, 5], [6, 19], [20, 24]] }
                            ]
                        }
                    ]
                },

                pratap: {
                    sections: [
                        {
                            title: "₹145 PLATINUM",
                            rows: [
                                { label: "AA", blocks: [[1, 6]] },
                                { label: "BB", blocks: [[1, 6]] },
                                { label: "CC", blocks: [[1, 6]] },
                                { label: "DD", blocks: [[1, 6]] }
                            ]
                        },
                        {
                            title: "₹145 PLATINUM",
                            rows: [
                                { label: "A", blocks: [[1, 11], [12, 22]] },
                                { label: "B", blocks: [[1, 6], [7, 9], [10, 12], [13, 18]] },
                                { label: "C", blocks: [[1, 6], [7, 9], [10, 12], [13, 18]], spacerAfter: true },
                                { label: "D", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "E", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "F", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "G", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "H", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "I", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "J", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "K", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "L", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "M", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "N", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "O", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "P", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "Q", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "R", blocks: [[1, 6], [7, 16], [17, 22]] },
                                { label: "S", blocks: [[1, 5], [6, 15], [16, 20]], spacerAfter: true }
                            ]
                        },
                        {
                            title: "₹100 GOLD",
                            rows: [
                                { label: "T", blocks: [[1, 6], [7, 19], [20, 25]] },
                                { label: "U", blocks: [[1, 6], [7, 19], [20, 25]] },
                                { label: "V", blocks: [[1, 6], [7, 19], [20, 25]] },
                                { label: "W", blocks: [[1, 6], [7, 19], [20, 25]] },
                                { label: "X", blocks: [[1, 6], [7, 19], [20, 25]] },
                                { label: "Y", blocks: [[1, 6], [7, 19], [20, 25]] },
                                { label: "Z", blocks: [[1, 6], [7, 19], [20, 25]] }
                            ]
                        },
                        {
                            title: "₹80 SILVER",
                            rows: [
                                { label: "XX", blocks: [[1, 4], [5, 17], [18, 21]] },
                                { label: "YY", blocks: [[1, 5], [6, 18], [19, 22]] },
                                { label: "ZZ", blocks: [[1, 6], [7, 19], [20, 23]] }
                            ]
                        }
                    ]
                }
            };
        },

        _createSection: function (oSection) {
    var oSectionBox = new VBox({ width: "100%" });
    oSectionBox.addStyleClass("seatSection");

    oSectionBox.addItem(new Text({
        text: oSection.title,
        width: "100%",
        textAlign: "Center"
    }).addStyleClass("sectionTitle"));

    oSection.rows.forEach(function (oRow) {
        oSectionBox.addItem(this._createRow(oSection, oRow));
        if (oRow.spacerAfter) {
            oSectionBox.addItem(new VBox({ height: "1.2rem" }));
        }
    }.bind(this));

    return oSectionBox;
},

      _createRow: function (oSection, oRow) {
    var oRowBox = new HBox({
        width: "100%",
        alignItems: FlexAlignItems.Center,
        justifyContent: FlexJustifyContent.Center,
        wrap: FlexWrap.NoWrap
    });
    oRowBox.addStyleClass("seatRow");

    oRowBox.addItem(new Text({
        text: oRow.label,
        width: "2.7rem",
        textAlign: "Center"
    }).addStyleClass("rowLabel"));

    var oBlocksBox = new HBox({
        alignItems: FlexAlignItems.Center,
        justifyContent: FlexJustifyContent.Center,
        wrap: FlexWrap.NoWrap
    });
    oBlocksBox.addStyleClass("rowBlocks");

    (oRow.blocks || []).forEach(function (vBlock, iIndex) {
        var oBlock = new HBox({
            alignItems: FlexAlignItems.Center,
            justifyContent: FlexJustifyContent.Center,
            wrap: FlexWrap.NoWrap
        });
        oBlock.addStyleClass("seatBlock");

        if (Array.isArray(vBlock) && vBlock.length >= 2 && typeof vBlock[0] === "number" && typeof vBlock[1] === "number") {
            var iStart = vBlock[0];
            var iEnd = vBlock[1];

            if (iStart <= iEnd) {
                for (var i = iStart; i <= iEnd; i++) {
                    oBlock.addItem(this._createSeatButton(i, false, null, oSection.title));
                }
            } else {
                for (var j = iStart; j >= iEnd; j--) {
                    oBlock.addItem(this._createSeatButton(j, false, null, oSection.title));
                }
            }
        } else if (vBlock && typeof vBlock === "object") {
            var iObjStart = vBlock.start;
            var iObjEnd = vBlock.end;
            var aSoldSeats = vBlock.soldSeats || [];
            var bSoldAll = !!vBlock.sold;

            if (typeof iObjStart === "number" && typeof iObjEnd === "number") {
                if (iObjStart <= iObjEnd) {
                    for (var k = iObjStart; k <= iObjEnd; k++) {
                        var bSeatSold = bSoldAll || this._isInArray(k, aSoldSeats);
                        oBlock.addItem(this._createSeatButton(k, bSeatSold, null, oSection.title));
                    }
                } else {
                    for (var l = iObjStart; l >= iObjEnd; l--) {
                        var bSeatSoldRev = bSoldAll || this._isInArray(l, aSoldSeats);
                        oBlock.addItem(this._createSeatButton(l, bSeatSoldRev, null, oSection.title));
                    }
                }
            }
        }

        oBlocksBox.addItem(oBlock);

        if (iIndex < (oRow.blocks || []).length - 1) {
            oBlocksBox.addItem(new VBox({ width: "1.6rem" }).addStyleClass("blockGap"));
        }
    }.bind(this));

    oRowBox.addItem(oBlocksBox);
    return oRowBox;
},
           _createSeatButton: function (iSeatNo, bSold, sDisplayText, sSectionTitle) {
    var sSeat = sDisplayText || (bSold ? "x" : String(iSeatNo));

    var oBtn = new Button({
        text: sSeat,
        type: "Transparent",
        press: this.onSeatPress.bind(this)
    });

    oBtn.addStyleClass("seatBtn");
    oBtn.setFieldGroupIds(["seatBtns"]);
    oBtn.data("category", this._getCategoryFromSectionTitle(sSectionTitle));

    if (bSold) {
        oBtn.addStyleClass("seatSold");
        oBtn.setEnabled(false);
    } else {
        oBtn.addStyleClass("seatAvailable");
    }

    return oBtn;
},
     onSeatPress: function (oEvent) {

    var oButton = oEvent.getSource();

    if (!this.selectedSeats) {
        this.selectedSeats = [];
    }

    var sSeatId = oButton.getText();

    if (oButton.data("selected")) {

        oButton.data("selected", false);
        oButton.removeStyleClass("selectedSeat");

        this.selectedSeats = this.selectedSeats.filter(function (s) {
            return s !== sSeatId;
        });

    } else {

        var iLimit = this._iSelectedTicketCount || 1;

        if (this.selectedSeats.length >= iLimit) {
            sap.m.MessageToast.show("You can select only " + iLimit + " seats");
            return;
        }

        oButton.data("selected", true);
        oButton.addStyleClass("selectedSeat");
        this.selectedSeats.push(sSeatId);
    }

    var oSeatModel = this.getView().getModel("seat");
    var iLimitSeats = this._iSelectedTicketCount || 1;
    var iSelectedCount = this.selectedSeats.length;

    if (oSeatModel) {
        oSeatModel.setProperty("/footerVisible", iSelectedCount === iLimitSeats);
    }

    if (iSelectedCount === iLimitSeats) {
        var sCategory = oButton.data("category") || "platinum";
        this._updateTotalAmount(sCategory);
    } else if (oSeatModel) {
        oSeatModel.setProperty("/totalAmount", 0);
    }
},
onPayPress: function () {
    if (this._oTermsDialog) {
        this._oTermsDialog.open();
        return;
    }

    Fragment.load({
        id: this.getView().getId(),
        name: "project1.view.TermsDialog",
        controller: this
    }).then(function (oDialog) {
        this._oTermsDialog = oDialog;
        this.getView().addDependent(oDialog);
        oDialog.open();
    }.bind(this)).catch(function (oError) {
        console.error("Terms dialog load failed:", oError);
        sap.m.MessageToast.show("Unable to open Terms & Conditions");
    });
},
onCloseTermsDialog: function () {
    if (this._oTermsDialog) {
        this._oTermsDialog.close();
    }
},

onAcceptTerms: function () {
    if (this._oTermsDialog) {
        this._oTermsDialog.close();
    }

    sap.m.MessageToast.show("Terms Accepted");
},
    _createLegend: function () {
            var oLegend = new HBox({
                justifyContent: FlexJustifyContent.Center,
                alignItems: FlexAlignItems.Center,
                wrap: FlexWrap.Wrap
            });
            oLegend.addStyleClass("legendRow");

            oLegend.addItem(this._legendItem("Available", "legendAvailable"));
            oLegend.addItem(this._legendItem("Selected", "legendSelected"));
            oLegend.addItem(this._legendItem("Sold", "legendSold"));

            return oLegend;
        },

        _legendItem: function (sText, sClass) {
            var oItem = new HBox({
                alignItems: FlexAlignItems.Center,
                justifyContent: FlexJustifyContent.Center
            });
            oItem.addStyleClass("legendItem");

            oItem.addItem(new HTML({
                content: '<span class="legendBox ' + sClass + '"></span>'
            }));

            oItem.addItem(new Text({ text: sText }).addStyleClass("legendText"));
            return oItem;
        },

        _createScreen: function () {
    return new HTML({
        content:
            '<div class="screenWrap">' +
                '<div class="screenShape"></div>' +
                '<div class="screenCaption">All eyes this way please</div>' +
            '</div>'
    });
},

_buildShowTimes: function (aTimings, sSelectedTime) {
    return (aTimings || []).map(function (oItem) {
        return {
            time: oItem.time,
            selected: oItem.time === sSelectedTime
        };
    });
},

onShowTimePress: function (oEvent) {
    var sTime = oEvent.getSource().getText();
    var oSeatModel = this.getView().getModel("seat");
    var oAppModel = this.getOwnerComponent().getModel("app");

    if (!oSeatModel) {
        return;
    }

    var aShowTimes = oSeatModel.getProperty("/showTimes") || [];
    aShowTimes = aShowTimes.map(function (oItem) {
        return {
            time: oItem.time,
            selected: oItem.time === sTime
        };
    });

    oSeatModel.setProperty("/showTimes", aShowTimes);
    oSeatModel.setProperty("/selectedShowTime", sTime);

    var sBaseDate = oSeatModel.getProperty("/baseDateLine") || "";
    oSeatModel.setProperty("/dateLine", sBaseDate + " | " + sTime);

    if (oAppModel) {
        oAppModel.setProperty("/booking/showTime", sTime);
        oAppModel.setProperty("/selectedMovie/selectedTime", sTime);
    }
},
onMoreTicketsPress: function () {
    var oSeatModel = this.getView().getModel("seat");
    var iCurrentTickets = this._getCurrentTicketCount(oSeatModel);

    if (!this._oTicketDialog) {
        this._oTicketImage = new sap.m.Image({
            width: "70px",
            height: "70px",
            densityAware: false,
            src: this._getTicketImageSrc(1)
        }).addStyleClass("ticketBikeImage");

        this._aTicketButtons = [];

        var oButtonRow = new sap.m.HBox({
            justifyContent: FlexJustifyContent.Center,
            alignItems: FlexAlignItems.Center,
            wrap: FlexWrap.NoWrap
        }).addStyleClass("ticketNumberRow");

        for (var i = 1; i <= 6; i++) {
            var oBtn = this._createTicketButton(i);
            this._aTicketButtons.push(oBtn);
            oButtonRow.addItem(oBtn);
        }

        var oPriceRow = new sap.m.HBox({
            justifyContent: FlexJustifyContent.SpaceAround,
            width: "100%",
            alignItems: FlexAlignItems.Center
        }).addStyleClass("ticketPriceRow");

        oPriceRow.addItem(this._createPriceBlock("SILVER", "₹80", "AVAILABLE"));
        oPriceRow.addItem(this._createPriceBlock("DIAMOND", "₹145", "AVAILABLE"));
        oPriceRow.addItem(this._createPriceBlock("GOLD", "₹100", "AVAILABLE"));

        var oContent = new sap.m.VBox({
            width: "100%",
            alignItems: FlexAlignItems.Center,
            justifyContent: FlexJustifyContent.Center
        }).addStyleClass("seatDialogContent");

        oContent.addItem(this._oTicketImage);
        oContent.addItem(oButtonRow);
        oContent.addItem(oPriceRow);

        this._oTicketDialog = new sap.m.Dialog({
            contentWidth: "36rem",
            contentHeight: "28rem",
            horizontalScrolling: false,
            verticalScrolling: false,
            stretchOnPhone: true,
            draggable: true,
            resizable: false,
            customHeader: new sap.m.Bar({
                contentMiddle: [
                    new sap.m.HBox({
                        width: "100%",
                        justifyContent: "Center",
                        alignItems: "Center",
                        items: [
                            new sap.m.Title({
                                text: "How many seats?"
                            }).addStyleClass("seatDialogTitle")
                        ]
                    })
                ]
            }),
            content: [oContent],
            beginButton: new sap.m.Button({
                text: "Select Seats",
                type: "Emphasized",
                press: function () {
                    this._oTicketDialog.close();
                }.bind(this)
            }),
            endButton: new sap.m.Button({
                text: "Close",
                press: function () {
                    this._oTicketDialog.close();
                }.bind(this)
            }),
            class: "seatDialog seatDialogDark"
        });

        this.getView().addDependent(this._oTicketDialog);
    }

    this._setSelectedTicketCount(iCurrentTickets);
    this._oTicketDialog.open();
},
_createTicketButton: function (iNumber) {
    return new sap.m.Button({
        text: String(iNumber),
        type: "Transparent",
        press: function () {
            this._setSelectedTicketCount(iNumber);
        }.bind(this)
    }).addStyleClass("ticketCountBtn");
},
onSeatCountPress: function (oEvent) {

    var iSelected = parseInt(
        oEvent.getSource().getText(),
        10
    );

    this._setSelectedTicketCount(iSelected);
},

_setSelectedTicketCount: function (iSelected) {

    this._iSelectedTicketCount = iSelected;

    // clear old selected seats
    this.selectedSeats = [];

    // remove blue selected seats UI
    sap.ui.getCore().byFieldGroupId("seatBtns").forEach(function(oBtn){
        oBtn.removeStyleClass("selectedSeat");
    });

    var oSeatModel = this.getView().getModel("seat");

   if (oSeatModel) {
    oSeatModel.setProperty("/footerVisible", false);
    oSeatModel.setProperty("/totalAmount", 0);
}

    var oAppModel = this.getOwnerComponent().getModel("app");

    if (oAppModel) {
        oAppModel.setProperty("/booking/seatCount", iSelected);
        oAppModel.setProperty("/selectedMovie/selectedSeatCount", iSelected);
    }

    if (this._aTicketButtons && this._aTicketButtons.length) {

        this._aTicketButtons.forEach(function (oBtn) {

            var iBtnVal = parseInt(oBtn.getText(), 10);

            if (iBtnVal === iSelected) {
                oBtn.addStyleClass("ticketBtnSelected");
            } else {
                oBtn.removeStyleClass("ticketBtnSelected");
            }
        });
    }

  if (this._oTicketImage) {
    this._oTicketImage.setSrc(this._getTicketImageSrc(iSelected));
}

if (oSeatModel) {
    oSeatModel.setProperty("/footerVisible", false);
    oSeatModel.setProperty("/totalAmount", 0);
}
},
_getCurrentTicketCount: function (oSeatModel) {
    var iCount = 1;

    if (oSeatModel) {
        var sTickets = oSeatModel.getProperty("/tickets") || "1 Tickets";
        iCount = parseInt(sTickets, 10);
        if (isNaN(iCount)) {
            iCount = 1;
        }
    }

    if (iCount < 1) {
        iCount = 1;
    }

    if (iCount > 6) {
        iCount = 6;
    }

    return iCount;
},

_getTicketImageSrc: function (iSelected) {

    var sBase = sap.ui.require.toUrl("project1/images/");

    var mImages = {
        1: sBase + "bicycle.png",
        2: sBase + "scooter.png",
        3: sBase + "auto.png",
        4: sBase + "car1.png",
        5: sBase + "car2.png",
        6: sBase + "car3.png"
    };

    return mImages[iSelected] || mImages[1];
},

_createPriceBlock: function (sTitle, sPrice, sStatus) {
    return new sap.m.VBox({
        alignItems: FlexAlignItems.Center,
        justifyContent: FlexJustifyContent.Center,
        items: [
            new sap.m.Text({ text: sTitle }),
            new sap.m.Text({ text: sPrice }),
            new sap.m.Text({ text: sStatus })
        ]
    }).addStyleClass("ticketPriceBlock");
},
_getCategoryFromSectionTitle: function (sTitle) {
    sTitle = String(sTitle || "").toLowerCase();

    if (sTitle.indexOf("80") > -1 || sTitle.indexOf("silver") > -1) {
        return "silver";
    }

    if (sTitle.indexOf("100") > -1 || sTitle.indexOf("gold") > -1) {
        return "gold";
    }

    return "platinum";
},
_getSeatCategory: function (sRowLabel) {

    sRowLabel = String(sRowLabel || "").toUpperCase();

    // SILVER
    if (
        sRowLabel === "V" ||
        sRowLabel === "W" ||
        sRowLabel === "X" ||
        sRowLabel === "Y" ||
        sRowLabel === "Z" ||
        sRowLabel === "XX" ||
        sRowLabel === "YY" ||
        sRowLabel === "ZZ"
    ) {
        return "silver";
    }

    // GOLD
    if (
        sRowLabel === "P" ||
        sRowLabel === "Q" ||
        sRowLabel === "R" ||
        sRowLabel === "S" ||
        sRowLabel === "T" ||
        sRowLabel === "U"
    ) {
        return "gold";
    }

    // DEFAULT
    return "platinum";
},

_updateTotalAmount: function (sCategory) {

    var oSeatModel = this.getView().getModel("seat");

    if (!oSeatModel) {
        return;
    }

    var iCount = parseInt(this._iSelectedTicketCount, 10);

    if (isNaN(iCount) || iCount < 1) {
        iCount = 1;
    }

    var sSelectedCategory =
        sCategory ||
        oSeatModel.getProperty("/selectedCategory") ||
        "platinum";

    var iRate = this._mRates[sSelectedCategory] || 145;

    oSeatModel.setProperty("/selectedCategory", sSelectedCategory);
    oSeatModel.setProperty("/selectedRate", iRate);
    oSeatModel.setProperty("/totalAmount", iCount * iRate);
},

_formatHeaderDateLine: function (sDateISO, sFallbackDate, sTime) {

    var oDate = null;

    if (sDateISO) {
        oDate = new Date(sDateISO + "T00:00:00");
    } else if (sFallbackDate) {
        oDate = new Date(sFallbackDate);
    }

    var sDay = "";
    var sDateText = "";

    if (oDate && !isNaN(oDate.getTime())) {

        var aDays = [
            "SUN",
            "MON",
            "TUE",
            "WED",
            "THU",
            "FRI",
            "SAT"
        ];

        var aMonths = [
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC"
        ];

        sDay = aDays[oDate.getDay()];

        sDateText =
            oDate.getDate() +
            " " +
            aMonths[oDate.getMonth()] +
            " " +
            oDate.getFullYear();

    } else {

        sDateText = sFallbackDate || "";
    }

    return [
        sDay,
        sDateText,
        sTime
    ].filter(Boolean).join(" | ");
}
    });
});