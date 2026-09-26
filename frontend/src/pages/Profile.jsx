import { Mail, UserRound } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Profile(){
 const {user}=useAuth();
 return <div className="page"><div className="page-heading"><div><span className="eyebrow">Account</span><h1>Profile</h1><p>Your account information.</p></div></div>
 <section className="card profile-card"><div className="profile-avatar">{(user?.full_name||"U").charAt(0).toUpperCase()}</div><div className="profile-info"><h2>{user?.full_name||"User"}</h2><div className="profile-line"><Mail size={17}/>{user?.email}</div><div className="profile-line"><UserRound size={17}/>User ID: {user?.user_id ?? "—"}</div></div></section></div>
}
