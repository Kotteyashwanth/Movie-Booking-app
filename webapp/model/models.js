sap.ui.define([
  "sap/ui/model/json/JSONModel"
], function (JSONModel) {
  "use strict";

  return {

    createLoginModel: function () {
      return new JSONModel({
        email: "",
        password: "",
        message: ""
      });
    },

    createAppModel: function () {
      var oStoredData = localStorage.getItem("project1AppData");
      var oData = oStoredData ? JSON.parse(oStoredData) : {
        selectedMovie: {},
        movies: [
          {
            title: "1 Nenokkadine",
            language: "Telugu",
            genre: "Psychological Thriller, Action",
            release: "31st May 2026 Re-Release",
            status: "Pre Book",
            duration: "2h 30m",
            director: "Sukumar",
            producer: "Ram Achanta, Gopichand Achanta, Anil Sunkara",
            musicDirector: "Devi Sri Prasad",
            cinematography: "R. Rathnavelu",
            editor: "Karthika Srinivas",
            hero: "Mahesh Babu",
            heroine: "Kriti Sanon",
            synopsis1: "A famous rock star suffers from psychological trauma and struggles to distinguish reality from illusion.",
            synopsis2: "While searching for the truth about his parents, he uncovers shocking secrets and dangerous enemies.",
            poster: "https://images.filmibeat.com/ph-big/2014/01/1-nenokkadine-movie-poster_138899940620.jpg"
          },
          {
            title: "Peddi",
            language: "Telugu, Kannada, Hindi, Tamil, Malayalam",
            genre: "Sports Drama",
            release: "4th Jun 2026",
            status: "Pre Book",
            duration: "2h 40m",
            director: "Buchi Babu Sana",
            producer: "Venkata Satish Kilaru",
            musicDirector: "A. R. Rahman",
            cinematography: "R. Rathnavelu",
            editor: "Navin Nooli",
            hero: "Ram Charan",
            heroine: "Janhvi Kapoor",
            synopsis1: "A determined young athlete fights against all odds to achieve success in rural sports competitions.",
            synopsis2: "The film showcases ambition, family emotions, village pride, and the spirit of perseverance.",
            poster: "https://images.filmibeat.com/ph-big/2026/05/peddi1778502520_4.jpeg"
          },
          {
            title: "Vishwanath and Sons",
            language: "Telugu, Tamil",
            genre: "Family Drama",
            release: "31st Jul 2026",
            status: "Pre Book",
            duration: "2h 25m",
            director: "Venky Atluri",
            producer: "Suryadevara Naga Vamsi, Sai Soujanya",
            musicDirector: "G. V. Prakash Kumar",
            cinematography: "Nimish Ravi",
            editor: "Navin Nooli",
            hero: "Suriya",
            heroine: "Mamitha Baiju",
            synopsis1: "A heartwarming family entertainer centered around relationships, emotions, and generational values.",
            synopsis2: "The story explores love, sacrifice, misunderstandings, and the importance of family unity.",
            poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQArTY7dFUwBKw7Cgn0I2XjkSBJaOQ9BFtlrw&s"
          },
          {
            title: "The Paradise",
            language: "Telugu, Kannada, Hindi, Tamil, Malayalam",
            genre: "Action Thriller",
            release: "21st Aug 2026",
            status: "Pre Book",
            duration: "2h 35m",
            director: "Srikanth Odela",
            producer: "Sudhakar Cherukuri",
            musicDirector: "Anirudh Ravichander",
            cinematography: "G. K. Vishnu",
            editor: "Navin Nooli",
            hero: "Nani",
            heroine: "Kayadu Lohar",
            synopsis1: "A fearless man enters the dangerous underworld to expose hidden criminal activities.",
            synopsis2: "His mission turns deadly when betrayal, revenge, and personal loss change his life forever.",
            poster: "https://www.cinejosh.com/newsimg/newsmainimg/the-paradise_b_0102260843.jpg"
          },
          {
            title: "Ranabaali",
            language: "Telugu",
            genre: "Historical Action Drama",
            release: "11th Sept 2026",
            status: "Pre Book",
            duration: "2h 50m",
            director: "Rahul Sankrityan",
            producer: "Naveen Yerneni, Y. Ravi Shankar",
            musicDirector: "Ajay-Atul",
            cinematography: "Jomon T. John",
            editor: "Karthika Srinivas",
            hero: "Vijay Deverakonda",
            heroine: "Rashmika Mandanna",
            synopsis1: "A legendary warrior rises against powerful kingdoms to protect his land and people.",
            synopsis2: "The film is packed with intense war sequences, royal politics, emotional drama, and heroic sacrifices.",
            poster: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNspvEOreI7znktfJ4g6_SqD0fUNclFiMpDg&s"
          },
          {
            title: "Ramayana Part-1",
            language: "Hindi, Telugu, Kannada, Tamil, Malayalam",
            genre: "Epic Mythological Drama",
            release: "8th Nov 2026",
            status: "Pre Book",
            duration: "3h 05m",
            director: "Nitesh Tiwari",
            producer: "Madhu Mantena",
            musicDirector: "A. R. Rahman",
            cinematography: "Ravi Varman",
            editor: "A. Sreekar Prasad",
            hero: "Ranbir Kapoor",
            heroine: "Sai Pallavi",
            synopsis1: "The movie portrays the legendary journey of Lord Rama and his battle against evil forces.",
            synopsis2: "It delivers grand visuals, emotional storytelling, mythology, and powerful action sequences.",
            poster: "https://stat4.bollywoodhungama.in/wp-content/uploads/2025/07/Ramayana-Part-I-306x393.jpg"
          }
        ]
      };

      return new JSONModel(oData);
    },

    saveAppModel: function (oAppModel) {
      if (!oAppModel) {
        return;
      }
      localStorage.setItem("project1AppData", JSON.stringify(oAppModel.getData()));
    },

    clearAppModel: function () {
      localStorage.removeItem("project1AppData");
    }
  };
});