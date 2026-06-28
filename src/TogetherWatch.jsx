import { useState, Component } from "react";
import Landing from "./components/Landing.jsx";
import Room from "./components/Room.jsx";

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: "2rem", color: "#f87171", fontFamily: "monospace" }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: ".8rem", opacity: .8 }}>
            {this.state.err.message}
            {"\n\n"}
            {this.state.err.stack}
          </pre>
          <button onClick={() => this.setState({ err: null })} style={{ marginTop: "1rem", padding: ".5rem 1.2rem", cursor: "pointer" }}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TogetherWatch() {
  const [session, setSession] = useState(null);
  return (
    <ErrorBoundary>
      {session
        ? <Room session={session} onLeave={() => setSession(null)} />
        : <Landing onEnter={setSession} />}
    </ErrorBoundary>
  );
}
