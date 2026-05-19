sap.ui.define([], function () {
  "use strict";

  const firebaseConfig = {
    apiKey:  "AIzaSyDpabHbvuUmUMkWu2FKCG2U4x-i3bPj8cE",
    authDomain: "moviebookingapp-47b97.firebaseapp.com",
    projectId: "moviebookingapp-47b97",
    storageBucket: "moviebookingapp-47b97.appspot.com",
    messagingSenderId: "682386236924",
    appId: "1:682386236924:web:7977601cc1fb1ed0fd3e79"
  };

  let pFirebase;

  function loadFirebase() {
    if (!pFirebase) {
      pFirebase = Promise.all([
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"),
        import("https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js")
      ]).then(([appMod, authMod, fsMod]) => {
        const app = appMod.getApps().length
          ? appMod.getApp()
          : appMod.initializeApp(firebaseConfig);

        const auth = authMod.getAuth(app);
        const db = fsMod.getFirestore(app);

        return {
          app: app,
          auth: auth,
          authMod: authMod,
          db: db,
          fsMod: fsMod
        };
      });
    }

    return pFirebase;
  }

  return {
    firebaseConfig: firebaseConfig,
    loadFirebase: loadFirebase
  };
});