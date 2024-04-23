const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const PORT = 7271;

const app = express();

app.use(cookieParser("cookie-secret"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

const user = {
    id: 8266808,
    username: "FukutoTojido",
    password: "password",
};

app.listen(PORT, () => {
    console.log("Auth Server is up!");
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"));
});

app.post("/login", (req, res) => {
    const { username, password, redirectUrl } = req.body;
    console.log(req.redirectUrl);

    if (!username || !password) {
        res.status(401).send();
        return;
    }

    if (username !== user.username || password !== user.password) {
        res.status(401).send();
        return;
    }

    const token = jwt.sign({ UID: user.id }, "jwt-secret-one", { expiresIn: "1d" });
    res.redirect(`${redirectUrl}?accessToken=${token}`);
    return;
});

app.get("/auth", (req, res) => {
    const { accessToken } = req.query;
    if (!accessToken) return res.status(401).send();

    try {
        const { UID } = jwt.verify(accessToken, "jwt-secret-one");
        if (!UID) throw "HUH?";

        return res.json({ UID });
    } catch (error) {
        console.log(error);
        return res.status(401).send();
    }
});