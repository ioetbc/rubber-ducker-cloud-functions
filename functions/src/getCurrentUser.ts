import * as functions from "firebase-functions";
import admin from "firebase-admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConfig.js";
import jwt from "jsonwebtoken";

const serviceAccount = require("../firebase-service-account.json");

exports.getCurrentUser = functions.https.onCall(async (data) => {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

  try {
    const response: any = jwt.verify(data.accessToken, "really secret");
    const uid = response.userId;

    if (!uid) {
      throw new functions.https.HttpsError("not-found", "No uid");
    }

    const docRef = doc(db, "users", uid);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new functions.https.HttpsError("not-found", "No user found");
    }

    console.log("the mother fucking user", docSnap.data());

    return docSnap.data();
  } catch (error) {
    throw new functions.https.HttpsError("failed-precondition", "", error);
  }
});
