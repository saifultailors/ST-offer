"use client";
import { useState } from "react";
export default function Admin() {
 const [password,setPassword]=useState(""); const [msg,setMsg]=useState("");
 async function login(e:React.FormEvent){e.preventDefault();const r=await fetch("/api/admin-login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});const d=await r.json();setMsg(r.ok?"লগইন সফল। অ্যাডমিন API ও অফার ম্যানেজমেন্ট পরবর্তী সেটআপে সক্রিয় করতে হবে.":d.error||"লগইন ব্যর্থ।");}
 return <main className="shell"><section className="panel"><p className="eyebrow">SAIFUL TAILORS</p><h1>অ্যাডমিন লগইন</h1><p className="muted">অ্যাডমিন প্যানেল ব্যক্তিগত ব্যবহারের জন্য।</p><form className="form" onSubmit={login}><label>অ্যাডমিন পাসওয়ার্ড<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><button className="primary">লগইন</button></form>{msg&&<p className="status">{msg}</p>}<p className="muted">নোট: লাইভ ব্যবহারের আগে সার্ভার-সাইড অ্যাডমিন অনুমোদন ও অফার পরিচালনার API সেটআপ সম্পূর্ণ করতে হবে।</p></section></main>;
}
