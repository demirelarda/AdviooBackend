const admin = require('firebase-admin');
const db = admin.firestore();
const TermsConditions = require('../models/TermsConditionsModel');


exports.acceptTermsConditions = async (req, res) => {
    const { userId, userEmail, termsVersion, termsAccepted, userFullName } = req.body;
    let userIP = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    userIP = userIP.split(',')[0].trim();

    try {
        const docRef = await db.collection('terms_acceptance').add({
            userId,
            userEmail,
            termsVersion,
            termsAccepted,
            userFullName,
            date: admin.firestore.FieldValue.serverTimestamp(),
            userIP
        });

        const userRef = db.collection('users').doc(userId);
        await userRef.update({
            acceptedTermsId: docRef.id
        });

        res.status(200).send({
            success: true,
            message: 'Terms and conditions accepted successfully'
        });
    } catch (error) {
        console.error('Error accepting terms and conditions:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to accept terms and conditions'
        });
    }
};



exports.getTermsConditions = async (req, res) => {
    try {
        const latestTerms = await TermsConditions
            .findOne() 
            .sort({ addedOn: -1 })
            .limit(1);

        if (!latestTerms) {
            return res.status(404).send({
                success: false,
                message: 'No terms and conditions found',
            });
        }

        res.status(200).send({
            latestTerms,
        });
    } catch (error) {
        console.error('Error fetching terms and conditions:', error);
        res.status(500).send({
            success: false,
            message: 'Failed to fetch terms and conditions',
        });
    }
};