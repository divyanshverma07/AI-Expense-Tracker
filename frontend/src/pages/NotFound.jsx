import { Link } from "react-router-dom";
export default function NotFound(){return <div className="not-found"><div><span className="eyebrow">404</span><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link className="primary-btn" to="/dashboard">Back to dashboard</Link></div></div>}
