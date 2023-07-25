import { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref, serverTimestamp, push } from "firebase/database";
import { Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { firebaseDatabase, firestore } from "./firebase";
import { Message } from "../../types";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import QRCode from "qrcode.react";
import { collection, getDocs, query, where } from "firebase/firestore";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

function Home() {
  const navigate = useNavigate();
  const [callbackId, setCallbackId] = useState("");
  const [reclaimUrl, setReclaimUrl] = useState("");

  useEffect(() => {
    // Check if userName exists in localStorage
    const userName = localStorage.getItem("userName");
    if (userName) {
      navigate("/chat");
    } else {
      // Fetch the callbackId and reclaimUrl on initial render
      axios
        .get("https://falsefriends.akshaynarisett1.repl.co/uid")
        .then((response) => {
          const { callbackId, reclaimUrl } = response.data;
          console.log(callbackId);
          console.log(reclaimUrl);
          setCallbackId(callbackId);
          setReclaimUrl(reclaimUrl);
        })
        .catch((err) => console.error(err));
    }
  }, []);

  useEffect(() => {
    // Start polling to the verification API
    if (callbackId !== "") {
      const interval = setInterval(() => {
        axios
          .get(
            `https://falsefriends.akshaynarisett1.repl.co/verified?callbackId=${callbackId}`
          )
          .then((response) => {
            const { registered, userName } = response.data;

            if (registered === "true") {
              localStorage.setItem("userName", userName);
              clearInterval(interval);
              navigate("/chat");
            }
          })
          .catch((err) => console.error(err));
      }, 2000);

      return () => clearInterval(interval); // Cleanup
    }
  }, [callbackId, navigate]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          border: "2px solid #ddd",
          borderRadius: "5px",
          padding: "30px",
          boxShadow:
            "0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23)",
          maxWidth: "300px",
          background: "linear-gradient(to right, #ff9966, #ff5e62)",
          color: "white",
        }}
      >
        <h1>False Friends</h1>
        {reclaimUrl ? (
          <>
            <QRCode
              value={reclaimUrl}
              style={{ marginBottom: "20px", marginTop: "20px" }}
            />

            <a
              href={reclaimUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "10px 20px",
                backgroundColor: "white",
                color: "#ff5e62",
                borderRadius: "5px",
                textDecoration: "none",
                marginTop: "20px",
                boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
              }}
            >
              Open Link
            </a>
          </>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useMemo(() => ref(firebaseDatabase, "messages"), []);
  const dummy = useRef<HTMLElement | null>(null);
  const [formValue, setFormValue] = useState("");
  const navi = useNavigate();

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = Object.values(snapshot.val()) as Message[];
      if (data) {
        setMessages(data);
      }
    });
  }, [messagesRef]);

  const sendMessage = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const userName = localStorage.getItem("userName");

    const q = query(
      collection(firestore, "users"),
      where("userName", "==", userName)
    );

    const docSnap = (await getDocs(q)).docs;

    if (docSnap.length === 0) {
      localStorage.clear();
      navi("/");
    }

    const user = docSnap[0].data();

    push(messagesRef, {
      userId: user.userName,
      content: formValue,
      createdAt: serverTimestamp(),
    } as Message);

    setFormValue("");
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <main>
        {messages.map((props, i) => (
          <ChatMessage key={i} {...props} />
        ))}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />

        <button type="submit" disabled={!formValue}>
          send
        </button>
      </form>
      <Link to="/">Go back home</Link>
    </>
  );
}

type Props = Message;

function ChatMessage({ content, userId }: Props) {
  const userName = localStorage.getItem("callbackId");

  const messageClass = userName === userId ? "sent" : "received";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            "https://png.pngtree.com/png-clipart/20201224/ourmid/pngtree-funny-cartoon-character-avatar-original-png-image_2618453.jpg"
          }
        />
        <p>{content}</p>
      </div>
    </>
  );
}

export default App;
