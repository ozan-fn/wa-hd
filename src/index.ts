import express from "express";
import { Server } from "socket.io";
import multer, { memoryStorage } from "multer";
import http from "http";
import { tmpdir } from "os";
import { WhatsAppClient } from "./lib/wa";
import { MessageMedia } from "whatsapp-web.js";
import fs from "fs";

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);
const io = new Server(server);
const upload = multer({ dest: tmpdir() });
const wa = new WhatsAppClient();
wa.initialize();

io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	socket.on("disconnect", () => {
		console.log("User disconnected:", socket.id);
	});
});

app.post("/api/upload", upload.single("file"), async (req, res): Promise<any> => {
	try {
		const file = req.file;
		const { caption, nowa } = req.body;

		if (!file || !nowa) return res.sendStatus(400);

		await wa.client.sendMessage(nowa, new MessageMedia(file.mimetype, fs.readFileSync(file.path, "base64")), {
			caption: caption || undefined,
		});

		res.sendStatus(200);
	} catch (error) {
		console.error(error);
		res.sendStatus(500);
	}
});

server.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
