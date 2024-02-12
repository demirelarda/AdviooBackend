exports.getCurrentTime = (req, res) => {
    const date = new Date();
    res.json({ currentTime: date.toGMTString() });
};