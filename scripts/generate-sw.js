const fs = require('fs');
const path = require('path');
require('dotenv').config();

const basePath = path.join(__dirname, '../src/firebase-messaging-sw.base.js');
const outputPath = path.join(__dirname, '../src/firebase-messaging-sw.js');

let swContent = fs.readFileSync(basePath, 'utf8');

const placeholders = {
  __FIREBASE_API_KEY__: process.env.FIREBASE_API_KEY,
  __FIREBASE_AUTH_DOMAIN__: process.env.FIREBASE_AUTH_DOMAIN,
  __FIREBASE_PROJECT_ID__: process.env.FIREBASE_PROJECT_ID,
  __FIREBASE_STORAGE_BUCKET__: process.env.FIREBASE_STORAGE_BUCKET,
  __FIREBASE_MESSAGING_SENDER_ID__: process.env.FIREBASE_MESSAGING_SENDER_ID,
  __FIREBASE_APP_ID__: process.env.FIREBASE_APP_ID,
  __FIREBASE_MEASUREMENT_ID__: process.env.FIREBASE_MEASUREMENT_ID,
  __FIREBASE_VAPID_KEY__: process.env.FIREBASE_VAPID_KEY,
};

Object.entries(placeholders).forEach(([key, value]) => {
  swContent = swContent.replace(new RegExp(key, 'g'), value || '');
});

fs.writeFileSync(outputPath, swContent, 'utf8');
console.log('firebase-messaging-sw.js generated successfully!');
