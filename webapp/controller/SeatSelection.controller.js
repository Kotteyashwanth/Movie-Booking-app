sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Button",
    "sap/ui/core/HTML",
    "sap/m/FlexAlignItems",
    "sap/m/FlexJustifyContent",
    "sap/m/FlexWrap"
], function (
    Controller,
    VBox,
    HBox,
    Text,
    Button,
    HTML,
    FlexAlignItems,
    FlexJustifyContent,
    FlexWrap
) {
    "use strict";

    return Controller.extend("project1.controller.SeatSelection", {

        onInit: function () {
            this._bBuilt = false;
            this._sTheatreKey = "";

            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("seatSelection").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments") || {};
            var sTheatreName = "";

            if (oArgs.theatreName) {
                try {
                    sTheatreName = decodeURIComponent(oArgs.theatreName);
                } catch (e) {
                    sTheatreName = oArgs.theatreName;
                }
            }

            this._sTheatreKey = this._normalizeKey(sTheatreName) || "krishnaTeja";
            this._bBuilt = false;

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
                oSectionBox.addItem(this._createRow(oRow));
                if (oRow.spacerAfter) {
                    oSectionBox.addItem(new VBox({ height: "1.2rem" }));
                }
            }.bind(this));

            return oSectionBox;
        },

        _createRow: function (oRow) {
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
                            oBlock.addItem(this._createSeatButton(i, false));
                        }
                    } else {
                        for (var j = iStart; j >= iEnd; j--) {
                            oBlock.addItem(this._createSeatButton(j, false));
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
                                oBlock.addItem(this._createSeatButton(k, bSeatSold));
                            }
                        } else {
                            for (var l = iObjStart; l >= iObjEnd; l--) {
                                var bSeatSoldRev = bSoldAll || this._isInArray(l, aSoldSeats);
                                oBlock.addItem(this._createSeatButton(l, bSeatSoldRev));
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

        _createSeatButton: function (iSeatNo, bSold, sDisplayText) {
            var sSeat = sDisplayText || (bSold ? "x" : String(iSeatNo));

            var oBtn = new Button({
                text: sSeat,
                type: "Transparent",
                press: this.onSeatPress.bind(this)
            });

            oBtn.addStyleClass("seatBtn");

            if (bSold) {
                oBtn.addStyleClass("seatSold");
                oBtn.setEnabled(false);
            } else {
                oBtn.addStyleClass("seatAvailable");
            }

            return oBtn;
        },

        onSeatPress: function (oEvent) {
            var oBtn = oEvent.getSource();

            if (oBtn.hasStyleClass("seatSold")) {
                return;
            }

            if (oBtn.hasStyleClass("seatSelected")) {
                oBtn.removeStyleClass("seatSelected");
                oBtn.addStyleClass("seatAvailable");
            } else {
                oBtn.removeStyleClass("seatAvailable");
                oBtn.addStyleClass("seatSelected");
            }
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
        }

    });
});