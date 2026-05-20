sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel"
], function (Controller, Filter, FilterOperator, JSONModel) {
  "use strict";

  return Controller.extend("project1.controller.Home", {

    onInit: function () {
      var oAppModel = this.getOwnerComponent().getModel("app");

      if (!oAppModel) {
        oAppModel = new JSONModel({
          movies: [],
          selectedMovie: null
        });
        this.getOwnerComponent().setModel(oAppModel, "app");
      }

      this.getView().setModel(oAppModel);
      this.oRouter = this.getOwnerComponent().getRouter();

      this._loadMovies();
    },

    _getFallbackPoster: function (sTitle) {
      return "https://placehold.co/500x750/111827/ffffff?text=" + encodeURIComponent(sTitle || "Movie");
    },

    _searchTmdbMovie: function (aTerms, sApiKey) {
      var i = 0;

      function tryNext() {
        if (i >= aTerms.length) {
          return Promise.resolve(null);
        }

        var sTerm = aTerms[i++];

        var sSearchUrl =
          "https://api.themoviedb.org/3/search/movie?query=" +
          encodeURIComponent(sTerm) +
          "&include_adult=false&language=en-US&page=1&api_key=" +
          encodeURIComponent(sApiKey);

        return fetch(sSearchUrl)
          .then(function (response) {
            if (!response.ok) {
              throw new Error("TMDB search failed: " + response.status);
            }
            return response.json();
          })
          .then(function (data) {
            var aResults = data && data.results ? data.results : [];
            var oBestResult = null;

            for (var j = 0; j < aResults.length; j++) {
              if (
                aResults[j] &&
                aResults[j].original_language === "te" &&
                aResults[j].poster_path
              ) {
                oBestResult = aResults[j];
                break;
              }
            }

            if (!oBestResult) {
              for (var k = 0; k < aResults.length; k++) {
                if (aResults[k] && aResults[k].poster_path) {
                  oBestResult = aResults[k];
                  break;
                }
              }
            }

            if (oBestResult) {
              return oBestResult;
            }

            return tryNext();
          })
          .catch(function () {
            return tryNext();
          });
      }

      return tryNext();
    },

    _formatMovie: function (oMovie, oTmdbResult) {
      return {
        id: oMovie.id,
        movieId: oMovie.movieId,

        // real TMDB id
        tmdbId: oTmdbResult && oTmdbResult.id ? oTmdbResult.id : null,

        title: oMovie.title,
        genre: oMovie.genre,
        hero: oMovie.hero || "",
        poster: oTmdbResult && oTmdbResult.poster_path
          ? "https://image.tmdb.org/t/p/w500" + oTmdbResult.poster_path
          : this._getFallbackPoster(oMovie.title),
        release: oTmdbResult && oTmdbResult.release_date
          ? oTmdbResult.release_date
          : (oMovie.release || ""),
        rating: oTmdbResult && oTmdbResult.vote_average ? oTmdbResult.vote_average : "",
        overview: oTmdbResult && oTmdbResult.overview ? oTmdbResult.overview : ""
      };
    },

    formatGenre: function (sGenre) {
      if (!sGenre) {
        return "";
      }

      var aGenres = sGenre.split(",");

      if (aGenres.length > 1) {
        return aGenres.slice(1).join(",").trim();
      }

      return sGenre;
    },

    _loadMovies: function () {
      var oAppModel = this.getOwnerComponent().getModel("app");
      var sApiKey = "d78a3b2a132ae5fa67e1745e9d4e458f";
      var aMovies = [
        {
          id: 1,
          movieId: 1,
          title: "Varanasi",
          genre: "Telugu, Drama",
          hero: "Mahesh Babu",
          release: "2027",
          searchTerms: ["Varanasi Mahesh Babu", "Varanasi"]
        },
        {
          id: 2,
          movieId: 2,
          title: "Spirit",
          genre: "Telugu, Action, Thriller",
          hero: "Prabhas",
          release: "2027",
          searchTerms: ["Spirit Prabhas", "Spirit"]
        },
        {
          id: 3,
          movieId: 3,
          title: "Cocktail-2",
          genre: "Telugu, Romantic, Comedy",
          hero: "",
          release: "2026",
          searchTerms: [
            "Cocktail-2",
            "Cocktail 2",
            "Cocktail Movie 2",
            "Cocktail-2 Telugu"
          ]
        },
        {
          id: 4,
          movieId: 4,
          title: "Viswanth And Sons",
          genre: "Telugu, Family, Drama",
          hero: "Suriya",
          release: "",
          searchTerms: [
            "Viswanth And Sons Suriya",
            "Viswanath & Sons Suriya",
            "Vishwanath & Sons Suriya",
            "Viswanth And Sons"
          ]
        },
        {
          id: 5,
          movieId: 5,
          title: "The Paradise",
          genre: "Telugu, Drama, Action, Thriller",
          hero: "Nani",
          release: "28 Aug 2026",
          searchTerms: [
            "The Paradise Nani",
            "Paradise Nani",
            "The Paradise",
            "Paradise"
          ]
        },
        {
          id: 6,
          movieId: 6,
          title: "Peddi",
          genre: "Telugu, Action, Drama",
          hero: "",
          release: "",
          searchTerms: ["Peddi"]
        },
        {
          id: 7,
          movieId: 7,
          title: "Spider-Man: Brand New Day",
          genre: "English, Superhero, Action",
          hero: "",
          release: "",
          searchTerms: [
            "Spider-Man: Brand New Day",
            "Spider Man Brand New Day",
            "Spider-Man Brand New Day"
          ]
        },
        {
          id: 8,
          movieId: 8,
          title: "Avengers: Doomsday",
          genre: "English, Superhero, Action",
          hero: "",
          release: "",
          searchTerms: [
            "Avengers: Doomsday",
            "Avengers Doomsday",
            "The Avengers Doomsday"
          ]
        },
        {
          id: 9,
          movieId: 9,
          title: "Vishwambhara",
          genre: "Telugu, Fantasy, Action",
          hero: "Chiranjeevi",
          release: "2026",
          searchTerms: [
            "Vishwambhara Chiranjeevi",
            "Vishwambhara",
            "Viswambhara Chiranjeevi"
          ]
        },
        {
          id: 10,
          movieId: 10,
          title: "Rowdy Janardhana",
          genre: "Telugu, Action, Drama",
          hero: "",
          release: "2026",
          searchTerms: [
            "Rowdy Janardhana",
            "Rowdy Janardhana Telugu"
          ]
        },
        {
          id: 11,
          movieId: 11,
          title: "Ranabaali",
          genre: "Telugu, Action",
          hero: "Vijay Deverakonda, Rashmika Mandanna",
          release: "11 Sep 2026",
          searchTerms: [
            "Ranabaali Vijay Deverakonda",
            "Ranabaali Rashmika Mandanna",
            "Ranabaali"
          ]
        }
      ];

      var aRequests = aMovies.map(function (oMovie) {
        return this._searchTmdbMovie(oMovie.searchTerms, sApiKey)
          .then(function (oTmdbResult) {
            return this._formatMovie(oMovie, oTmdbResult);
          }.bind(this));
      }.bind(this));

      Promise.all(aRequests)
        .then(function (aFinalMovies) {
          oAppModel.setProperty("/movies", aFinalMovies);
          oAppModel.refresh(true);
        })
        .catch(function (error) {
          console.error("TMDB Error:", error);
          oAppModel.setProperty("/movies", []);
          oAppModel.refresh(true);
        });
    },

    onSearch: function (oEvent) {
      var sValue = oEvent.getSource().getValue().trim();
      var oStrip = this.byId("movieStrip");

      if (!oStrip) {
        return;
      }

      var oBinding = oStrip.getBinding("items");
      if (!oBinding) {
        return;
      }

      if (!sValue) {
        oBinding.filter([]);
        return;
      }

      oBinding.filter([
        new Filter({
          filters: [
            new Filter("title", FilterOperator.Contains, sValue),
            new Filter("genre", FilterOperator.Contains, sValue),
            new Filter("hero", FilterOperator.Contains, sValue)
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

  oAppModel.setProperty("/selectedMovie", null);
  oAppModel.setProperty("/selectedMovie", oMovie);

  // send manual id only
  var sMovieId = oMovie.movieId || oMovie.id;

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