import express, { Express, Request, Response } from "express";
import http from "http";
import https from "https";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

var privateKey = fs.readFileSync("src/decrypted_private_key.txt");
var certificate = fs.readFileSync("src/certificate.txt");
var apig_cert = fs.readFileSync("src/certificate_chain.txt");
var credentials = {
  key: privateKey,
  cert: certificate,
  ca: apig_cert,
  requestCert: true,
  rejectUnauthorized: false,
};

const app = express();
let port: number = 443;
let count = 0;

if (typeof process.env.PORT == "string") {
  port = parseInt(process.env.PORT);
}

app.get("/", (req, res) => {
  console.log(`new request mtls${count}`);
  res.send(`Hello World mtls! ${count}`);
  count++;
});

const serverinst = https.createServer(credentials, app);
serverinst.listen(port, () => {
  console.log(`HTTPs server app listening on port ${port}`);
});
