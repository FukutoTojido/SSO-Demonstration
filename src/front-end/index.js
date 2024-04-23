const express = require("express");
const { engine } = require("express-handlebars");
const cookieParser = require("cookie-parser");

const PORT = 7272;

const AUTH_SERVER = `http://localhost:7271`;
const authMiddleware = async (req, res, next) => {
    if (req.query.accessToken) {
        res.cookie("Authorization", req.query.accessToken, {
            expires: new Date(new Date().setDate(new Date().getDate() + 1)),
            httpOnly: true,
            signed: true,
        });
        return res.redirect("/");
    }

    const fetchRes = await fetch(`${AUTH_SERVER}/auth?accessToken=${req.signedCookies["Authorization"]}`);

    if (fetchRes.status !== 200) {
        return next();
    }

    const { UID } = await fetchRes.json();
    req.UID = UID;
    return next();
};

const app = express();
app.engine("handlebars", engine());
app.use(cookieParser("cookie-secret"));
app.set("view engine", "handlebars");
app.set("views", "./views");

app.listen(PORT, () => {
    console.log("Frontend Server is up!");
});

app.get("/", authMiddleware, (req, res) => {
    const { UID } = req;
    res.render("home", {
        layout: false,
        UID,
        notLogin: UID ? false : true,
        status: UID ? `Logged in! Your UID: ${UID}` : "You have not logged in yet!",
    });
});
