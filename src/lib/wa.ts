import path from "path";
import { Client, LocalAuth } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import { Session } from "./backup";

const session = new Session();
export class WhatsAppClient {
	public client: Client;
	public ready: boolean = false;

	constructor() {
		this.client = new Client({
			authStrategy: new LocalAuth({
				dataPath: path.join(__dirname, "../.."),
			}),
			puppeteer: {
				headless:
					process.env.NODE_ENV === "production" //
						? true
						: false,
				executablePath:
					process.env.NODE_ENV === "production" //
						? "/usr/bin/brave-browser"
						: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
				args: [
					"--no-sandbox", //
					"--disable-setuid-sandbox",
				],
			},
		});
	}

	public async initialize() {
		await session.load();

		this.client.once("ready", async () => {
			this.ready = true;
			await this.client.setAutoDownloadAudio(false);
			await this.client.setAutoDownloadDocuments(false);
			await this.client.setAutoDownloadPhotos(false);
			await this.client.setAutoDownloadVideos(false);
			setTimeout(session.save, 5_000);
			console.log("Client is ready!");
		});

		this.client.on("qr", (qr) => {
			qrcode.generate(qr, { small: true });
		});

		await this.client.initialize();
	}
}
