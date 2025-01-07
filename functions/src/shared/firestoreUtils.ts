import * as admin from "firebase-admin";

const db = admin.firestore();

export const getUsers = () => {
  return db.collection("users").get();
};

export const getUserCollection = (userId: string, collectionName: string) => {
  return db.collection(`users/${userId}/${collectionName}`).get();
};
