module.exports = function (app) {
    app.get('/profile', function (req, res) {
        res.writeHead(200, {"content-type" : "text/plain"});
        res.write("on profile page");
        res.end();
    });
};
