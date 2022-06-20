import express, { Express, Request, Response } from "express";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

var privateKey = fs.readFileSync("src/decrypted_private_key.txt");
var certificate = fs.readFileSync("src/certificate.txt");
var credentials = { key: privateKey, cert: certificate };

const app = express();
let port: number = 3000;

if (typeof process.env.PORT == "string") {
  port = parseInt(process.env.PORT);
}

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const serverinst = https.createServer(credentials, app);
serverinst.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
