import AdmZip from "adm-zip";
import mongoose, { Schema, model } from "mongoose";
import path from "path";
import fs from "fs";

const SessionSchema = new Schema({ buffer: { type: Buffer, required: true }, savedAt: { type: Date } });
const SessionModel = model("Session", SessionSchema);

export class Session {
	constructor() {
		mongoose.connect(process.env.MONGO_URI as string);
	}

	public async save(): Promise<void> {
		const indexedDBPath = path.join(__dirname, "../../session/Default/IndexedDB");
		const localStoragePath = path.join(__dirname, "../../session/Default/Local Storage");

		if (!fs.existsSync(indexedDBPath) || !fs.existsSync(localStoragePath)) return;

		// Buat folder sementara
		const tempDir = path.join(__dirname, "../../temp_backup");
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

		// Salin folder dengan fs.cp yang tersedia di Node.js versi terbaru
		try {
			await fs.promises.cp(indexedDBPath, path.join(tempDir, "IndexedDB"), { recursive: true });
			await fs.promises.cp(localStoragePath, path.join(tempDir, "Local Storage"), { recursive: true });

			const zip = new AdmZip();
			zip.addLocalFolder(path.join(tempDir, "IndexedDB"), "IndexedDB");
			zip.addLocalFolder(path.join(tempDir, "Local Storage"), "Local Storage");
			const buffer = zip.toBuffer();

			await SessionModel.findOneAndUpdate({}, { buffer, savedAt: new Date() }, { upsert: true });
			console.log("Session data saved to MongoDB");
		} catch (error) {
			console.error("Error during backup:", error);
		} finally {
			// Bersihkan folder sementara
			fs.rmSync(tempDir, { recursive: true, force: true });
		}
	}

	public async load(): Promise<void> {
		const sessionDocument = await SessionModel.findOne();
		if (!sessionDocument || !sessionDocument.buffer) {
			console.log("No session data found in MongoDB");
			return;
		}

		const zip = new AdmZip(sessionDocument?.buffer);
		zip.extractAllTo(path.join(__dirname, "../../session/Default"), true, true);
		console.log("Session data loaded from MongoDB");
	}
}
