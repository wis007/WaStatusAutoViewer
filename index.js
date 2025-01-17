const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');
const axios = require('axios');
const qrcode = require('qrcode-terminal');

async function connectWhatsapp() {
    console.log("Initialisation pour se connecter à mon compte...");
    const auth = await useMultiFileAuthState("session");
    const socket = makeWASocket({
        //printQRInTerminal: true,
        browser: ["WisBrowser", "", ""],
        auth: auth.state,
        logger: pino({ level: "silent" }),
    });

    socket.ev.on("creds.update", auth.saveCreds);
    socket.ev.on("connection.update", async ({ connection, qr }) => {
        if (connection === "open") {
            console.log("Wis Auto Status Bot operationel ✅");
        } else if (qr) {
            qrcode.generate(qr, { small: true }); // Génère un QR code plus petit
        } else if (connection === "close") {
            console.log("Connexion fermé. En attente de reconnexion...");
            await connectWhatsapp();
        }
    });

    socket.ev.on("messages.upsert", async ({ messages, type }) => {
        //console.log("Nouvelle detection de message:", messages);
        const chat = messages[0];
        
        
        if (chat.key.fromMe) {
            return;
        }

        let pesan = (chat.message?.extendedTextMessage?.text ?? chat.message?.ephemeralMessage?.message?.extendedTextMessage?.text ?? chat.message?.conversation)?.toLowerCase() || "";
        
        if(chat.key.remoteJid == "status@broadcast"){
            console.log("Nouveau Status");
            await socket.readMessages([chat.key]);
            console.log("Status Vu : ", chat.key);
        }

    });
}

connectWhatsapp();
