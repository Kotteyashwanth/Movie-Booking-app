sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast"
], function (Controller, MessageToast) {
  "use strict";

  return Controller.extend("project1.controller.MovieTrailer", {

    onInit: function () {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("movieTrailer").attachPatternMatched(this._onTrailerMatched, this);
    },

    onBack: function () {
      this.getOwnerComponent().getRouter().navTo("movieDetails", {
        movieId: ""
      });
    },

    _onTrailerMatched: function () {
      var oAppModel = this.getOwnerComponent().getModel("app");
      if (!oAppModel) {
        MessageToast.show("App model not found");
        return;
      }

      var oMovie = oAppModel.getProperty("/selectedMovie") || {};
      var aTrailers = Array.isArray(oMovie.trailers) ? oMovie.trailers : [];

      if (!aTrailers.length) {
        var oHostEmpty = this.byId("trailerHost");
        if (oHostEmpty) {
          oHostEmpty.setContent("<div style='padding:24px;'>No trailer available.</div>");
        }
        return;
      }

      if (oMovie.selectedTrailerIndex === undefined || oMovie.selectedTrailerIndex === null || oMovie.selectedTrailerIndex < 0) {
        oMovie.selectedTrailerIndex = 0;
        oAppModel.setProperty("/selectedMovie", oMovie);
      }

      this._renderTrailer();
    },

    onTrailerLanguageChange: function (oEvent) {
      var oItem = oEvent.getParameter("item");
      var sLanguage = "";

      if (oItem) {
        if (oItem.getKey) {
          sLanguage = oItem.getKey();
        }
        if (!sLanguage && oItem.getText) {
          sLanguage = oItem.getText();
        }
      }

      var oAppModel = this.getOwnerComponent().getModel("app");
      if (!oAppModel) {
        return;
      }

      var oMovie = oAppModel.getProperty("/selectedMovie") || {};
      var aTrailers = Array.isArray(oMovie.trailers) ? oMovie.trailers : [];

      var iIndex = -1;
      for (var i = 0; i < aTrailers.length; i++) {
        if (aTrailers[i].language === sLanguage) {
          iIndex = i;
          break;
        }
      }

      if (iIndex === -1) {
        return;
      }

      oMovie.selectedTrailerIndex = iIndex;
      oAppModel.setProperty("/selectedMovie", oMovie);
      oAppModel.refresh(true);

      this._renderTrailer();
    },

    _renderTrailer: function () {
      var oAppModel = this.getOwnerComponent().getModel("app");
      if (!oAppModel) {
        return;
      }

      var oMovie = oAppModel.getProperty("/selectedMovie") || {};
      var aTrailers = Array.isArray(oMovie.trailers) ? oMovie.trailers : [];
      var iIndex = oMovie.selectedTrailerIndex || 0;
      var oTrailer = aTrailers[iIndex] || aTrailers[0];

      var oHost = this.byId("trailerHost");
      if (!oHost) {
        return;
      }

      if (!oTrailer || !oTrailer.url) {
        oHost.setContent("<div style='padding:24px;'>No trailer available.</div>");
        return;
      }

      var sEmbedUrl = this._toEmbedUrl(oTrailer.url);

      oHost.setContent(
        "<iframe " +
          "width='100%' " +
          "height='560' " +
          "src='" + sEmbedUrl + "' " +
          "frameborder='0' " +
          "allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share' " +
          "allowfullscreen>" +
        "</iframe>"
      );

      var oSeg = this.byId("languageSeg");
      if (oSeg && oTrailer.language) {
        oSeg.setSelectedKey(oTrailer.language);
      }
    },

    _toEmbedUrl: function (sUrl) {
      if (!sUrl) {
        return "";
      }

      if (sUrl.indexOf("youtube.com/embed/") > -1) {
        return sUrl;
      }

      var m = sUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
      if (m && m[1]) {
        return "https://www.youtube.com/embed/" + m[1];
      }

      return sUrl;
    }

  });
});