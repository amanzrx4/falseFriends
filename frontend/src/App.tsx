import { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref, serverTimestamp, push } from "firebase/database";
import { BrowserRouter as Routes, Route, Link } from "react-router-dom";
import "./App.css";
import { firebaseDatabase } from "./firebase";
import { Message } from "../../types";
import Home from "./components/Home";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useMemo(() => ref(firebaseDatabase, "messages"), []);
  const dummy = useRef<HTMLElement | null>(null);
  const [formValue, setFormValue] = useState("");

  useEffect(() => {
    return onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      const data = Object.values(snapshot.val()) as Message[];
      if (data) {
        setMessages(data);
      }
    });
  }, [messagesRef]);

  useEffect(() => {
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    await push(messagesRef, {
      userId: "aman",
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

function ChatMessage({ content }: Props) {
  const messageClass = "received";

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
