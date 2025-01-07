import * as admin from "firebase-admin";
admin.initializeApp();

import {
  notifyDueBillsForToday,
  notifyDueBillsForTodayScheduled,
} from "./bills/notifyDueBillsForToday";

export {
  notifyDueBillsForToday,
  notifyDueBillsForTodayScheduled,
};
