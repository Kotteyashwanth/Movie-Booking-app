sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "project1/model/models",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/Button",
  "sap/m/VBox",
  "sap/m/HBox",
  "sap/m/Text",
  "sap/m/Title"
], function (Controller, models, MessageToast, Dialog, Button, VBox, HBox, Text, Title) {
  "use strict";

  function pickValue(primary, fallback, defaultValue) {
    if (primary !== undefined && primary !== null && primary !== "") {
      return primary;
    }
    if (fallback !== undefined && fallback !== null && fallback !== "") {
      return fallback;
    }
    return defaultValue !== undefined ? defaultValue : "N/A";
  }

  return Controller.extend("project1.controller.MovieDetails", {

    onInit: function () {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("movieDetails").attachPatternMatched(this._onMovieMatched, this);
    },
     
  onOpenTrailers: function () {
  var oAppModel = this.getOwnerComponent().getModel("app");
  if (!oAppModel) {
    MessageToast.show("App model not found");
    return;
  }

  var oMovie = oAppModel.getProperty("/selectedMovie") || {};
  if (!oMovie || (!oMovie.tmdbId && !oMovie.title)) {
    MessageToast.show("No movie selected");
    return;
  }

  // Move to trailer page
  this.getOwnerComponent().getRouter().navTo("movieTrailer", {
    movieId: oMovie.tmdbId || ""
  });
},
    

    onExit: function () {
      if (this._oFormatDialog) {
        this._oFormatDialog.destroy();
        this._oFormatDialog = null;
      }
    },

       _onMovieMatched: async function (oEvent) {
      var sMovieId = String(oEvent.getParameter("arguments").movieId || "");
      var oAppModel = this.getOwnerComponent().getModel("app");

      if (!oAppModel) {
        MessageToast.show("App model not found");
        return;
      }

      var oSelectedMovie = oAppModel.getProperty("/selectedMovie") || {};
      var sTmdbId = String(oSelectedMovie.tmdbId || "");
      var sIdToFetch = sTmdbId || sMovieId;

      if (!sIdToFetch) {
        MessageToast.show("Movie details not available");
        return;
      }

      try {
        var sApiKey = "d78a3b2a132ae5fa67e1745e9d4e458f";
        var sUrl =
          "https://api.themoviedb.org/3/movie/" +
          encodeURIComponent(sIdToFetch) +
          "?append_to_response=credits&language=en-US&api_key=" +
          encodeURIComponent(sApiKey);

        var oResponse = await fetch(sUrl);

        if (!oResponse.ok) {
          throw new Error("TMDB fetch failed: " + oResponse.status);
        }

        var oData = await oResponse.json();

        var aCast = (oData.credits && oData.credits.cast) ? oData.credits.cast : [];
        var aCrew = (oData.credits && oData.credits.crew) ? oData.credits.crew : [];

        function getCrewName(jobNames) {
          for (var i = 0; i < aCrew.length; i++) {
            if (jobNames.indexOf(aCrew[i].job) !== -1) {
              return aCrew[i].name;
            }
          }
          return "N/A";
        }

        var oMovie = {
          tmdbId: sIdToFetch,
          title: pickValue(oData.title, oSelectedMovie.title, "N/A"),
          poster: oData.poster_path
            ? "https://image.tmdb.org/t/p/w500" + oData.poster_path
            : (oSelectedMovie.poster || ""),
          genre: (oData.genres && oData.genres.length)
            ? oData.genres.map(function (g) { return g.name; }).join(", ")
            : "N/A",
          languages: oSelectedMovie.languages || "N/A",
          release: pickValue(oSelectedMovie.release, oSelectedMovie.releaseDate, "N/A"),
          duration: pickValue(
            oSelectedMovie.duration,
            oData.runtime ? String(oData.runtime) + " min" : "N/A",
            "N/A"
          ),
          displayFormat: pickValue(oSelectedMovie.displayFormat, "2D", "2D"),
          hero: aCast.length > 0 ? aCast[0].name : "N/A",
          heroine: aCast.length > 1 ? aCast[1].name : "N/A",
          director: getCrewName(["Director"]),
          producer: getCrewName(["Producer"]),
          musicDirector: getCrewName(["Original Music Composer", "Music"]),
          cinematography: getCrewName(["Director of Photography", "Cinematography"]),
          editor: getCrewName(["Editor"]),
          synopsis1: pickValue(oData.overview, oSelectedMovie.synopsis1, "N/A"),
          trailers: oSelectedMovie.trailers || [],
          trailerUrl: oSelectedMovie.trailerUrl || ""
        };

        oAppModel.setProperty("/selectedMovie", oMovie);
        oAppModel.refresh(true);
        this.getView().setModel(oAppModel, "app");

      } catch (e) {
        console.error(e);
        MessageToast.show("Failed to load movie details");
      }
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("home");
    },

    onBookTickets: function () {
      var oAppModel = this.getOwnerComponent().getModel("app");

      if (!oAppModel) {
        MessageToast.show("App model not found");
        return;
      }

      var oMovie = oAppModel.getProperty("/selectedMovie") || {};
      if (!oMovie || !oMovie.title) {
        MessageToast.show("No movie selected");
        return;
      }

      if (this._isSpecialFormatMovie(oMovie.title)) {
        this._openFormatDialog(oMovie);
        return;
      }

      var sDefaultFormat = this._getDefaultFormat(oMovie);
      this._applySelectedFormatAndNavigate(sDefaultFormat);
    },

    _normalizeTitle: function (sTitle) {
      return String(sTitle || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    },

    _isSpecialFormatMovie: function (sTitle) {
      var s = this._normalizeTitle(sTitle);

      return (
        s.indexOf("spider man brand new day") > -1 ||
        s.indexOf("spiderman brand new day") > -1 ||
        s.indexOf("spider-man brand new day") > -1 ||
        s.indexOf("avengers doomsday") > -1 ||
        s.indexOf("avengers dooms day") > -1
      );
    },

    _getDefaultFormat: function (oMovie) {
      return pickValue(oMovie && oMovie.displayFormat, "2D", "2D");
    },

    _createFormatButton: function (sText, sFormat, sWidth) {
      return new Button({
        text: sText,
        width: sWidth,
        type: "Default",
        press: function () {
          this._applySelectedFormatAndNavigate(sFormat);
        }.bind(this)
      });
    },

    _openFormatDialog: function (oMovie) {
      var sMovieTitle = (oMovie && oMovie.title) ? oMovie.title : "Select language and format";

      if (this._oFormatDialog) {
        this._oFormatDialog.setTitle(sMovieTitle);
        this._oFormatDialog.open();
        return;
      }

      var oView = this.getView();
      var sBtnWidth = "5.8rem";

      this._oFormatDialog = new Dialog({
        title: sMovieTitle,
        contentWidth: "31rem",
        draggable: true,
        resizable: false,
        content: [
          new VBox({
            width: "100%",
            class: "sapUiSmallMargin",
            items: [
              new Title({
                text: "Select language and format",
                level: "H3"
              }),

              new Text({
                text: "Telugu",
                class: "sapUiSmallMarginTop sapUiTinyMarginBottom"
              }),

              new HBox({
                width: "100%",
                alignItems: "Center",
                justifyContent: "Start",
                items: [
                  this._createFormatButton("2D", "Telugu 2D", sBtnWidth),
                  this._createFormatButton("3D", "Telugu 3D", sBtnWidth).addStyleClass("sapUiSmallMarginBegin")
                ]
              }),

              new Text({
                text: "English",
                class: "sapUiMediumMarginTop sapUiTinyMarginBottom"
              }),

              new HBox({
                width: "100%",
                alignItems: "Center",
                justifyContent: "Start",
                items: [
                  this._createFormatButton("2D", "English 2D", sBtnWidth),
                  this._createFormatButton("3D", "English 3D", sBtnWidth).addStyleClass("sapUiSmallMarginBegin")
                ]
              })
            ]
          })
        ],
        endButton: new Button({
          text: "Close",
          press: function () {
            this._oFormatDialog.close();
          }.bind(this)
        })
      });

      oView.addDependent(this._oFormatDialog);
      this._oFormatDialog.open();
    },

    _applySelectedFormatAndNavigate: function (sDisplayFormat) {
      var oAppModel = this.getOwnerComponent().getModel("app");

      if (!oAppModel) {
        MessageToast.show("App model not found");
        return;
      }

      var oMovie = oAppModel.getProperty("/selectedMovie") || {};
      oMovie.displayFormat = sDisplayFormat || "2D";

      if (sDisplayFormat && sDisplayFormat.indexOf("English") > -1) {
        oMovie.language = "English";
      } else if (sDisplayFormat && sDisplayFormat.indexOf("Telugu") > -1) {
        oMovie.language = "Telugu";
      }

      oAppModel.setProperty("/selectedMovie", oMovie);
      oAppModel.refresh(true);
      models.saveAppModel(oAppModel);

      if (this._oFormatDialog) {
        this._oFormatDialog.close();
      }

      this.getOwnerComponent().getRouter().navTo("theatreList");
    }

  });
});