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
    throw "no data available"
  }
  return snapshot.val();
}

function getEmailList(competitors: any) {
  const emails = Object.values(competitors).map((c: any) => c.email);
  const unique = new Set();
  emails.forEach((email) => unique.add(email));
  return Array.from(unique);
}

async function generateEmailList() {
  const competitors = await getCompetitors();
  const list = getEmailList(competitors);
  fs.writeFileSync("emails.txt", list.join("\n"), "utf-8");
  return;
}

async function main() {
  // generateEmailList();
  process.exit(0);
}

main();
