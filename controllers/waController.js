const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.once('ready', () => {
    console.log('Client is ready!');
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.initialize();

const api = async (req, res) => {
    let nohp = req.query.nohp || req.body.nohp;  
    const pesan = req.query.pesan || req.body.pesan;

    try {
    
        if (nohp.startsWith("0")) {
            nohp = "62" + nohp.slice(1) + "@c.us";
        } else if (nohp.startsWith("62")) {
            nohp = nohp + "@c.us";
        } else {
            nohp = "62" + nohp + "@c.us";
        }

        // Cek nomer terdaftar ?
        const user = await client.isRegisteredUser(nohp);

        if (user) {
            await client.sendMessage(nohp, pesan);
            return res.json({ status: "Success", pesan });
        } else {
            return res.json({ status: "Failed", pesan: "Number is not registered" }); 
        }
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).json({ status: "error", pesan: "Server error" });
    }
}

module.exports = api;