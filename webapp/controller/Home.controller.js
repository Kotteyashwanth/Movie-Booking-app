sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "project1/model/Firebase"
], function (Controller, Filter, FilterOperator, JSONModel, MessageToast, MessageBox, Firebase) {
  "use strict";

  return Controller.extend("project1.controller.Home", {


    onInit: function () {

    var oAppModel = this.getOwnerComponent().getModel("app");

    if (!oAppModel) {

       oAppModel = new JSONModel({
    movies: [],
    selectedMovie: null,
    featuredMovie: null,
    heroIndex: 0
});
        this.getOwnerComponent().setModel(oAppModel, "app");
    }

    this.getView().setModel(oAppModel);

    var oUserModel = sap.ui.getCore().getModel("user");

    if (oUserModel) {
        this.getView().setModel(oUserModel, "user");
    }

    this.oRouter = this.getOwnerComponent().getRouter();

    this._loadMovies();
},
onAfterRendering: function () {

    var oCarousel = this.byId("heroCarousel");
    var that = this;

    this._syncHeroDots();

    if (this._heroTimer) {
        clearInterval(this._heroTimer);
    }

    this._heroTimer = setInterval(function () {

        oCarousel.next();

        that._syncHeroDots();

    }, 4000);

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
        tmdbId: oTmdbResult && oTmdbResult.id ? oTmdbResult.id : null,
        title: oMovie.title,
        genre: oMovie.genre,
        hero: oMovie.hero || "",
        languages: oMovie.languages || "",
        duration: oMovie.duration || "",
        synopsis1: oMovie.synopsis1 || "",
        poster: oTmdbResult && oTmdbResult.poster_path
          ? "https://image.tmdb.org/t/p/w500" + oTmdbResult.poster_path
          : this._getFallbackPoster(oMovie.title),
        release: oMovie.release || oMovie.releaseDate || "",
        rating: oTmdbResult && oTmdbResult.vote_average ? oTmdbResult.vote_average : "",
        overview: oTmdbResult && oTmdbResult.overview ? oTmdbResult.overview : "",
        trailers: oMovie.trailers || []
      };
    },

    _parseReleaseDate: function (sRelease) {
      if (!sRelease) {
        return Number.POSITIVE_INFINITY;
      }

      var sValue = String(sRelease).trim();
      if (!sValue) {
        return Number.POSITIVE_INFINITY;
      }

      var aMonthMap = {
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

      if (/^\d{4}$/.test(sValue)) {
        return new Date(parseInt(sValue, 10), 0, 1).getTime();
      }

      var aMatch = sValue.match(/^(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})$/);
      if (aMatch) {
        var iDay = parseInt(aMatch[1], 10);
        var sMonthKey = String(aMatch[2]).toLowerCase();
        var iYear = parseInt(aMatch[3], 10);
        var iMonth = aMonthMap[sMonthKey];

        if (iMonth !== undefined && !isNaN(iDay) && !isNaN(iYear)) {
          return new Date(iYear, iMonth, iDay).getTime();
        }
      }

      var iTime = Date.parse(sValue);
      if (!isNaN(iTime)) {
        return iTime;
      }

      return Number.POSITIVE_INFINITY;
    },

    _sortMoviesByReleaseDateAndAssignIds: function (aMovies) {
      return aMovies
        .map(function (oMovie, iIndex) {
          return {
            movie: oMovie,
            index: iIndex
          };
        })
        .sort(function (a, b) {
          var iDateA = this._parseReleaseDate(a.movie.release || a.movie.releaseDate);
          var iDateB = this._parseReleaseDate(b.movie.release || b.movie.releaseDate);

          if (iDateA !== iDateB) {
            return iDateA - iDateB;
          }

          return a.index - b.index;
        }.bind(this))
        .map(function (oItem, iNewIndex) {
          var oMovie = Object.assign({}, oItem.movie);
          oMovie.id = iNewIndex + 1;
          oMovie.movieId = iNewIndex + 1;
          return oMovie;
        });
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
  title: "Peddi",
  genre: "Telugu, Action, Drama",
  hero: "",
  release: "4 Jun 2026",
  duration: "2h 40min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/sF2dj7ycZvA"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/qu3tPDCMNeU"
    },
    {
      language: "Hindi",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/noatJVfA22U"
    },
    {
      language: "Kannada",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/zSmcPoEk5UM"
    },
    {
      language: "Malayalam",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/KhsWkRS0xxQ"
    }
  ],

  searchTerms: ["Peddi"]
},
        {
          id: 2,
          movieId: 2,
          title: "Cocktail-2",
          genre: "Telugu, Romantic, Comedy",
          hero: "",
          release: "19 Jun 2026",
          duration: "2h 32min",
          languages: "Hindi",
          synopsis1: "A fun-filled romantic comedy that follows the chaotic lives, friendships, and relationships of a lively group of youngsters.",
          searchTerms: [
            "Cocktail-2",
            "Cocktail 2",
            "Cocktail Movie 2",
            "Cocktail-2 Telugu"
          ]
        },
       {
  id: 3,
  movieId: 3,
  title: "Vishwambhara",
  genre: "Telugu, Fantasy, Action",
  hero: "Chiranjeevi",
  release: "10 Jul 2026",
  duration: "2h 58min",
  languages: "Telugu, Hindi, Tamil",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/WPWNt8qhx94"
    },
    {
      language: "Hindi",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/kpqMN2hoQBU"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/5RcJKmrdDZg"
    }
  ],

  synopsis1: "A fantasy action entertainer where a mighty warrior rises to protect the world from dark supernatural forces.",

  searchTerms: [
    "Vishwambhara Chiranjeevi",
    "Vishwambhara",
    "Viswambhara Chiranjeevi"
  ]
},
       {
  id: 4,
  movieId: 4,
  title: "Viswanth And Sons",
  genre: "Telugu, Family, Drama",
  hero: "Suriya",
  release: "23 Jul 2026",
  duration: "2h 48min",
  languages: "Telugu,Tamil",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/7XwRok2JhJM"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/glU1Xc7dTKk"
    }
  ],

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
  title: "Spider-Man: Brand New Day",
  genre: "English, Superhero, Action",
  hero: "",
  release: "31 Jul 2026",
  duration: "2h 35min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada, English",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/-tAMIDt9MyY"
    },
    {
      language: "Hindi",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/mJtuYWRQrEE"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/vEhLoO4SM6g"
    },
    {
      language: "Malayalam",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/vqdU5y2m_NU"
    },
    {
      language: "Kannada",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/vnqZwdvJSXg"
    },
    {
      language: "English",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/3PzKNC1jqkI"
    }
  ],

  searchTerms: [
    "Spider-Man: Brand New Day",
    "Spider Man Brand New Day",
    "Spider-Man Brand New Day"
  ]
},
       {
  id: 6,
  movieId: 6,
  title: "The Paradise",
  genre: "Telugu, Drama, Action, Thriller",
  hero: "Nani",
  release: "28 Aug 2026",
  duration: "2h 50min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/NkZFnpDhdCk"
    },
    {
      language: "Hindi",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/namFQ8wFdIA"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/r2Yf6LLewuc"
    },
    {
      language: "Malayalam",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/4rXvKsrbSAQ"
    },
    {
      language: "Kannada",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/ETIky7mX2pw"
    }
  ],

  searchTerms: [
    "The Paradise Nani",
    "Paradise Nani",
    "The Paradise",
    "Paradise"
  ]
},
        {
  id: 7,
  movieId: 7,
  title: "Ranabaali",
  genre: "Telugu, Action",
  hero: "Vijay Deverakonda, Rashmika Mandanna",
  release: "11 Sep 2026",
  duration: "2h 46min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/9Ik0Y8Pr3l0"
    }
  ],

  synopsis1: "A gripping action drama that follows the journey of a rebellious young man caught between love, revenge, and destiny.",

  searchTerms: [
    "Ranabaali Vijay Deverakonda",
    "Ranabaali Rashmika Mandanna",
    "Ranabaali"
  ]
},
        {
          id: 8,
          movieId: 8,
          title: "Avengers: Doomsday",
          genre: "English, Superhero, Action",
          hero: "",
          release: "18 Dec 2026",
          duration: "3h 15min",
          languages: "Telugu, Hindi, Tamil, Malayalam, Kannada, English",
          searchTerms: [
            "Avengers: Doomsday",
            "Avengers Doomsday",
            "The Avengers Doomsday"
          ]
        },
        {
  id: 9,
  movieId: 9,
  title: "Rowdy Janardhana",
  genre: "Telugu, Action, Drama",
  hero: "Vijay Deverakonda",
  release: "25 Dec 2026",
  duration: "2h 44min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/Q1s_CWfGAHk"
    },
    {
      language: "Hindi",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/UYWQSBchZ2o"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/UB2g35dJRu0"
    },
    {
      language: "Malayalam",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/lZUdglwUYQk"
    },
    {
      language: "Kannada",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/5PxxrOMOL5o"
    }
  ],

  synopsis1: "An action-packed rural drama centered around a fearless man who stands against injustice and corruption.",

  searchTerms: [
    "Rowdy Janardhana",
    "Rowdy Janardhana Telugu"
  ]
},
       {
  id: 10,
  movieId: 10,
  title: "Spirit",
  genre: "Telugu, Action, Thriller",
  hero: "Prabhas",
  release: "5 Mar 2027",
  duration: "2h 55min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",

  trailers: [
    {
      language: "Telugu",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/VCGVPiD4BP0"
    },
    {
      language: "Hindi",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/_YhSSfXmr9c"
    },
    {
      language: "Tamil",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/pDWqMwAG6Fg"
    },
    {
      language: "Malayalam",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/6_2X8FLFSno"
    },
    {
      language: "Kannada",
      title: "Official Trailer",
      url: "https://www.youtube.com/embed/0c9JurcvhA0"
    }
  ],

  synopsis1: "A fierce police officer battles a powerful criminal network while confronting his own inner demons in this intense action thriller.",

  searchTerms: ["Spirit Prabhas", "Spirit"]
},
        {
  id: 11,
  movieId: 11,
  title: "Varanasi",
  genre: "Telugu, Drama",
  hero: "Mahesh Babu",
  release: "7 Apr 2027",
  duration: "3h 05min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",
  trailers: [
    {
      language: "Telugu",
      url: "https://www.youtube.com/watch?v=DMD2uthghWE"
    }
  ],
  searchTerms: ["Varanasi Mahesh Babu", "Varanasi"]
},
       {
  id: 12,
  movieId: 12,
  title: "Dragon",
  genre: "Telugu, Action, Thriller",
  hero: "Jr NTR",
  release: "11 Jun 2027",
  duration: "3h 10min",
  languages: "Telugu, Hindi, Tamil, Malayalam, Kannada",
  synopsis1: "A high-octane action thriller directed by Prashanth Neel featuring Jr NTR in a powerful and intense role.",

  trailers: [
    {
      language: "Telugu",
      url: "https://www.youtube.com/watch?v=bedocP4nRAo"
    },
    {
      language: "Hindi",
      url: "https://www.youtube.com/watch?v=DZ9lpup4VZ0"
    },
    {
      language: "Tamil",
      url: "https://www.youtube.com/watch?v=3bxrl9k-kn4"
    },
    {
      language: "Malayalam",
      url: "https://www.youtube.com/watch?v=X5Ytvu0gxAA"
    },
    {
      language: "Kannada",
      url: "https://www.youtube.com/watch?v=y0jHSknxFaw"
    }
  ],

  searchTerms: [
    "NTR Neel",
    "Dragon NTR",
    "Dragon Jr NTR",
    "Prashanth Neel NTR",
    "NTR31"
  ]
}
      ];

      aMovies = this._sortMoviesByReleaseDateAndAssignIds(aMovies);

      var aRequests = aMovies.map(function (oMovie) {
        return this._searchTmdbMovie(oMovie.searchTerms, sApiKey)
          .then(function (oTmdbResult) {
            return this._formatMovie(oMovie, oTmdbResult);
          }.bind(this));
      }.bind(this));

    Promise.all(aRequests)
  .then(function (aFinalMovies) {

    oAppModel.setProperty("/movies", aFinalMovies);

   var oFeaturedMovie =
  aFinalMovies.find(function (m) {
    return m.title === "Rowdy Janardhana";
  }) || aFinalMovies[0] || null;

    oAppModel.setProperty("/featuredMovie", oFeaturedMovie);

    oAppModel.refresh(true);

  })
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

    // Clear old selected movie
    oAppModel.setProperty("/selectedMovie", null);

    // Save newly clicked movie
    oAppModel.setProperty("/selectedMovie", oMovie);

    // Save instantly to localStorage
    try {
        window.localStorage.setItem(
            "movieTicketAppState",
            JSON.stringify(oAppModel.getData())
        );
    } catch (e) {

    }

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
    },
    onBookNow: function () {

  var oAppModel = this.getView().getModel();
  var oMovie = oAppModel.getProperty("/featuredMovie");

  if (!oMovie) {
    MessageToast.show("No featured movie found");
    return;
  }

  oAppModel.setProperty("/selectedMovie", oMovie);

  try {
    window.localStorage.setItem(
      "movieTicketAppState",
      JSON.stringify(oAppModel.getData())
    );
  } catch (e) {}

 var sMovieId = oMovie.movieId || oMovie.id;

this.oRouter.navTo("movieDetails", {
    movieId: String(sMovieId),
    from: "home"
});
},
onAdScrollLeft: function () {
  var oDom = this.byId("adScroller").getDomRef();
  if (!oDom) {
    return;
  }

  if (oDom.scrollBy) {
    oDom.scrollBy({ left: -300, behavior: "smooth" });
  } else {
    oDom.scrollLeft = Math.max(0, oDom.scrollLeft - 300);
  }
},

onAdScrollRight: function () {
  var oDom = this.byId("adScroller").getDomRef();
  if (!oDom) {
    return;
  }

  if (oDom.scrollBy) {
    oDom.scrollBy({ left: 300, behavior: "smooth" });
  } else {
    oDom.scrollLeft = oDom.scrollLeft + 300;
  }
},

onWatchTrailer: function () {

  var oAppModel = this.getView().getModel();
  var oMovie = oAppModel.getProperty("/featuredMovie");

  if (!oMovie || !oMovie.trailers || !oMovie.trailers.length) {
    MessageToast.show("Trailer not available");
    return;
  }

  var sUrl = oMovie.trailers[0].url || "";

  window.open(sUrl, "_blank");
},
_getMovieByTitle: function (sTitle) {
  var oAppModel = this.getView().getModel();
  var aMovies = oAppModel.getProperty("/movies") || [];

  return aMovies.find(function (m) {
    return m.title === sTitle;
  }) || null;
},

_openMovieDetails: function (oMovie) {
  if (!oMovie) {
    MessageToast.show("Movie not found");
    return;
  }

  var oAppModel = this.getView().getModel();

  oAppModel.setProperty("/selectedMovie", oMovie);

  try {
    window.localStorage.setItem(
      "movieTicketAppState",
      JSON.stringify(oAppModel.getData())
    );
  } catch (e) {}

  this.oRouter.navTo("movieDetails", {
    movieId: String(oMovie.movieId || oMovie.id),
    query: {
      from: "home"
    }
  });
},

_openMovieTrailer: function (oMovie) {
  if (!oMovie || !oMovie.trailers || !oMovie.trailers.length) {
    MessageToast.show("Trailer not available");
    return;
  }

  var sUrl = oMovie.trailers[0].url || "";
  window.open(sUrl, "_blank");
},

onSpiritBookNow: function () {
  var oMovie = this._getMovieByTitle("Spirit");
  this._openMovieDetails(oMovie);
},

onSpiritWatchTrailer: function () {
  var oMovie = this._getMovieByTitle("Spirit");
  this._openMovieTrailer(oMovie);
},

onDragonBookNow: function () {
  var oMovie = this._getMovieByTitle("Dragon");
  this._openMovieDetails(oMovie);
},

onDragonWatchTrailer: function () {
  var oMovie = this._getMovieByTitle("Dragon");
  this._openMovieTrailer(oMovie);
},
onWatchGTATrailer: function () {
  window.open("https://www.youtube.com/watch?v=QdBZY2fkU-0", "_blank");
},

onGamingLeft: function () {
  var oDom = this.byId("gamingScroller") && this.byId("gamingScroller").getDomRef();
  if (!oDom) { return; }
  if (oDom.scrollBy) {
    oDom.scrollBy({ left: -600, behavior: "smooth" });
  } else {
    oDom.scrollLeft = Math.max(0, oDom.scrollLeft - 600);
  }
},

onGamingRight: function () {
  var oDom = this.byId("gamingScroller") && this.byId("gamingScroller").getDomRef();
  if (!oDom) { return; }
  if (oDom.scrollBy) {
    oDom.scrollBy({ left: 600, behavior: "smooth" });
  } else {
    oDom.scrollLeft = oDom.scrollLeft + 600;
  }
},
onHeroDotPress: function (oEvent) {

    var iIndex = parseInt(
        oEvent.getSource().data("index"),
        10
    );

    var oCarousel = this.byId("heroCarousel");

    var aPages = oCarousel.getPages();

    oCarousel.setActivePage(aPages[iIndex]);

    this._syncHeroDots();
},

_syncHeroDots: function () {

    var oCarousel = this.byId("heroCarousel");

    var sActivePage = oCarousel.getActivePage();

    var aPages = oCarousel.getPages();

    var iActiveIndex = 0;

    for (var i = 0; i < aPages.length; i++) {

        if (aPages[i].getId() === sActivePage) {

            iActiveIndex = i;

            break;
        }
    }

    var aDotIds = [
        "heroDot0",
        "heroDot1",
        "heroDot2"
    ];

    for (var j = 0; j < aDotIds.length; j++) {

        var oDot = this.byId(aDotIds[j]);

        if (oDot) {

            oDot.toggleStyleClass(
                "heroDotActive",
                j === iActiveIndex
            );
        }
    }
},
onHomePress: function () {
    this.getOwnerComponent().getRouter().navTo("home");
},

onMoviesPress: function () {
    this.getOwnerComponent().getRouter().navTo("movies");
},

onTicketsPress: function () {
    this.getOwnerComponent().getRouter().navTo("tickets");
},

onOffersPress: function () {
    this.getOwnerComponent().getRouter().navTo("offers");
},


    onLogout: async function () {
      try {
        const oFB = await Firebase.loadFirebase();

        if (oFB && oFB.auth && oFB.auth.signOut) {
          await oFB.auth.signOut();
        }
        
        sap.ui.getCore().setModel(
          new JSONModel({
            loggedIn: false,
            displayName: "",
            email: "",
            initials: "",
            photoURL: ""
          }),
          "user"
        );

        MessageToast.show("Logged out successfully");

        this.getOwnerComponent().getRouter().navTo("login", {}, true);

      } catch (e) {
        console.error("Logout Error:", e);
        MessageBox.error(e.message || "Logout failed");
      }
    },
    onWatchGTATrailer: function () {
        window.open("https://youtu.be/VQRLujxTm3c", "_blank");
    },
    onAxisCardPress: function () {
        window.open(
            "https://www.axis.bank.in/cards/credit-card/lic-axis-bank-signature-credit-card",
            "_blank"
        );
    }

  });
});