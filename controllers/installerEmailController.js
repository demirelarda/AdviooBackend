const admin = require('firebase-admin');
const db = admin.firestore();
const mailjet = require('node-mailjet').apiConnect(process.env.MJ_APIKEY_PUBLIC, process.env.MJ_APIKEY_PRIVATE);

exports.sendEmailToInstaller = async (req, res) => {
    const { installerId, campaignTitle, carBrand, carModel, phoneNumber, campaignId } = req.body;

    try {
        const installerDoc = await db.collection('installers').doc(installerId).get();

        if (!installerDoc.exists) {
            return res.status(404).json({ error: "Installer not found" });
        }

        const installerData = installerDoc.data();
        const installerEmail = installerData.installerEmail;
        const installerName = installerData.installerName;

        const request = mailjet.post("send", { 'version': 'v3.1' }).request({
            "Messages": [
                {
                    "From": {
                        "Email": "hello@advioo.com",
                        "Name": "Advioo"
                    },
                    "To": [
                        {
                            "Email": installerEmail,
                            "Name": installerName
                        }
                    ],
                    "Subject": "New Customer",
                    "HTMLPart": `
                    <h3>You have a new customer!</h3>
                    <p>Here is the contact information of your customer:</p>
                    <p><strong>Campaign Name:</strong> ${campaignTitle}</p>
                    <p><strong>Car Model:</strong> ${carBrand}, ${carModel}</p>
                    <p><strong>Phone Number:</strong> ${phoneNumber}</p>
                    <p style="color: red;">Please contact your customer as soon as possible.</p>
                    <p style="color: blue; font-weight: bold;">advioo.com</p>
                    `
                }
            ]
        });

        request.then(result => {
            console.log(result.body);
            res.status(200).json({ message: "Email sent successfully." });
        }).catch(err => {
            console.log(err.statusCode);
            res.status(500).json({ error: "Failed to send email." });
        });

    } catch (error) {
        console.error("Error fetching installer data:", error);
        return res.status(500).json({ error: "Failed to fetch installer data" });
    }
};
