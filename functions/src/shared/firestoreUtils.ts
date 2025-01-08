import * as admin from "firebase-admin";

const db = admin.firestore();

export const getUsers = () => {
  return db.collection("users").get();
};

export const getUserCollection = (userId: string, collectionName: string) => {
  return db.collection(`users/${userId}/${collectionName}`).get();
};

export const removeInvalidTokenFromDatabase =
  async (userId: string, token: string) => {
    try {
      // Referencia al documento en la colección tokens
      const tokenRef = admin.firestore()
        .collection("users")
        .doc(userId)
        .collection("tokens")
        .doc(token);

      // Eliminar el documento del token
      await tokenRef.delete();

      console.log(`Token eliminado exitosamente: ${token}`);
    } catch (error) {
      console.error(`Error al intentar eliminar el token ${token}:`, error);
    }
  };
