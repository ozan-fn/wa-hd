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
        if (
            !fs.existsSync(path.join(__dirname, "../../session/Default/IndexedDB")) || //
            !fs.existsSync(path.join(__dirname, "../../session/Default/Local Storage"))
        )
            return;
        const zip = new AdmZip();
        zip.addLocalFolder(path.join(__dirname, "../../session/Default/IndexedDB"), "IndexedDB");
        zip.addLocalFolder(path.join(__dirname, "../../session/Default/Local Storage"), "Local Storage");
        const buffer = zip.toBuffer();

        await SessionModel.findOneAndUpdate({}, { buffer, savedAt: new Date() }, { upsert: true });
        console.log("Session data saved to MongoDB");
    }

    public async load(): Promise<void> {
        const sessionDocument = await SessionModel.findOne();
        if (!sessionDocument || !sessionDocument.buffer) {
            console.log("No session data found in MongoDB");
            return;
        }

        const zip = new AdmZip(sessionDocument?.buffer);
        zip.extractAllTo(path.join(__dirname, "../../session/Default"), true);
        console.log("Session data loaded from MongoDB");
    }
}
