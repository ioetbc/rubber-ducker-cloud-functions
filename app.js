require("dotenv-safe").config({
  allowEmptyValues: true,
});
const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const GitHubStrategy = require("passport-github2").Strategy;
const passport = require("passport");
const session = require("express-session");
const Firestore = require("@google-cloud/firestore");

const main = async () => {
  const app = express();
  const port = 3015;

  app.use(cors({ origin: "*" }));
  app.use(express.json());
  // TODO get rid of this. I didnt need it in the last implementation
  app.use(
    session({
      secret: "bla bla bla",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  app.use(passport.initialize());
  app.use(passport.session());

  const serviceAccount = require("./firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  const db = new Firestore({
    projectId: "rubberducker-35ee3",
    keyFilename: "./firebase-service-account.json",
  });

  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: process.env.GITHUB_CALLBACK_URL,
      },
      function (_, __, profile, done) {
        admin
          .auth()
          .createCustomToken(profile.username)
          .then(async (token) => {
            const docRef = db.collection("users").doc(profile.username);
            await docRef.set({
              username: profile.username,
              profileURL: profile._json.avatar_url,
              github_id: profile.id,
              created_at: Firestore.Timestamp.now(),
            });
            done(null, { accessToken: token });
          })
          .catch((err) => {
            console.log("Error:", err);
          });
      }
    )
  );

  app.get("/auth", passport.authenticate("github", { session: false }));

  app.get(
    "/auth/github/callback",
    passport.authenticate("github", { session: false }),
    function (req, res) {
      console.log("the fucking req", req.user);
      res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    }
  );

  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};

main();
