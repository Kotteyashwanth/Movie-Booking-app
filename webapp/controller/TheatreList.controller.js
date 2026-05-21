// webapp/controller/TheatreList.controller.js
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/Fragment"
], function (Controller, JSONModel, MessageToast, Fragment) {
    "use strict";

    return Controller.extend("project1.controller.TheatreList", {

        onInit: function () {
            this._favoriteTheatres = this._favoriteTheatres || {};

            this.getOwnerComponent()
                .getRouter()
                .getRoute("theatreList")
                .attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oAppModel = this.getOwnerComponent().getModel("app");
            var oMovie = oAppModel ? oAppModel.getProperty("/selectedMovie") : null;

            if (!oMovie || !oMovie.title) {
                this.getOwnerComponent().getRouter().navTo("home");
                return;
            }

            var oReleaseDate = this._parseReleaseDate(oMovie.release);
            if (!oReleaseDate) {
                oReleaseDate = new Date();
                oReleaseDate.setHours(0, 0, 0, 0);
            }

            var oEndDate = new Date(oReleaseDate);
            oEndDate.setDate(oEndDate.getDate() + 6);

            var aDates = this._generateDatesBetween(oReleaseDate, oEndDate);
            if (aDates.length > 0) {
                aDates[0].selected = true;
            }

            var sInitialDateISO = aDates.length ? aDates[0].dateISO : "";
            var sMovieTitle = oMovie.title || oMovie.movieTitle || "";
            var sDisplayFormat = oMovie.displayFormat || "2D";
            var sLanguage = oMovie.language || oMovie.languages || "Telugu";

            var oData = {
                movieTitle: sMovieTitle,
                movieDuration: oMovie.duration || "",
                selectedDateLabel: aDates.length ? aDates[0].label : "",
                selectedDateISO: sInitialDateISO,
                selectedTime: "",
                selectedTheatreName: "",
                selectedTheatreArea: "",
                selectedSeatCount: 1,
                seatImage: sap.ui.require.toUrl("project1/images/bicycle.png"),
                seatIcon: sap.ui.require.toUrl("project1/images/bicycle.png"),
                dates: aDates,
                selectedTheatres: this._getTheatresByMovieRuntime(oMovie, sInitialDateISO)
            };

            if (this.oModel) {
                this.oModel.setData(oData);
            } else {
                this.oModel = new JSONModel(oData);
                this.getView().setModel(this.oModel);
            }

            this.getView().setModel(oAppModel, "app");

            if (oAppModel) {
                oAppModel.setProperty("/selectedMovie/title", sMovieTitle);
                oAppModel.setProperty("/selectedMovie/movieTitle", sMovieTitle);
                oAppModel.setProperty("/selectedMovie/language", sLanguage);
                oAppModel.setProperty("/selectedMovie/displayFormat", sDisplayFormat);

                oAppModel.setProperty("/selectedMovie/bookingStartDate", this._formatDisplayDate(oReleaseDate));
                oAppModel.setProperty("/selectedMovie/bookingEndDate", this._formatDisplayDate(oEndDate));
                oAppModel.setProperty("/selectedMovie/selectedDate", oData.selectedDateLabel);
                oAppModel.setProperty("/selectedMovie/selectedDateISO", sInitialDateISO);
                oAppModel.setProperty("/selectedMovie/selectedTime", "");
                oAppModel.setProperty("/selectedMovie/selectedTheatre", "");
                oAppModel.setProperty("/selectedMovie/selectedArea", "");
                oAppModel.setProperty("/selectedMovie/selectedSeatCount", 1);

                oAppModel.setProperty("/seatImage", sap.ui.require.toUrl("project1/images/bicycle.png"));
                oAppModel.setProperty("/seatIcon", sap.ui.require.toUrl("project1/images/bicycle.png"));
                oAppModel.setProperty("/selectedTheatres", oData.selectedTheatres);
            }
        },

        onFavoritePress: function (oEvent) {
            var oIcon = oEvent.getSource();
            var oContext = oIcon.getBindingContext();

            if (!oContext) {
                return;
            }

            var oTheatre = oContext.getObject();
            var bNewState = !oTheatre.favorite;

            this._favoriteTheatres = this._favoriteTheatres || {};
            this._favoriteTheatres[oTheatre.name] = bNewState;

            oContext.getModel().setProperty(oContext.getPath() + "/favorite", bNewState);
        },

        onDatePress: function (oEvent) {
            var oDate = oEvent.getSource().getBindingContext().getObject();
            var aDates = this.oModel.getProperty("/dates") || [];

            aDates.forEach(function (d) {
                d.selected = (d.key === oDate.key);
            });

            this.oModel.setProperty("/dates", aDates);
            this.oModel.setProperty("/selectedDateLabel", oDate.label);
            this.oModel.setProperty("/selectedDateISO", oDate.dateISO);

            var oAppModel = this.getOwnerComponent().getModel("app");
            if (oAppModel) {
                oAppModel.setProperty("/selectedMovie/selectedDate", oDate.label);
                oAppModel.setProperty("/selectedMovie/selectedDateISO", oDate.dateISO);
            }

            this._updateTheatresForSelectedDate(oDate.dateISO);
        },

        _updateTheatresForSelectedDate: function (sDateISO) {
            var oAppModel = this.getOwnerComponent().getModel("app");
            var oMovie = oAppModel ? oAppModel.getProperty("/selectedMovie") : null;

            if (!oMovie) {
                return;
            }

            var aTheatres = this._getTheatresByMovieRuntime(oMovie, sDateISO);
            this.oModel.setProperty("/selectedTheatres", aTheatres);

            if (oAppModel) {
                oAppModel.setProperty("/selectedTheatres", aTheatres);
            }
        },

        onTimePress: function (oEvent) {
            var oButton = oEvent.getSource();
            var oContext = oButton.getBindingContext();
            var oTimeObj = oContext ? oContext.getObject() : null;

            if (!oTimeObj || !oTimeObj.time) {
                MessageToast.show("Time not available");
                return;
            }

            this.oModel.setProperty("/selectedTime", oTimeObj.time);
            this.oModel.setProperty("/selectedTheatreName", oTimeObj.theatreName);
            this.oModel.setProperty("/selectedTheatreArea", oTimeObj.theatreArea);

            var oAppModel = this.getOwnerComponent().getModel("app");
            if (oAppModel) {
                var sMovieTitle =
                    oAppModel.getProperty("/selectedMovie/title") ||
                    oAppModel.getProperty("/selectedMovie/movieTitle") ||
                    "";

                var sLanguage =
                    oAppModel.getProperty("/selectedMovie/language") ||
                    "Telugu";

                var sDate =
                    oAppModel.getProperty("/selectedMovie/selectedDate") ||
                    this.oModel.getProperty("/selectedDateLabel") ||
                    "";

                var sDateISO =
                    oAppModel.getProperty("/selectedMovie/selectedDateISO") ||
                    this.oModel.getProperty("/selectedDateISO") ||
                    "";

                oAppModel.setProperty("/selectedMovie/title", sMovieTitle);
                oAppModel.setProperty("/selectedMovie/movieTitle", sMovieTitle);
                oAppModel.setProperty("/selectedMovie/language", sLanguage);

                oAppModel.setProperty("/selectedMovie/selectedTime", oTimeObj.time);
                oAppModel.setProperty("/selectedMovie/selectedTheatre", oTimeObj.theatreName);
                oAppModel.setProperty("/selectedMovie/selectedArea", oTimeObj.theatreArea);
                oAppModel.setProperty("/selectedMovie/selectedDate", sDate);
                oAppModel.setProperty("/selectedMovie/selectedDateISO", sDateISO);

                oAppModel.setProperty("/booking/movieTitle", sMovieTitle);
                oAppModel.setProperty("/booking/theatreName", oTimeObj.theatreName);
                oAppModel.setProperty("/booking/showTime", oTimeObj.time);
                oAppModel.setProperty("/booking/selectedDate", sDate);
                oAppModel.setProperty("/booking/selectedDateISO", sDateISO);
            }

            MessageToast.show(oTimeObj.theatreName + " - " + oTimeObj.time);
        },

        onBookTickets: function (oEvent) {
            var oButton = oEvent.getSource();
            var oTheatre = this._getTheatreObjectFromControl(oButton);

            if (!oTheatre) {
                MessageToast.show("Theatre not found");
                return;
            }

            var sDate = this.oModel.getProperty("/selectedDateLabel");
            var sDateISO = this.oModel.getProperty("/selectedDateISO");
            var sTime = this.oModel.getProperty("/selectedTime") || oTheatre.showTime;

            if (!sDate) {
                MessageToast.show("Please select a date");
                return;
            }

            if (!sTime) {
                MessageToast.show("Please select a show time");
                return;
            }

            this.oModel.setProperty("/selectedTime", sTime);
            this.oModel.setProperty("/selectedTheatreName", oTheatre.name);
            this.oModel.setProperty("/selectedTheatreArea", oTheatre.area);

            var oAppModel = this.getOwnerComponent().getModel("app");
            if (oAppModel) {
                var sMovieTitle =
                    oAppModel.getProperty("/selectedMovie/title") ||
                    oAppModel.getProperty("/selectedMovie/movieTitle") ||
                    "";

                var sDisplayFormat =
                    oAppModel.getProperty("/selectedMovie/displayFormat") || "";

                var sLanguage =
                    oAppModel.getProperty("/selectedMovie/language") ||
                    "Telugu";

                if (sDisplayFormat.indexOf("English") > -1) {
                    sLanguage = "English";
                } else if (sDisplayFormat.indexOf("Telugu") > -1) {
                    sLanguage = "Telugu";
                }

                oAppModel.setProperty("/selectedMovie/title", sMovieTitle);
                oAppModel.setProperty("/selectedMovie/movieTitle", sMovieTitle);
                oAppModel.setProperty("/selectedMovie/language", sLanguage);
                oAppModel.setProperty("/selectedMovie/displayFormat", sDisplayFormat || "2D");

                oAppModel.setProperty("/selectedMovie/selectedTheatre", oTheatre.name);
                oAppModel.setProperty("/selectedMovie/selectedArea", oTheatre.area);
                oAppModel.setProperty("/selectedMovie/selectedTime", sTime);
                oAppModel.setProperty("/selectedMovie/selectedDate", sDate);
                oAppModel.setProperty("/selectedMovie/selectedDateISO", sDateISO);

                oAppModel.setProperty("/booking/movieTitle", sMovieTitle);
                oAppModel.setProperty("/booking/theatreName", oTheatre.name);
                oAppModel.setProperty("/booking/showTime", sTime);
                oAppModel.setProperty("/booking/selectedDate", sDate);
                oAppModel.setProperty("/booking/selectedDateISO", sDateISO);

                oAppModel.setProperty("/seatImage", sap.ui.require.toUrl("project1/images/bicycle.png"));
                oAppModel.setProperty("/seatIcon", sap.ui.require.toUrl("project1/images/bicycle.png"));
                oAppModel.setProperty("/selectedSeatCount", 1);
            }

            this._openSeatCountDialog();
        },

        _openSeatCountDialog: function () {
            var oView = this.getView();
            var sDefaultImage = sap.ui.require.toUrl("project1/images/bicycle.png");
            var oAppModel = this.getOwnerComponent().getModel("app");

            if (oAppModel) {
                oAppModel.setProperty("/seatImage", sDefaultImage);
                oAppModel.setProperty("/seatIcon", sDefaultImage);
                oAppModel.setProperty("/selectedSeatCount", 1);
            }

            if (this._oSeatCountDialog) {
                this._oSeatCountDialog.open();
                return;
            }

            if (this._oSeatDialogPromise) {
                this._oSeatDialogPromise.then(function (oDialog) {
                    if (oDialog) {
                        oDialog.open();
                    }
                });
                return;
            }

            this._oSeatDialogPromise = Fragment.load({
                id: oView.getId(),
                name: "project1.view.SeatCountDialog",
                controller: this
            }).then(function (oDialog) {
                this._oSeatCountDialog = oDialog;
                oView.addDependent(oDialog);
                oDialog.open();
                return oDialog;
            }.bind(this)).catch(function (oError) {
                this._oSeatDialogPromise = null;
                console.error("SeatCountDialog load failed:", oError);
                MessageToast.show("Unable to open seat dialog");
            }.bind(this));
        },

        onSeatCountPress: function (oEvent) {
            var oButton = oEvent.getSource();
            var iCount = parseInt(oButton.getText(), 10);

            if (isNaN(iCount)) {
                return;
            }

            var sSeatImage = this._getSeatImageByCount(iCount);
            var oAppModel = this.getOwnerComponent().getModel("app");

            if (oAppModel) {
                oAppModel.setProperty("/selectedSeatCount", iCount);
                oAppModel.setProperty("/seatImage", sSeatImage);
                oAppModel.setProperty("/seatIcon", sSeatImage);
            }

            MessageToast.show("Selected Seats: " + iCount);
        },

        onSelectSeats: function () {
            var oAppModel = this.getOwnerComponent().getModel("app");

            var iCount = 1;
            var sTheatreName = "";
            var sMovieTitle = "";
            var sShowTime = "";
            var sSelectedDate = "";

            if (oAppModel) {
                iCount = oAppModel.getProperty("/selectedSeatCount") || 1;
                sTheatreName = oAppModel.getProperty("/booking/theatreName") || oAppModel.getProperty("/selectedMovie/selectedTheatre") || "";
                sMovieTitle = oAppModel.getProperty("/booking/movieTitle") || oAppModel.getProperty("/selectedMovie/title") || oAppModel.getProperty("/selectedMovie/movieTitle") || "";
                sShowTime = oAppModel.getProperty("/booking/showTime") || oAppModel.getProperty("/selectedMovie/selectedTime") || "";
                sSelectedDate = oAppModel.getProperty("/booking/selectedDate") || oAppModel.getProperty("/selectedMovie/selectedDate") || "";

                oAppModel.setProperty("/booking/seatCount", iCount);
                oAppModel.setProperty("/booking/theatreName", sTheatreName);
                oAppModel.setProperty("/booking/movieTitle", sMovieTitle);
                oAppModel.setProperty("/booking/showTime", sShowTime);
                oAppModel.setProperty("/booking/selectedDate", sSelectedDate);
            }

            if (this._oSeatCountDialog) {
                this._oSeatCountDialog.close();
            }

            this.getOwnerComponent()
                .getRouter()
                .navTo("seatSelection", {
                    theatreName: this._getTheatreKey(sTheatreName),
                    seats: iCount
                });
        },

        _getTheatreKey: function (sTheatreName) {
            var s = String(sTheatreName || "").toLowerCase();

            if (s.indexOf("krishna teja") > -1 || s.indexOf("krishnateja") > -1) {
                return "krishnaTeja";
            }

            if (s.indexOf("sv cineplex") > -1 || s.indexOf("svcineplex") > -1 || s.indexOf("svcin") > -1) {
                return "svCineplex";
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

            return "krishnaTeja";
        },

        onBack: function () {
            this.getOwnerComponent().getRouter().navTo("movieDetails");
        },

        _getSeatImageByCount: function (iCount) {
            var sBasePath = sap.ui.require.toUrl("project1/images/");
            var mImages = {
                1: sBasePath + "bicycle.png",
                2: sBasePath + "scooter.png",
                3: sBasePath + "auto.png",
                4: sBasePath + "car1.png",
                5: sBasePath + "car2.png",
                6: sBasePath + "car3.png"
            };

            return mImages[iCount] || (sBasePath + "bicycle.png");
        },

       _getTheatresByMovieRuntime: function (oMovie, sDateISO) {
    var iDuration = this._parseDurationToMinutes(oMovie.duration);

    var sTitle = String(oMovie.title || oMovie.movieTitle || "").toLowerCase();
    var sLanguage = String(oMovie.language || oMovie.languages || "").toLowerCase();
    var sFormat = String(oMovie.displayFormat || "").toLowerCase();

    var bSpecialMovie =
        sTitle.indexOf("spider-man") > -1 ||
        sTitle.indexOf("avengers") > -1 ||
        sTitle.indexOf("doomsday") > -1;

    var aTheatres = [];

    if (bSpecialMovie) {
        // TELUGU 2D
        if (sLanguage.indexOf("telugu") > -1 && sFormat.indexOf("2d") > -1) {
            aTheatres = [
                { name: "Pratap Theater", area: "Jayasyam Road, Tirupati", format: "Telugu 2D • 4K Dolby Atmos", offset: 0 }
            ];
        }

        // TELUGU 3D
        else if (sLanguage.indexOf("telugu") > -1 && sFormat.indexOf("3d") > -1) {
            aTheatres = [
                { name: "Krishna Teja", area: "Tata Nagar, Tirupati", format: "Telugu 3D • 4K Dolby (Newly Renovated)", offset: 0 },
                { name: "CS Cinemas (Devendra)", area: "Leela Mahal Road, Tirupati", format: "Telugu 3D • 4K Dolby Atmos", offset: 10 },
                { name: "PGR Cinemas", area: "Tata Nagar, Tirupati", format: "Telugu 3D • 4K Dolby Atmos", offset: 20 },
                { name: "NVR Sandhya", area: "Jayasyam Road, Tirupati", format: "Telugu 3D • 4K Dolby Atmos", offset: 30 },
                { name: "Palani Cinemas", area: "Royal Nagar, Tirupati", format: "Telugu 3D • 2K, 7.1 Dolby Digital", offset: 40 }
            ];
        }

        // ENGLISH 2D
        else if (sLanguage.indexOf("english") > -1 && sFormat.indexOf("2d") > -1) {
            aTheatres = [
                { name: "SV Cineplex", area: "Dr. Mahal Road, Tirupati", format: "English 2D • 4K Dolby Atmos", offset: 0 }
            ];
        }

        // ENGLISH 3D
        else if (sLanguage.indexOf("english") > -1 && sFormat.indexOf("3d") > -1) {
            aTheatres = [
                { name: "NVR Jayasyam", area: "Tata Nagar, Tirupati", format: "English 3D • 4K Dolby Atmos", offset: 0 }
            ];
        }

        // fallback for special movies
        else {
            aTheatres = [
                { name: "Pratap Theater", area: "Jayasyam Road, Tirupati", format: "4K Dolby Atmos", offset: 0 }
            ];
        }
    } else {
        // all other movies keep your normal full list
        aTheatres = [
            { name: "PGR Cinemas", area: "Tata Nagar, Tirupati", format: "4K Dolby Atmos", offset: 0 },
            { name: "NVR Jayasyam", area: "Tata Nagar, Tirupati", format: "4K Dolby Atmos", offset: 5 },
            { name: "NVR Sandhya", area: "Jayasyam Road, Tirupati", format: "4K Dolby Atmos", offset: 10 },
            { name: "SV Cineplex", area: "Dr. Mahal Road, Tirupati", format: "4K Dolby Atmos", offset: 15 },
            { name: "CS Cinemas (Devendra)", area: "Leela Mahal Road, Tirupati", format: "4K Dolby Atmos", offset: 20 },
            { name: "Palani Cinemas", area: "Royal Nagar, Tirupati", format: "2K, 7.1 Dolby Digital", offset: 25 },
            { name: "Krishna Teja", area: "Tata Nagar, Tirupati", format: "4K Dolby (Newly Renovated)", offset: 30 },
            { name: "Pratap Theater", area: "Jayasyam Road, Tirupati", format: "4K Dolby Atmos", offset: 35 }
        ];
    }

    this._favoriteTheatres = this._favoriteTheatres || {};

    return aTheatres.map(function (oTheatre, iIndex) {
        return {
            name: oTheatre.name,
            area: oTheatre.area,
            format: oTheatre.format,
            favorite: !!this._favoriteTheatres[oTheatre.name],
            timings: this._generateFourShowTimings(
                iDuration,
                oTheatre.offset,
                oTheatre.name,
                oTheatre.area,
                iIndex
            )
        };
    }.bind(this));
},

        _generateFourShowTimings: function (iDurationMinutes, iOffsetMinutes, sTheatreName, sTheatreArea, iTheatreIndex) {
            var iGapMinutes = 30;

            var aWindows = [
                { label: "Morning", start: "11:00 AM" },
                { label: "Afternoon", start: "2:15 PM" },
                { label: "Evening", start: "6:15 PM" },
                { label: "Night", start: "9:15 PM" }
            ];

            var iOffset = (parseInt(iOffsetMinutes, 10) || 0);
            iOffset = Math.round(iOffset / 5) * 5;

            var iPrevEnd = null;

            return aWindows.map(function (oWindow) {
                var iStart = this._timeToMinutes(oWindow.start) + iOffset;

                if (iPrevEnd !== null) {
                    iStart = Math.max(iStart, iPrevEnd + iGapMinutes);
                }

                iStart = this._roundUpToFive(iStart);

                var iEnd = iStart + iDurationMinutes;
                iPrevEnd = iEnd;

                return {
                    window: oWindow.label,
                    time: this._minutesToTime(iStart),
                    endTime: this._minutesToTime(iEnd),
                    theatreName: sTheatreName,
                    theatreArea: sTheatreArea
                };
            }.bind(this));
        },

        _roundUpToFive: function (iMinutes) {
            return Math.ceil(iMinutes / 5) * 5;
        },

        _getTheatreObjectFromControl: function (oControl) {
            var oCurrent = oControl;

            while (oCurrent) {
                if (oCurrent.getBindingContext) {
                    var oContext = oCurrent.getBindingContext();
                    if (oContext) {
                        var oObj = oContext.getObject();
                        if (oObj && oObj.name && oObj.area) {
                            return oObj;
                        }
                    }
                }
                oCurrent = oCurrent.getParent ? oCurrent.getParent() : null;
            }

            return null;
        },

        _parseDurationToMinutes: function (sDuration) {
            if (!sDuration || typeof sDuration !== "string") {
                return 150;
            }

            var m = sDuration.match(/(\d+)\s*h\s*(\d+)\s*m/i);
            if (m) {
                return (parseInt(m[1], 10) * 60) + parseInt(m[2], 10);
            }

            var mHours = sDuration.match(/(\d+)\s*h/i);
            if (mHours) {
                return parseInt(mHours[1], 10) * 60;
            }

            var mMinutes = sDuration.match(/(\d+)\s*m/i);
            if (mMinutes) {
                return parseInt(mMinutes[1], 10);
            }

            return 150;
        },

        _timeToMinutes: function (sTime) {
            var m = sTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!m) {
                return 0;
            }

            var iHour = parseInt(m[1], 10);
            var iMinute = parseInt(m[2], 10);
            var sPeriod = m[3].toUpperCase();

            if (sPeriod === "AM" && iHour === 12) {
                iHour = 0;
            }
            if (sPeriod === "PM" && iHour !== 12) {
                iHour += 12;
            }

            return (iHour * 60) + iMinute;
        },

        _minutesToTime: function (iMinutes) {
            var iHour24 = Math.floor(iMinutes / 60);
            var iMinute = iMinutes % 60;
            var sPeriod = iHour24 >= 12 ? "PM" : "AM";
            var iHour12 = iHour24 % 12;

            if (iHour12 === 0) {
                iHour12 = 12;
            }

            return this._pad(iHour12) + ":" + this._pad(iMinute) + " " + sPeriod;
        },

        _pad: function (iValue) {
            return iValue < 10 ? "0" + iValue : String(iValue);
        },

        _parseReleaseDate: function (sRelease) {
            if (!sRelease || typeof sRelease !== "string") {
                return null;
            }

            var m = sRelease.trim().match(/(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+)(?:\s+(\d{4}))?/);
            if (!m) {
                return null;
            }

            var iDay = parseInt(m[1], 10);
            var sMonth = m[2].toLowerCase();
            var iYear = m[3] ? parseInt(m[3], 10) : new Date().getFullYear();

            var oMonthMap = {
                jan: 0, january: 0,
                feb: 1, february: 1,
                mar: 2, march: 2,
                apr: 3, april: 3,
                may: 4,
                jun: 5, june: 5,
                jul: 6, july: 6,
                aug: 7, august: 7,
                sep: 8, sept: 8, september: 8,
                oct: 9, october: 9,
                nov: 10, november: 10,
                dec: 11, december: 11
            };

            var iMonth = oMonthMap[sMonth];
            if (iMonth === undefined) {
                return null;
            }

            return new Date(iYear, iMonth, iDay);
        },

        _generateDatesBetween: function (oStartDate, oEndDate) {
            if (!oStartDate || !oEndDate || isNaN(oStartDate.getTime()) || isNaN(oEndDate.getTime())) {
                return [];
            }

            var aWeekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
            var aMonths = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
            var aDates = [];

            var oCurrent = new Date(oStartDate);
            oCurrent.setHours(0, 0, 0, 0);

            var oLast = new Date(oEndDate);
            oLast.setHours(0, 0, 0, 0);

            var i = 1;

            while (oCurrent <= oLast) {
                var sDateISO =
                    oCurrent.getFullYear() + "-" +
                    this._pad(oCurrent.getMonth() + 1) + "-" +
                    this._pad(oCurrent.getDate());

                aDates.push({
                    key: "d" + i,
                    day: aWeekDays[oCurrent.getDay()],
                    date: String(oCurrent.getDate()),
                    month: aMonths[oCurrent.getMonth()],
                    dateISO: sDateISO,
                    label: aWeekDays[oCurrent.getDay()] + " " + oCurrent.getDate() + " " + aMonths[oCurrent.getMonth()],
                    selected: false
                });

                oCurrent.setDate(oCurrent.getDate() + 1);
                i++;
            }

            return aDates;
        },

        _formatDisplayDate: function (oDate) {
            if (!oDate || isNaN(oDate.getTime())) {
                return "";
            }

            var aMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return oDate.getDate() + " " + aMonths[oDate.getMonth()] + " " + oDate.getFullYear();
        }

    });
});