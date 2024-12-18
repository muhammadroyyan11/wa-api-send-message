const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

client.once('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.initialize();

// API to send a message
const api = async (req, res) => {
    let nohp = req.query.nohp || req.body.nohp;  
    const pesan = req.query.pesan || req.body.pesan;
    const groupName = req.query.group || req.body.group; // Group name parameter

    try {
        if (groupName) {
            // Search for the group by name
            const chats = await client.getChats();
            const group = chats.find(chat => chat.isGroup && chat.name.toLowerCase() === groupName.toLowerCase());

            if (group) {
                // Send message to the group
                await client.sendMessage(group.id._serialized, pesan);
                return res.json({ status: "Success", pesan: `Message sent to group: ${groupName}` });
            } else {
                return res.json({ status: "Failed", pesan: "Group not found" });
            }
        }

        if (nohp) {
            // Normalize phone number format for WhatsApp
            if (nohp.startsWith("0")) {
                nohp = "62" + nohp.slice(1) + "@c.us";
            } else if (nohp.startsWith("62")) {
                nohp = nohp + "@c.us";
            } else {
                nohp = "62" + nohp + "@c.us";
            }

            // Check if the number is registered on WhatsApp
            const user = await client.isRegisteredUser(nohp);

            if (user) {
                // Send message
                await client.sendMessage(nohp, pesan);
                return res.json({ status: "Success", pesan });
            } else {
                return res.json({ status: "Failed", pesan: "Number is not registered" }); 
            }
        }

        return res.status(400).json({ status: "Failed", pesan: "No recipient provided" });
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({ status: "error", pesan: "Server error", details: error.message });
    }
};

module.exports = api;
