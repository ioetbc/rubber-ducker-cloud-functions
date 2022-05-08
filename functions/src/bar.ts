import * as functions from "firebase-functions";
import jwt from "jsonwebtoken";

exports.bar = functions.https.onCall((data) => {
  const { accessToken } = data;

  if (!accessToken) {
    throw new functions.https.HttpsError("not-found", "No Access Token");
  }

  try {
    const userId = jwt.verify(accessToken, "really secret");
    console.log("userid", userId);
    return userId;
  } catch (error) {
    throw new functions.https.HttpsError("not-found", "access token fucked");
  }
});
