sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Controller, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("project1.controller.Home", {

    onInit: function () {
      var oAppModel = this.getOwnerComponent().getModel("app");
      this.getView().setModel(oAppModel);
      this.oRouter = this.getOwnerComponent().getRouter();
    },

    onSearch: function (oEvent) {
      var sValue = oEvent.getSource().getValue().trim();
      var oStrip = this.byId("movieStrip");
      var oBinding = oStrip.getBinding("items");

      if (!sValue) {
        oBinding.filter([]);
        return;
      }

      oBinding.filter([
        new Filter({
          filters: [
            new Filter("title", FilterOperator.Contains, sValue),
            new Filter("genre", FilterOperator.Contains, sValue)
          ],
          and: false
        })
      ]);
    },

    onMoviePress: function (oEvent) {

    var oSource = oEvent.getSource();

    var oContext =
        oSource.getBindingContext() ||
        oSource.getBindingContext("app");

    if (!oContext) {
        return;
    }

    var oMovie = Object.assign({}, oContext.getObject());

    if (!oMovie) {
        return;
    }

    var oAppModel = this.getOwnerComponent().getModel("app");

    // Update selected movie properly
    oAppModel.setProperty("/selectedMovie", null);
    oAppModel.setProperty("/selectedMovie", oMovie);

    var sMovieId =
        oMovie.id ||
        oMovie.movieId ||
        oMovie.ID ||
        oMovie.MovieId;

    if (!sMovieId) {

        var sPath = oContext.getPath();

        var aParts = sPath.split("/");

        sMovieId = aParts[aParts.length - 1];
    }

    this.oRouter.navTo("movieDetails", {
        movieId: String(sMovieId)
    });

},

    onScrollLeft: function () {
      var oDom = this.byId("movieScroller").getDomRef();
      if (!oDom) {
        return;
      }

      if (oDom.scrollBy) {
        oDom.scrollBy({ left: -700, behavior: "smooth" });
      } else {
        oDom.scrollLeft = Math.max(0, oDom.scrollLeft - 700);
      }
    },

    onScrollRight: function () {
      var oDom = this.byId("movieScroller").getDomRef();
      if (!oDom) {
        return;
      }

      if (oDom.scrollBy) {
        oDom.scrollBy({ left: 700, behavior: "smooth" });
      } else {
        oDom.scrollLeft = oDom.scrollLeft + 700;
      }
    }

  });
});