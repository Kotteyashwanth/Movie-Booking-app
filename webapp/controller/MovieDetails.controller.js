sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "project1/model/models",
  "sap/m/MessageToast"
], function (Controller, models, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.MovieDetails", {

    onInit: function () {

      this.oRouter = this.getOwnerComponent().getRouter();

      this.oRouter
        .getRoute("movieDetails")
        .attachPatternMatched(this._onMovieMatched, this);

    },

    _onMovieMatched: function (oEvent) {

      var sMovieId =
        oEvent.getParameter("arguments").movieId;

      var oAppModel =
        this.getOwnerComponent().getModel("app");

      if (!oAppModel) {
        MessageToast.show("App model not found");
        return;
      }

      var aMovies =
        oAppModel.getProperty("/movies") || [];

      var oMovie = null;

      for (var i = 0; i < aMovies.length; i++) {

        var oCurrent = aMovies[i];

        var sCurrentId =
          String(
            oCurrent.id ||
            oCurrent.movieId ||
            oCurrent.ID ||
            oCurrent.MovieId ||
            i
          );

        if (sCurrentId === String(sMovieId)) {

          oMovie = Object.assign({}, oCurrent);
          break;

        }
      }

     if (!oMovie) {

    return;

}

      // Important Fix
      oAppModel.setProperty("/selectedMovie", null);
      oAppModel.refresh(true);

      oAppModel.setProperty("/selectedMovie", oMovie);
      oAppModel.refresh(true);

      this.getView().setModel(oAppModel, "app");

    },

    onBack: function () {

      this.getOwnerComponent()
        .getRouter()
        .navTo("home");

    },

    onBookTickets: function () {

      var oAppModel =
        this.getOwnerComponent().getModel("app");

      if (!oAppModel) {

        MessageToast.show("App model not found");
        return;

      }

      var oMovie =
        oAppModel.getProperty("/selectedMovie");

      if (!oMovie) {

        MessageToast.show("No movie selected");
        return;

      }

      oAppModel.setProperty("/selectedMovie", oMovie);

      models.saveAppModel(oAppModel);

      this.getOwnerComponent()
        .getRouter()
        .navTo("theatreList");

    }

  });
});