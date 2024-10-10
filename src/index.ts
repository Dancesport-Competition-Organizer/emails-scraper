import fs from "node:fs";

import { getApp, getApps, initializeApp } from "firebase/app";
import { get, ref, getDatabase } from "firebase/database";

import { compInstanceMap as config } from "../config/CompInstances";

const firebaseConfig = config.dev; // change accordingly

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

async function getCompetitors() {
  const competitorsRef = ref(db, "competitors");
  const snapshot = await get(competitorsRef);
  if (!snapshot.exists) {
    throw "no data available";
  }
  return snapshot.val();
}

function getEmailList(competitors: any) {
  const emails = Object.values(competitors).map((c: any) => c.email);
  const unique = new Set();
  emails.forEach((email) => unique.add(email));
  return Array.from(unique);
}

async function generateEmailList(filepath: string) {
  const competitors = await getCompetitors();
  const list = getEmailList(competitors);
  fs.writeFileSync(filepath, list.join("\n"), "utf-8");
  return;
}

function generateFileName(uid: string): string {
  const today = new Date();

  // Extract year, month, and day
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(today.getDate()).padStart(2, '0');

  // Create the filename
  const filename = `${year}_${month}_${day}_backup_${uid}`;

  return filename;
}

async function createBackupFile(filepath: string) {
  const dbRef = ref(db, "/");
  const snapshot = await get(dbRef);
  if (!snapshot.exists) {
    throw "no data available";
  }
  fs.writeFileSync(filepath, JSON.stringify(snapshot.exportVal()), "utf-8");
  return;
}

async function main() {
  // await generateEmailList("./emails.txt");
  await createBackupFile(`./backups/${generateFileName("cmu24")}.json`);
  process.exit(0);
}

main();
