import express from "express";
import { reclaimprotocol, Proof } from "@reclaimprotocol/reclaim-sdk";
import { initializeApp } from "firebase/app";
import { getFirestore, addDoc, collection } from "firebase/firestore";
import { User } from "../types";

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

// Called from frontend on initial load if user is not loggedin
app.get("/uid", async (req, res) => {
  try {
    const request = reclaim.requestProofs({
      title: "False Friends",
      baseCallbackUrl: "https://falsefriends.akshaynarisett1.repl.co/callback",
      requestedProofs: [
        new reclaim.CustomProvider({
          provider: "google-login",
          payload: {},
        }),
      ],
    });
    // Store the callback Id and Reclaim URL in your database
    const { callbackId } = request;
    const url = await request.getReclaimUrl();
    console.log(callbackId);
    // ... store the callbackId and reclaimUrl in your database
    res.json({ callbackId, reclaimUrl: url });
  } catch (error) {
    console.error("Error requesting proofs:", error);
    res.status(500).json({ error: "Failed to request proofs" });
  }
});

// Frontend call to check if claim is submitted expects callbackId
app.get("/verified", async (req, res) => {
  //implement firebase to check if user is existing or not
});

app.post("/callback/", async (req, res) => {
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
  //   const onChainClaimIds = reclaim.getOnChainClaimIdsFromProofs(proofs);
  const parameters = JSON.parse(proofs[0].parameters) as User["params"];
  const signature = proofs[0].signatures;

  try {
    await addDoc(collection(db, "users"), {
      uid: id,
      params: parameters,
      username: signature,
    } as User);
  } catch {
    res.status(400).json({ error: "Firebase error" });
    return;
  }

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
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
