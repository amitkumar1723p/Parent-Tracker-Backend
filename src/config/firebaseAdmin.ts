
import admin from "firebase-admin";
import path from "path";

const serviceAccountPath = path.join(
    process.cwd(),
    "firebase-admin.json"
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
    });
}

export default admin;











