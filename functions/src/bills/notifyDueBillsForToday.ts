import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {onSchedule} from "firebase-functions/v2/scheduler";
import moment from "moment";
import {getUsers, getUserCollection, removeInvalidTokenFromDatabase} from "../shared/firestoreUtils";

// Función HTTPS para notificar los vencimientos del dia
const notifyDueBills = async () => {
  const usersSnapshot = await getUsers();

  for (const userDoc of usersSnapshot.docs) {
    const userId = userDoc.id;

    const expensesSnapshot =
      await getUserCollection(userId, "expenses");
    const expensesMap = new Map<string, string>();

    expensesSnapshot.forEach((expenseDoc) => {
      expensesMap.set(expenseDoc.id, expenseDoc.data()?.name);
    });

    // Obtén las facturas (bills) vencidas del usuario
    const billsSnapshot =
      await getUserCollection(userId, "bills");
    const dueBills: string[] = [];
    let hasDueToday = false;

    billsSnapshot.forEach((billDoc) => {
      const billData = billDoc.data();
      const startDate = moment().startOf("day");
      const endDate = moment().endOf("day");

      if (
        billData.dueDate &&
        !billData.isPaid &&
        moment(billData.dueDate).isBetween(startDate, endDate)
      ) {
        hasDueToday = true;
        const expenseName = expensesMap.get(billData.expenseId);
        if (expenseName) {
          dueBills.push(expenseName);
        }
      }
    });

    if (hasDueToday && dueBills.length > 0) {
      // Obtén los tokens de notificación del usuario
      const tokensSnapshot =
        await getUserCollection(userId, "tokens");
      const tokens = tokensSnapshot.docs.map((tokenDoc) => tokenDoc.id);

      if (tokens.length > 0) {
        // Construye el mensaje de notificación
        const message = {
          notification: {
            title: "Vencimientos",
            body:
              `Hoy vence ${dueBills.join(", ")}`,
          },
          tokens, // Envía a todos los tokens del usuario
        };

        // Envía las notificaciones
        try {
          const response = await admin.messaging().sendEachForMulticast({
            ...message,
            tokens,
          });

          response.responses.forEach((resp, idx) => {
            if (resp.success) {
              console.log(`Notificación enviada al token ${tokens[idx]}`);
            } else {
              console.error(
                `Error al enviar al token ${tokens[idx]}:`,
                resp.error?.message
              );

              // Manejo de errores comunes
              if (resp.error?.code === "messaging/registration-token-not-registered" ||
                resp.error?.code === "messaging/invalid-registration-token") {
                  console.warn(`El token ${message.tokens[idx]} ya no es válido. Eliminando...`);
                  removeInvalidTokenFromDatabase(userId, message.tokens[idx]);
              }
            }
          });
        } catch (error) {
          console.error(`Error al enviar notificación a ${userId}:`, error);
        }
      } else {
        console.log(`No hay tokens registrados para el usuario ${userId}`);
      }
    }
  }
};

export const notifyDueBillsForTodayScheduled = onSchedule({
  schedule: "0 9 * * *",
  timeZone: "America/Argentina/Buenos_Aires",
}, async () => {
  try {
    await notifyDueBills(); // Llama a la lógica principal
  } catch (error) {
    console.error("Error al enviar notificaciones de deuda:", error);
  }
});

// Función HTTP para pruebas
export const notifyDueBillsForToday = functions
  .https
  .onRequest(async (req, res) => {
    try {
      await notifyDueBills(); // Llama a la lógica principal
      res.status(200).send("Notificaciones de deuda enviadas correctamente.");
    } catch (error) {
      console.error("Error al enviar notificaciones de deuda:", error);
      res.status(500).send("Error al enviar notificaciones.");
    }
  });
