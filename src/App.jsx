import { useState, useEffect, useRef } from "react";
window.storage = {
  async get(key) {
    const v = localStorage.getItem(key);
    return v ? { value: v } : null;
  },
  async set(key, value) {
    localStorage.setItem(key, value);
    return { value };
  },
  async delete(key) {
    localStorage.removeItem(key);
    return { deleted: true };
  }
};


const ADMIN_PASSWORD = "admin123";

// --- Storage helpers ---
async function storageGet(key) {
  try { const r = await window.storage.get(key, true); return r ? JSON.parse(r.value) : null; } catch { return null; }
}
async function storageSet(key, val) {
  try { await window.storage.set(key, JSON.stringify(val), true); } catch {}
}

// ---- Fonts ----
const style = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700&family=JetBrains+Mono:wght@400;600&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Sora', sans-serif; }
:root {
  --bg: #0d1117;
  --panel: #161b22;
  --panel2: #1c2333;
  --border: #30363d;
  --accent: #00e5a0;
  --accent2: #0dcaf0;
  --text: #e6edf3;
  --muted: #8b949e;
  --msg-me: #1a3a2a;
  --msg-other: #1c2333;
  --danger: #f85149;
  --warn: #d29922;
}
.app { display:flex; height:100vh; background:var(--bg); color:var(--text); overflow:hidden; }
.sidebar { width:300px; border-right:1px solid var(--border); display:flex; flex-direction:column; background:var(--panel); flex-shrink:0; }
.sidebar-header { padding:18px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; }
.logo { font-weight:700; font-size:18px; color:var(--accent); letter-spacing:-0.5px; }
.logo span { color:var(--accent2); }
.search-wrap { padding:10px 12px; border-bottom:1px solid var(--border); }
.search-wrap input { width:100%; background:var(--panel2); border:1px solid var(--border); border-radius:8px; padding:8px 12px; color:var(--text); font-size:13px; font-family:inherit; outline:none; }
.search-wrap input:focus { border-color:var(--accent); }
.contacts { flex:1; overflow-y:auto; }
.contact-item { display:flex; align-items:center; gap:10px; padding:12px 14px; cursor:pointer; border-bottom:1px solid rgba(48,54,61,0.5); transition:background 0.15s; }
.contact-item:hover { background:var(--panel2); }
.contact-item.active { background:rgba(0,229,160,0.08); border-left:3px solid var(--accent); }
.avatar { width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:15px; flex-shrink:0; }
.contact-info { flex:1; min-width:0; }
.contact-name { font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.contact-preview { font-size:12px; color:var(--muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px; }
.unread-badge { background:var(--accent); color:#000; font-size:11px; font-weight:700; border-radius:10px; padding:2px 7px; }
.chat-area { flex:1; display:flex; flex-direction:column; }
.chat-header { padding:14px 20px; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:12px; background:var(--panel); }
.online-dot { width:8px; height:8px; border-radius:50%; background:var(--accent); margin-left:4px; display:inline-block; animation:pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
.messages { flex:1; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:8px; }
.msg-wrap { display:flex; }
.msg-wrap.me { justify-content:flex-end; }
.bubble { max-width:65%; padding:10px 14px; border-radius:16px; font-size:14px; line-height:1.5; position:relative; }
.bubble.me { background:var(--msg-me); border-bottom-right-radius:4px; color:var(--text); }
.bubble.other { background:var(--msg-other); border-bottom-left-radius:4px; }
.bubble-sender { font-size:11px; color:var(--accent); font-weight:600; margin-bottom:4px; }
.bubble-time { font-size:10px; color:var(--muted); margin-top:4px; text-align:right; font-family:'JetBrains Mono',monospace; }
.input-area { padding:14px 20px; border-top:1px solid var(--border); display:flex; gap:10px; align-items:center; background:var(--panel); }
.input-area input { flex:1; background:var(--panel2); border:1px solid var(--border); border-radius:24px; padding:11px 18px; color:var(--text); font-size:14px; font-family:inherit; outline:none; transition:border 0.2s; }
.input-area input:focus { border-color:var(--accent); }
.send-btn { width:44px; height:44px; border-radius:50%; background:var(--accent); border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:transform 0.15s,opacity 0.15s; flex-shrink:0; }
.send-btn:hover { transform:scale(1.08); opacity:0.9; }
.send-btn svg { color:#000; }
.empty-chat { flex:1; display:flex; align-items:center; justify-content:center; flex-direction:column; gap:12px; color:var(--muted); }
.empty-chat .big { font-size:48px; }
/* Auth */
.auth-wrap { width:100vw; height:100vh; background:var(--bg); display:flex; align-items:center; justify-content:center; }
.auth-card { background:var(--panel); border:1px solid var(--border); border-radius:20px; padding:40px 36px; width:360px; }
.auth-title { font-size:22px; font-weight:700; color:var(--accent); margin-bottom:6px; }
.auth-sub { font-size:13px; color:var(--muted); margin-bottom:28px; }
.field { margin-bottom:16px; }
.field label { font-size:12px; font-weight:600; color:var(--muted); display:block; margin-bottom:6px; letter-spacing:0.5px; text-transform:uppercase; }
.field input { width:100%; background:var(--panel2); border:1px solid var(--border); border-radius:10px; padding:11px 14px; color:var(--text); font-size:14px; font-family:inherit; outline:none; transition:border 0.2s; }
.field input:focus { border-color:var(--accent); }
.btn { width:100%; padding:12px; border-radius:10px; border:none; font-size:15px; font-weight:600; font-family:inherit; cursor:pointer; transition:opacity 0.2s,transform 0.15s; }
.btn:hover { opacity:0.88; transform:translateY(-1px); }
.btn-primary { background:var(--accent); color:#000; }
.btn-secondary { background:var(--panel2); color:var(--text); border:1px solid var(--border); }
.err { color:var(--danger); font-size:13px; margin-top:-8px; margin-bottom:10px; }
.success { color:var(--accent); font-size:13px; margin-bottom:10px; }
/* Admin panel */
.admin-panel { flex:1; padding:24px; overflow-y:auto; }
.admin-title { font-size:20px; font-weight:700; margin-bottom:20px; }
.user-row { display:flex; align-items:center; gap:12px; padding:14px; background:var(--panel2); border-radius:12px; margin-bottom:10px; border:1px solid var(--border); }
.badge { font-size:11px; padding:3px 9px; border-radius:20px; font-weight:600; }
.badge-pending { background:rgba(210,153,34,0.15); color:var(--warn); border:1px solid rgba(210,153,34,0.3); }
.badge-approved { background:rgba(0,229,160,0.12); color:var(--accent); border:1px solid rgba(0,229,160,0.25); }
.badge-rejected { background:rgba(248,81,73,0.12); color:var(--danger); border:1px solid rgba(248,81,73,0.25); }
.action-btns { display:flex; gap:8px; margin-left:auto; }
.sm-btn { padding:6px 14px; border-radius:7px; border:none; font-size:12px; font-weight:600; font-family:inherit; cursor:pointer; }
.approve-btn { background:rgba(0,229,160,0.15); color:var(--accent); border:1px solid rgba(0,229,160,0.3); }
.approve-btn:hover { background:rgba(0,229,160,0.25); }
.reject-btn { background:rgba(248,81,73,0.1); color:var(--danger); border:1px solid rgba(248,81,73,0.25); }
.reject-btn:hover { background:rgba(248,81,73,0.2); }
.tab-bar { display:flex; gap:4px; margin-bottom:20px; }
.tab { padding:8px 18px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--muted); font-size:13px; font-weight:600; font-family:inherit; cursor:pointer; transition:all 0.15s; }
.tab.active { background:var(--accent); color:#000; border-color:var(--accent); }
.messages { scrollbar-width:thin; scrollbar-color:var(--border) transparent; }
`;

const avatarColors = ["#00e5a0","#0dcaf0","#f0883e","#a371f7","#ff7b72","#56d364","#ffa657","#79c0ff"];
function getAvatarColor(name) { let h=0; for(let c of name) h=(h*31+c.charCodeAt(0))%avatarColors.length; return avatarColors[h]; }
function initials(name) { return name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2); }
function tsToTime(ts) { return new Date(ts).toLocaleTimeString("az",{hour:"2-digit",minute:"2-digit"}); }

export default function App() {
  const [view, setView] = useState("loading"); // loading | login | register | pending | chat | admin
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState({});
  const [messages, setMessages] = useState([]);
  const [contacts, setContacts] = useState([]); // approved users visible to current user
  const [activeContact, setActiveContact] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [loginData, setLoginData] = useState({username:"",password:""});
  const [regData, setRegData] = useState({username:"",password:"",confirm:""});
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [adminTab, setAdminTab] = useState("pending");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef(null);

  // Load data
  useEffect(()=>{
    (async()=>{
      const u = await storageGet("users") || {};
      const m = await storageGet("messages") || [];
      // ensure admin exists
      if(!u["admin"]) {
        u["admin"] = { username:"admin", password:ADMIN_PASSWORD, status:"approved", isAdmin:true, color:avatarColors[0] };
        await storageSet("users", u);
      }
      setUsers(u);
      setMessages(m);
      setView("login");
    })();
  },[]);

  // Sync data periodically
  useEffect(()=>{
    if(view==="loading") return;
    const id = setInterval(async()=>{
      const u = await storageGet("users") || {};
      const m = await storageGet("messages") || [];
      setUsers(u);
      setMessages(m);
      // update currentUser status
      if(currentUser) {
        const updated = u[currentUser.username];
        if(updated && updated.status !== currentUser.status) setCurrentUser(updated);
      }
    }, 2000);
    return ()=>clearInterval(id);
  },[view, currentUser]);

  useEffect(()=>{ messagesEndRef.current?.scrollIntoView({behavior:"smooth"}); },[messages, activeContact]);

  // Compute contacts
  useEffect(()=>{
    if(!currentUser) return;
    const approved = Object.values(users).filter(u=>u.status==="approved" && u.username!==currentUser.username);
    setContacts(approved);
  },[users, currentUser]);

  const saveUsers = async(u)=>{ setUsers(u); await storageSet("users",u); };
  const saveMessages = async(m)=>{ setMessages(m); await storageSet("messages",m); };

  // Auth
  async function handleLogin(e) {
    e.preventDefault(); setErr("");
    const u = users[loginData.username];
    if(!u || u.password!==loginData.password) { setErr("İstifadəçi adı və ya şifrə yanlışdır"); return; }
    setCurrentUser(u);
    if(u.isAdmin) setView("admin");
    else if(u.status==="pending") setView("pending");
    else if(u.status==="rejected") { setErr("Hesabınız rədd edilib. Adminlə əlaqə saxlayın."); return; }
    else setView("chat");
  }

  async function handleRegister(e) {
    e.preventDefault(); setErr("");
    if(!regData.username.trim()) { setErr("İstifadəçi adı daxil edin"); return; }
    if(regData.password.length<4) { setErr("Şifrə ən az 4 simvol olmalıdır"); return; }
    if(regData.password!==regData.confirm) { setErr("Şifrələr uyğun gəlmir"); return; }
    if(users[regData.username]) { setErr("Bu istifadəçi adı artıq mövcuddur"); return; }
    const newUser = { username:regData.username, password:regData.password, status:"pending", isAdmin:false, color:avatarColors[Object.keys(users).length%avatarColors.length] };
    const updated = {...users, [regData.username]:newUser};
    await saveUsers(updated);
    setCurrentUser(newUser);
    setSuccess("Qeydiyyat tamamlandı! Admin təsdiqini gözləyin.");
    setView("pending");
  }

  async function approveUser(username) {
    const updated = {...users, [username]:{...users[username], status:"approved"}};
    await saveUsers(updated);
  }
  async function rejectUser(username) {
    const updated = {...users, [username]:{...users[username], status:"rejected"}};
    await saveUsers(updated);
  }

  async function sendMessage() {
    if(!msgInput.trim() || !activeContact) return;
    const msg = { id: Date.now(), from: currentUser.username, to: activeContact.username, text: msgInput.trim(), ts: Date.now() };
    const updated = [...messages, msg];
    await saveMessages(updated);
    setMsgInput("");
  }

  function getConversation(contactUsername) {
    return messages.filter(m=>(m.from===currentUser?.username && m.to===contactUsername)||(m.from===contactUsername && m.to===currentUser?.username));
  }

  function getLastMessage(contactUsername) {
    const conv = getConversation(contactUsername);
    return conv[conv.length-1];
  }

  function getUnread(contactUsername) {
    return messages.filter(m=>m.from===contactUsername && m.to===currentUser?.username && !m.read).length;
  }

  function logout() {
    setCurrentUser(null); setActiveContact(null); setView("login");
    setLoginData({username:"",password:""}); setErr(""); setSuccess("");
  }

  const filteredContacts = contacts.filter(c=>c.username.toLowerCase().includes(search.toLowerCase()));
  const pendingUsers = Object.values(users).filter(u=>u.status==="pending");
  const approvedUsers = Object.values(users).filter(u=>u.status==="approved" && !u.isAdmin);
  const rejectedUsers = Object.values(users).filter(u=>u.status==="rejected");

  // ---- RENDER ----
  if(view==="loading") return (
    <div style={{background:"var(--bg)",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--accent)",fontFamily:"Sora,sans-serif",fontSize:18}}>
      <style>{style}</style>Yüklənir...
    </div>
  );

  if(view==="login"||view==="register") return (
    <div className="auth-wrap">
      <style>{style}</style>
      <div className="auth-card">
        <div className="auth-title">Chat<span style={{color:"var(--accent2)"}}>Hub</span></div>
        <div className="auth-sub">{view==="login"?"Hesabınıza daxil olun":"Yeni hesab yaradın"}</div>
        {err && <div className="err">{err}</div>}
        {success && <div className="success">{success}</div>}
        {view==="login" ? (
          <form onSubmit={handleLogin}>
            <div className="field"><label>İstifadəçi adı</label><input value={loginData.username} onChange={e=>setLoginData({...loginData,username:e.target.value})} placeholder="username" autoFocus/></div>
            <div className="field"><label>Şifrə</label><input type="password" value={loginData.password} onChange={e=>setLoginData({...loginData,password:e.target.value})} placeholder="••••••"/></div>
            <button className="btn btn-primary" type="submit" style={{marginBottom:10}}>Daxil ol</button>
            <button className="btn btn-secondary" type="button" onClick={()=>{setView("register");setErr("");}}>Qeydiyyat</button>
          </form>
        ):(
          <form onSubmit={handleRegister}>
            <div className="field"><label>İstifadəçi adı</label><input value={regData.username} onChange={e=>setRegData({...regData,username:e.target.value})} placeholder="username" autoFocus/></div>
            <div className="field"><label>Şifrə</label><input type="password" value={regData.password} onChange={e=>setRegData({...regData,password:e.target.value})} placeholder="••••••"/></div>
            <div className="field"><label>Şifrəni təsdiqlə</label><input type="password" value={regData.confirm} onChange={e=>setRegData({...regData,confirm:e.target.value})} placeholder="••••••"/></div>
            <button className="btn btn-primary" type="submit" style={{marginBottom:10}}>Qeydiyyat ol</button>
            <button className="btn btn-secondary" type="button" onClick={()=>{setView("login");setErr("");}}>Geri</button>
          </form>
        )}
      </div>
    </div>
  );

  if(view==="pending") return (
    <div className="auth-wrap">
      <style>{style}</style>
      <div className="auth-card" style={{textAlign:"center"}}>
        <div style={{fontSize:52,marginBottom:16}}>⏳</div>
        <div className="auth-title" style={{justifyContent:"center",display:"flex"}}>Gözləyirsiniz...</div>
        <div className="auth-sub" style={{marginBottom:24}}>Hesabınız admin tərəfindən hələ təsdiqlənməyib. Bir az gözləyin.</div>
        <button className="btn btn-secondary" onClick={async()=>{
          const u = await storageGet("users")||{};
          const me = u[currentUser.username];
          if(me?.status==="approved"){setCurrentUser(me);setView("chat");}
          else if(me?.status==="rejected"){setErr("Hesabınız rədd edildi.");setView("login");}
          else setSuccess("Hələ gözləyirsiniz...");
        }}>Yenilə</button>
        <button className="btn btn-secondary" style={{marginTop:10}} onClick={logout}>Çıxış</button>
        {success&&<div className="success" style={{marginTop:10}}>{success}</div>}
        {err&&<div className="err" style={{marginTop:10}}>{err}</div>}
      </div>
    </div>
  );

  if(view==="admin") return (
    <div className="app">
      <style>{style}</style>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">Chat<span>Hub</span></div>
          <span style={{marginLeft:"auto",fontSize:12,color:"var(--warn)",fontWeight:600}}>ADMIN</span>
        </div>
        <div className="contacts" style={{padding:12}}>
          <div style={{fontSize:12,color:"var(--muted)",marginBottom:8,fontWeight:600,letterSpacing:"0.5px",textTransform:"uppercase"}}>Siz</div>
          <div className="contact-item active" style={{borderRadius:10}}>
            <div className="avatar" style={{background:getAvatarColor("admin")}}>{initials("admin")}</div>
            <div className="contact-info"><div className="contact-name">admin</div><div className="contact-preview">Super Admin</div></div>
          </div>
        </div>
        <div style={{marginTop:"auto",padding:12}}>
          <button className="btn btn-secondary" style={{fontSize:13}} onClick={logout}>Çıxış</button>
        </div>
      </div>
      <div className="admin-panel">
        <div className="admin-title">👑 Admin Paneli</div>
        <div className="tab-bar">
          <button className={`tab ${adminTab==="pending"?"active":""}`} onClick={()=>setAdminTab("pending")}>Gözləyənlər {pendingUsers.length>0&&`(${pendingUsers.length})`}</button>
          <button className={`tab ${adminTab==="approved"?"active":""}`} onClick={()=>setAdminTab("approved")}>Təsdiqlənmiş ({approvedUsers.length})</button>
          <button className={`tab ${adminTab==="rejected"?"active":""}`} onClick={()=>setAdminTab("rejected")}>Rədd edilmiş ({rejectedUsers.length})</button>
        </div>
        {adminTab==="pending" && (
          pendingUsers.length===0 ? <div style={{color:"var(--muted)",fontSize:14}}>Gözləyən istifadəçi yoxdur.</div> :
          pendingUsers.map(u=>(
            <div className="user-row" key={u.username}>
              <div className="avatar" style={{background:getAvatarColor(u.username)}}>{initials(u.username)}</div>
              <div><div style={{fontWeight:600}}>{u.username}</div><div style={{fontSize:12,color:"var(--muted)"}}>Qeydiyyat gözləyir</div></div>
              <span className="badge badge-pending">Gözləyir</span>
              <div className="action-btns">
                <button className="sm-btn approve-btn" onClick={()=>approveUser(u.username)}>✓ Təsdiqlə</button>
                <button className="sm-btn reject-btn" onClick={()=>rejectUser(u.username)}>✗ Rədd et</button>
              </div>
            </div>
          ))
        )}
        {adminTab==="approved" && (
          approvedUsers.length===0 ? <div style={{color:"var(--muted)",fontSize:14}}>Hələ heç kim yoxdur.</div> :
          approvedUsers.map(u=>(
            <div className="user-row" key={u.username}>
              <div className="avatar" style={{background:getAvatarColor(u.username)}}>{initials(u.username)}</div>
              <div><div style={{fontWeight:600}}>{u.username}</div></div>
              <span className="badge badge-approved">Aktiv</span>
              <div className="action-btns">
                <button className="sm-btn reject-btn" onClick={()=>rejectUser(u.username)}>Blokla</button>
              </div>
            </div>
          ))
        )}
        {adminTab==="rejected" && (
          rejectedUsers.length===0 ? <div style={{color:"var(--muted)",fontSize:14}}>Heç kim bloklanmayıb.</div> :
          rejectedUsers.map(u=>(
            <div className="user-row" key={u.username}>
              <div className="avatar" style={{background:getAvatarColor(u.username)}}>{initials(u.username)}</div>
              <div><div style={{fontWeight:600}}>{u.username}</div></div>
              <span className="badge badge-rejected">Bloklu</span>
              <div className="action-btns">
                <button className="sm-btn approve-btn" onClick={()=>approveUser(u.username)}>Bərpa et</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  // CHAT VIEW
  const conversation = activeContact ? getConversation(activeContact.username) : [];

  return (
    <div className="app">
      <style>{style}</style>
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="avatar" style={{background:getAvatarColor(currentUser.username),width:34,height:34,fontSize:13}}>{initials(currentUser.username)}</div>
          <div className="logo">Chat<span>Hub</span></div>
          <button onClick={logout} title="Çıxış" style={{marginLeft:"auto",background:"none",border:"none",color:"var(--muted)",cursor:"pointer",fontSize:18}}>⇠</button>
        </div>
        <div className="search-wrap">
          <input placeholder="🔍  Axtar..." value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <div className="contacts">
          {filteredContacts.length===0 && <div style={{padding:20,color:"var(--muted)",fontSize:13,textAlign:"center"}}>Hələ heç kim yoxdur</div>}
          {filteredContacts.map(c=>{
            const last = getLastMessage(c.username);
            const unread = getUnread(c.username);
            return (
              <div className={`contact-item ${activeContact?.username===c.username?"active":""}`} key={c.username} onClick={()=>setActiveContact(c)}>
                <div className="avatar" style={{background:getAvatarColor(c.username)}}>{initials(c.username)}</div>
                <div className="contact-info">
                  <div className="contact-name">{c.username}</div>
                  <div className="contact-preview">{last ? (last.from===currentUser.username?"Siz: ":"")+last.text : "Mesaj yoxdur"}</div>
                </div>
                {unread>0 && <span className="unread-badge">{unread}</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="chat-area">
        {!activeContact ? (
          <div className="empty-chat">
            <div className="big">💬</div>
            <div style={{fontSize:18,fontWeight:600}}>Söhbət seçin</div>
            <div style={{fontSize:13,color:"var(--muted)"}}>Sol tərəfdən bir istifadəçi seçin</div>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="avatar" style={{background:getAvatarColor(activeContact.username),width:38,height:38,fontSize:14}}>{initials(activeContact.username)}</div>
              <div>
                <div style={{fontWeight:600,fontSize:15}}>{activeContact.username}</div>
                <div style={{fontSize:12,color:"var(--muted)"}}>online <span className="online-dot"/></div>
              </div>
            </div>
            <div className="messages">
              {conversation.length===0 && <div style={{textAlign:"center",color:"var(--muted)",fontSize:13,marginTop:40}}>Hələ mesaj yoxdur. Salam yazın! 👋</div>}
              {conversation.map(msg=>{
                const isMe = msg.from===currentUser.username;
                return (
                  <div className={`msg-wrap ${isMe?"me":""}`} key={msg.id}>
                    <div className={`bubble ${isMe?"me":"other"}`}>
                      {!isMe && <div className="bubble-sender">{msg.from}</div>}
                      {msg.text}
                      <div className="bubble-time">{tsToTime(msg.ts)}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef}/>
            </div>
            <div className="input-area">
              <input
                value={msgInput}
                onChange={e=>setMsgInput(e.target.value)}
                onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendMessage();} }}
                placeholder={`${activeContact.username}-ə mesaj yaz...`}
              />
              <button className="send-btn" onClick={sendMessage}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
