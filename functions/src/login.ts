const functions = require("firebase-functions");
const express = require("express");
const app = express();

import admin from "firebase-admin";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import jwt from "jsonwebtoken";

const GitHubStrategy = require("passport-github2").Strategy;
const serviceAccount = require("../firebase-service-account.json");
require("dotenv-safe").config({ allowEmptyValues: true });

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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
passport.serializeUser((user: any, done: any) => {
  done(null, user.id);
});
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
    },
    function (_: any, __: any, profile: any, done: any) {
      const JWT = jwt.sign({ userId: profile.username }, "really secret", {
        expiresIn: "1y",
      });

      done(null, { accessToken: JWT });
    }
  )
);

app.get("/auth", passport.authenticate("github", { session: false }));
app.get(
  "/auth/github/callback",
  passport.authenticate("github", { session: false }),
  function (req: any, res: any) {
    res.redirect(`http://localhost:54321/auth/${req.user.accessToken}`);
    res.end();
  }
);

exports.login = functions.https.onRequest(app);
