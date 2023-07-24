import { useEffect, useMemo, useRef, useState } from "react";
import { onValue, ref, serverTimestamp, push, set } from "firebase/database";
import "./App.css";
import { firebaseDatabase } from "./firebase";
import { Message } from "./types";

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useMemo(() => ref(firebaseDatabase, "messages"), []);

  useEffect(() => {
    return onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) return;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const data = Object.values(snapshot.val()) as Message[];
      if (data) {
        setMessages(data);
      }
    });
  }, [messagesRef]);

  // const [count, setCount] = useState(0);

  // return (
  //   <>
  //     <div>
  //       <a href="https://vitejs.dev" target="_blank">
  //         <img src={viteLogo} className="logo" alt="Vite logo" />
  //       </a>
  //       <a href="https://react.dev" target="_blank">
  //         <img src={reactLogo} className="logo react" alt="React logo" />
  //       </a>
  //     </div>
  //     <h1>Vite + React</h1>
  //     <div className="card">
  //       <button onClick={() => setCount((count) => count + 1)}>
  //         count is {count}
  //       </button>
  //       <p>
  //         Edit <code>src/App.tsx</code> and save to test HMR
  //       </p>
  //     </div>
  //     <p className="read-the-docs">
  //       Click on the Vite and React logos to learn more
  //     </p>
  //   </>
  // )
  const dummy = useRef<HTMLElement | null>(null);
  // const messagesRef = firestore.collection('messages');
  // const query = messagesRef.orderBy("createdAt").limit(25);

  // const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    const newMessageRef = push(messagesRef);

    await set(newMessageRef, {
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
