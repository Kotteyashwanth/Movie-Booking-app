sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "project1/model/models",
  "sap/m/MessageToast"
], function (Controller, models, MessageToast) {
  "use strict";

  var MANUAL_MOVIE_DETAILS = {
    "1": {
      title: "Varanasi",
      hero: "Mahesh Babu",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Drama",
      release: "2027",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "2": {
      title: "Spirit",
      hero: "Prabhas",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Action, Thriller",
      release: "2027",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "3": {
      title: "Cocktail-2",
      hero: "N/A",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Romantic, Comedy",
      release: "2026",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "4": {
      title: "Viswanth And Sons",
      hero: "Suriya",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Family, Drama",
      release: "N/A",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "5": {
      title: "The Paradise",
      hero: "Nani",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Drama, Action, Thriller",
      release: "28 Aug 2026",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "6": {
      title: "Peddi",
      hero: "N/A",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Action, Drama",
      release: "N/A",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "7": {
      title: "Spider-Man: Brand New Day",
      hero: "N/A",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "English, Superhero, Action",
      release: "N/A",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "8": {
      title: "Avengers: Doomsday",
      hero: "N/A",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "English, Superhero, Action",
      release: "N/A",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "9": {
      title: "Vishwambhara",
      hero: "Chiranjeevi",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Fantasy, Action",
      release: "2026",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "10": {
      title: "Rowdy Janardhana",
      hero: "N/A",
      heroine: "N/A",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Action, Drama",
      release: "2026",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    },
    "11": {
      title: "Ranabaali",
      hero: "Vijay Deverakonda, Rashmika Mandanna",
      heroine: "Rashmika Mandanna",
      director: "N/A",
      producer: "N/A",
      musicDirector: "N/A",
      cinematography: "N/A",
      editor: "N/A",
      genre: "Telugu, Action",
      release: "11 Sep 2026",
      duration: "N/A",
      synopsis1: "N/A",
      synopsis2: ""
    }
  };

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

    _onMovieMatched: function (oEvent) {
      var sMovieId = String(oEvent.getParameter("arguments").movieId || "");
      var oAppModel = this.getOwnerComponent().getModel("app");

      if (!oAppModel) {
        MessageToast.show("App model not found");
        return;
      }

      var oManual = MANUAL_MOVIE_DETAILS[sMovieId];

      if (!oManual) {
        MessageToast.show("Movie not found in manual list");
        return;
      }

      var oMovie = {
        tmdbId: sMovieId,
        title: pickValue(oManual.title, "N/A"),
        poster: "",
        genre: pickValue(oManual.genre, "N/A"),
        release: pickValue(oManual.release, "N/A"),
        duration: pickValue(oManual.duration, "N/A"),
        hero: pickValue(oManual.hero, "N/A"),
        heroine: pickValue(oManual.heroine, "N/A"),
        director: pickValue(oManual.director, "N/A"),
        producer: pickValue(oManual.producer, "N/A"),
        musicDirector: pickValue(oManual.musicDirector, "N/A"),
        cinematography: pickValue(oManual.cinematography, "N/A"),
        editor: pickValue(oManual.editor, "N/A"),
        synopsis1: pickValue(oManual.synopsis1, "N/A"),
        synopsis2: pickValue(oManual.synopsis2, ""),
        originalTitle: "N/A",
        language: "N/A",
        status: "N/A"
      };

      oAppModel.setProperty("/selectedMovie", oMovie);
      oAppModel.refresh(true);
      this.getView().setModel(oAppModel, "app");
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