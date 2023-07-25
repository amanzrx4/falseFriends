var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from "express";
import { reclaimprotocol } from "@reclaimprotocol/reclaim-sdk";
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyCsvkMW9tY2QcqEiRVgltN0V86sjuHlddA",
    authDomain: "falsefriends-2f64b.firebaseapp.com",
    databaseURL: "https://falsefriends-2f64b-default-rtdb.firebaseio.com",
    projectId: "falsefriends-2f64b",
    storageBucket: "falsefriends-2f64b.appspot.com",
    messagingSenderId: "606869841265",
    appId: "1:606869841265:web:940e37bc788c8e82fa42d0",
    measurementId: "G-PEVSF3P3R0",
};
const app = express();
const port = 3000;
const FApp = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(FApp);
const reclaim = new reclaimprotocol.Reclaim();
app.use(express.text({ type: "*/*" }));
const BASE_CALLBACK_URL = "http://192.168.68.101:3000/callback";
// Called from frontend on initial load if user is not loggedin
// @ts-ignore
app.get("/uid", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const request = reclaim.requestProofs({
            title: "False Friends",
            baseCallbackUrl: BASE_CALLBACK_URL,
            requestedProofs: [
                new reclaim.CustomProvider({
                    provider: "google-login",
                    payload: {},
                }),
            ],
        });
        // Store the callback Id and Reclaim URL in your database
        const { callbackId } = request;
        const url = yield request.getReclaimUrl();
        console.log(callbackId);
        // ... store the callbackId and reclaimUrl in your database
        res.json({ callbackId, reclaimUrl: url });
    }
    catch (error) {
        console.error("Error requesting proofs:", error);
        res.status(500).json({ error: "Failed to request proofs" });
    }
}));
// Frontend call to check if claim is submitted expects callbackId
// @ts-ignore
app.get("/verified", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //implement firebase to check if user is existing or not
}));
// @ts-ignore
app.post("/callback/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let html = `<!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Pacifico&display=swap');

            body {
                margin: 0;
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
                background-size: 400% 400%;
                animation: gradient 15s ease infinite;
            }

            .message {
                text-align: center;
                font-size: 3em;
                color: white; 
                font-family: 'Pacifico', cursive;
                animation: bounce 2s infinite;
            }

            @keyframes bounce {
                0%, 20%, 50%, 80%, 100% {
                  transform: translateY(0);
                }
                40% {
                  transform: translateY(-30px);
                }
                60% {
                  transform: translateY(-15px);
                }
              }

            .closing {
                font-size: 1.5em;
                color: white;
                margin-top: 20px;
                text-shadow: 2px 2px 4px #000000;
            }
        </style>
    </head>
    <body>
        <div class="message">Welcome to <br> False Friends</div>
        <div class="closing">You can close this app now</div>
    </body>
    </html>`;
    const { id } = req.query;
    const { proofs } = JSON.parse(decodeURIComponent(req.body));
    console.log(proofs);
    const onChainClaimIds = reclaim.getOnChainClaimIdsFromProofs(proofs);
    const parameters = JSON.parse(proofs[0].parameters);
    const signature = proofs[0].signatures;
    const emailAddress = parameters.emailAddress;
    try {
        yield addDoc(collection(db, "users"), {
            uid: id,
            params: parameters,
            username: signature,
        });
    }
    catch (e) {
        console.log("error here", e);
        res.status(400).json({ error: "Firebase error" });
        return;
    }
    //store the following on firebase
    // console.log("callbackid", id)
    // console.log("emailAddress", emailAddress)
    // console.log("userName", signatures[0])
    /* Wont be able to run until testflight app works */
    //   const isProofsCorrect = await reclaim.verifyCorrectnessOfProofs(id, proofs);
    //   console.log(isProofsCorrect)
    //   if (isProofsCorrect) {
    //     console.log("Proofs submitted:", proofs);
    //     // store proofs in your backend for future use
    //     res.json({ success: true });
    //   } else {
    //     console.error("Proofs verification failed");
    //     res.status(400).json({ error: "Proofs verification failed" });
    //   }
    res.send(html);
}));
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
});
