import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <Link to="/chat">
        <button>Go to Chat</button>
      </Link>
    </div>
  );
}
