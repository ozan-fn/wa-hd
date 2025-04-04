import path from "path";
import { Client, LocalAuth, MessageMedia } from "whatsapp-web.js";
import qrcode from "qrcode-terminal";

export class WhatsAppClient {
	public client: Client;
	public ready: boolean = false;

	constructor() {
		this.client = new Client({
			authStrategy: new LocalAuth({
				dataPath: path.join(__dirname, "../.."),
			}),
			puppeteer: {
				headless: false,
				executablePath:
					process.env.NODE_ENV === "production" //
						? "/usr/bin/brave-browser"
						: "C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe",
			},
		});
	}

	public async initialize() {
		this.client.once("ready", async () => {
			this.ready = true;
			await this.client.setAutoDownloadAudio(false);
			await this.client.setAutoDownloadDocuments(false);
			await this.client.setAutoDownloadPhotos(false);
			await this.client.setAutoDownloadVideos(false);
			console.log("Client is ready!");
		});

		this.client.on("qr", (qr) => {
			qrcode.generate(qr, { small: true });
		});

		await this.client.initialize();
	}
}
