sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "project1/model/models",
  "sap/m/MessageToast"
], function (Controller, models, MessageToast) {
  "use strict";

  function pickValue(primary, fallback) {
    if (primary !== undefined && primary !== null && primary !== "") {
      return primary;
    }
    if (fallback !== undefined && fallback !== null && fallback !== "") {
      return fallback;
    }
    return "N/A";
  }

  return Controller.extend("project1.controller.MovieDetails", {

    onInit: function () {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("movieDetails").attachPatternMatched(this._onMovieMatched, this);
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
          title: pickValue(oData.title, oSelectedMovie.title),
          poster: oData.poster_path
            ? "https://image.tmdb.org/t/p/w500" + oData.poster_path
            : (oSelectedMovie.poster || ""),
          genre: (oData.genres && oData.genres.length)
            ? oData.genres.map(function (g) { return g.name; }).join(", ")
            : "N/A",
            languages: oSelectedMovie.languages || "N/A",
          release: pickValue(oSelectedMovie.release, oSelectedMovie.releaseDate, "N/A"),
duration: pickValue(oSelectedMovie.duration, oData.runtime ? String(oData.runtime) + " min" : "N/A"),
          hero: aCast.length > 0 ? aCast[0].name : "N/A",
          heroine: aCast.length > 1 ? aCast[1].name : "N/A",
          director: getCrewName(["Director"]),
          producer: getCrewName(["Producer"]),
          musicDirector: getCrewName(["Original Music Composer", "Music"]),
          cinematography: getCrewName(["Director of Photography", "Cinematography"]),
          editor: getCrewName(["Editor"]),
          synopsis1: pickValue(oData.overview, oSelectedMovie.synopsis1)
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

      var oMovie = oAppModel.getProperty("/selectedMovie");

      if (!oMovie) {
        MessageToast.show("No movie selected");
        return;
      }

      models.saveAppModel(oAppModel);
      this.getOwnerComponent().getRouter().navTo("theatreList");
    }

  });
});