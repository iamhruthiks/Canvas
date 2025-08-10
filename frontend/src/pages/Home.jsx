export default function Home() {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to Canvas!</h1>
        <p>
          Create, draw, and export your designs with ease. Start a new canvas or
          continue working on your existing canvas.
        </p>
        <div className="home-buttons">
          {/* <a href="/dashboard" className="btn-primary">
            Go to Dashboard
          </a> */}
          <a
            href="https://hruthiks.vercel.app"
            className="btn-secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Connect with me
          </a>
        </div>
      </div>
    </div>
  );
}
