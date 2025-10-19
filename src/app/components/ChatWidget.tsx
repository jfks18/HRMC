"use client";
import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

type User = { id: string | null; name?: string | null; room?: string | null };
type Message = { id?: number | null; room: string; sender_id?: string | null; sender_name?: string | null; message: string; cid?: string | null; created_at?: string };

// Resolve socket server URL:
// - Prefer NEXT_PUBLIC_SOCKET_URL when provided
// - Allow runtime override via window.__NGROK_URL (dev only)
// - Only fallback to the hardcoded ngrok URL in development builds
const SOCKET_URL = (() => {
  // explicit env overrides everything
  if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;

  // runtime dev override via devtools
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (typeof window.__NGROK_URL === 'string' && window.__NGROK_URL) return window.__NGROK_URL;
  }

  // In development, keep the existing ngrok fallback for convenience
  if (process.env.NODE_ENV === 'development') return 'https://buck-leading-pipefish.ngrok-free.app';

  // In production don't assume ngrok; return empty so client uses configured BACKEND/NEXT_PUBLIC variables
  return '';
})();

export default function ChatWidget() {
  const [visible, setVisible] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<User[]>([]);
  const [dms, setDms] = useState<Array<{ room: string; other: string; last_at?: string; msg_count?: number }>>([]);
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const activeRoomRef = useRef<string | null>(activeRoom);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState<User | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const attemptedWebsocket = useRef(false);

  // read token from localStorage or cookie (adjust to your auth)
  function getToken() {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem('token') || null;
    } catch (e) { return null; }
  }

  useEffect(() => {
    // connect socket.io client
    const token = getToken();
    // include the ngrok skip header in transportOptions where supported (polling)
    // Add the query param so browsers send it as part of the URL (browsers can't reliably set custom headers on WS handshakes)
    // ngrok recognizes the `ngrok-skip-browser-warning` query parameter as well.
    const skipParam = 'ngrok-skip-browser-warning=true';
    const connectUrl = SOCKET_URL ? (SOCKET_URL + (SOCKET_URL.includes('?') ? '&' : '?') + skipParam) : undefined;

  console.log('ChatWidget connecting. SOCKET_URL=', SOCKET_URL, ' connectUrl=', connectUrl);
    // Force websocket-only transport to avoid polling/handshake issues through proxies/ngrok
    const client = io(connectUrl || undefined, {
      auth: { token },
      transports: ['websocket'],
    });
    setSocket(client);

    client.on('connect', () => { setConnected(true); console.log('socket connected, id=', client.id); });
    client.on('disconnect', () => { setConnected(false); });
    client.on('connect_error', (err: any) => {
      console.error('socket connect_error', err);
    });
    client.on('error', (err: any) => { console.error('socket error', err); });

    client.on('user_connected', (u: any) => {
      // refresh online list via server call
      client.emit('get_online_users', (res: any) => { if (res && res.success) setOnlineUsers(res.users); });
    });
    client.on('user_disconnected', () => {
      client.emit('get_online_users', (res: any) => { if (res && res.success) setOnlineUsers(res.users); });
    });

    client.on('new_message', (m: Message) => {
      // if message belongs to active room append, otherwise ignore (could update dm list badge)
      if (m.room === activeRoomRef.current) setMessages(prev => [...prev, m]);
      // update DM listing (simple refresh)
      fetchDms(client);
    });

    client.on('typing', (payload: any) => {
      if (payload && payload.room === activeRoom && payload.user) setTypingUser(payload.user);
    });

    // initial online users
    client.emit('get_online_users', (res: any) => { if (res && res.success) setOnlineUsers(res.users); });
    // list DMs from REST endpoint
    fetchDms(client);

    return () => { client.disconnect(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { // scroll to bottom when messages change
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  // keep a ref in-sync so socket handlers have latest activeRoom without recreating listeners
  useEffect(() => {
    activeRoomRef.current = activeRoom;
  }, [activeRoom]);

  async function fetchDms(client?: Socket) {
    try {
      const token = getToken();
      const url = (process.env.NEXT_PUBLIC_SOCKET_URL || '') + '/chat/dms';
      const base = SOCKET_URL || '';
      const resp = await fetch((base + '/chat/dms').replace('//chat', '/chat'), { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!resp.ok) return;
      const json = await resp.json();
      if (json && json.success && Array.isArray(json.dms)) setDms(json.dms);
    } catch (e) { /* ignore */ }
  }

  async function openRoom(room: string) {
    // leave previous room and join the new one so server broadcasts reach this socket
    try {
      if (!socket) {
        setActiveRoom(room);
        setMessages([]);
        return;
      }
      if (activeRoom) {
        try { socket.emit('leave', activeRoom); } catch (e) { /* ignore */ }
      }
      try { socket.emit('join', room); } catch (e) { /* ignore */ }
      setActiveRoom(room);
      setMessages([]);
      socket.emit('get_history', { room, limit: 200 }, (res: any) => {
        if (res && res.success && Array.isArray(res.messages)) setMessages(res.messages);
      });
    } catch (e) { /* ignore */ }
  }

  function sendMessage() {
    if (!socket || !activeRoom || !text.trim()) return;
    const cid = String(Date.now());
    const payload = { room: activeRoom, message: text.trim(), cid };
    // optimistic update
    const optimistic: Message = { id: null, room: activeRoom, message: text.trim(), sender_id: null, sender_name: 'You', cid, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    // ensure we're joined to the room so we receive broadcasts
    try { socket.emit('join', activeRoom); } catch (e) { /* ignore */ }

    socket.emit('send_message', payload, (ack: any) => {
      // optionally reconcile saved message
      if (ack && ack.success && ack.message) {
        setMessages(prev => prev.map(m => (m.cid === cid ? ack.message : m)));
      }
    });
  }

  function onTyping(e: React.ChangeEvent<HTMLInputElement>) {
    setText(e.target.value);
    if (!socket || !activeRoom) return;
    socket.emit('typing', { room: activeRoom, typing: !!e.target.value });
  }

  return (
    <div>
      {/* Floating toggle button */}
      {!visible && (
        <button
          aria-label="Open chat"
          onClick={() => setVisible(true)}
          style={{
            position: 'fixed',
            right: 20,
            bottom: 20,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#0d6efd',
            color: '#fff',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1a7 7 0 1 0 6.446 4.032c.03-.094.054-.19.07-.289A7 7 0 0 0 8 1z"/>
            <path d="M8 3a5 5 0 1 1-4.546 2.916L2 6l1-1 .454.084A5.002 5.002 0 0 1 8 3z"/>
          </svg>
        </button>
      )}

      {visible && (
        <div style={{ position: 'fixed', right: 20, bottom: 20, width: 360, maxWidth: 'calc(100% - 40px)', zIndex: 9999 }}>
          <div className="card shadow">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong>Chat</strong>
                <span className={`badge ${connected ? 'bg-success' : 'bg-secondary'}`}>{connected ? 'Online' : 'Offline'}</span>
              </div>
              <div>
                <button className="btn btn-sm btn-light me-2" aria-label="Minimize chat" onClick={() => setVisible(false)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1h-8a.5.5 0 0 1-.5-.5z"/>
                  </svg>
                </button>
              </div>
            </div>
        <div className="card-body" style={{ maxHeight: 420, overflow: 'auto' }}>
          <div className="row">
            <div className="col-5 border-end" style={{ maxHeight: 340, overflow: 'auto' }}>
              <h6>Conversations</h6>
              <ul className="list-group">
                {dms.map(dm => (
                  <li key={dm.room} className={`list-group-item list-group-item-action ${dm.room === activeRoom ? 'active' : ''}`} onClick={() => openRoom(dm.room)} style={{ cursor: 'pointer' }}>
                    <div className="d-flex justify-content-between">
                      <div>{dm.other}</div>
                      <small className="text-muted">{dm.msg_count}</small>
                    </div>
                  </li>
                ))}
              </ul>
              <hr />
              <h6>Online</h6>
              <ul className="list-group">
                {onlineUsers.map(u => (
                  <li key={u.id || Math.random()} className="list-group-item" style={{ cursor: 'pointer' }} onClick={() => {
                    // create deterministic dm room via server endpoint
                    (async () => {
                      const token = getToken();
                      const base = SOCKET_URL || '';
                      const resp = await fetch((base + '/chat/dm').replace('//chat', '/chat'), { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' }, body: JSON.stringify({ other: u.id }) });
                      if (!resp.ok) return;
                      const j = await resp.json();
                      if (j && j.success && j.room) openRoom(j.room);
                    })();
                  }}>
                    <div className="d-flex justify-content-between">
                      <div>{u.name || '(anonymous)'}</div>
                      <small className="text-muted">{u.id ? 'user' : ''}</small>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-7">
              <div style={{ height: 40 }}>
                <strong>{activeRoom || 'Select a conversation'}</strong>
              </div>
              <div ref={scrollRef} style={{ height: 260, overflow: 'auto', border: '1px solid #eee', padding: 8, background: '#fff' }}>
                {messages.map((m, i) => (
                  <div key={i} className={`mb-2 ${m.sender_name === 'You' ? 'text-end' : ''}`}>
                    <div><small className="text-muted">{m.sender_name || m.sender_id || 'Unknown'}</small></div>
                    <div className="p-2" style={{ display: 'inline-block', borderRadius: 8, background: m.sender_name === 'You' ? '#d1e7dd' : '#f1f3f5' }}>{m.message}</div>
                    <div><small className="text-muted">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</small></div>
                  </div>
                ))}
                {typingUser && <div className="text-muted"><em>{typingUser.name || 'Someone'} is typing...</em></div>}
              </div>
              <div className="input-group mt-2">
                <input value={text} onChange={onTyping} className="form-control" placeholder={activeRoom ? 'Type a message...' : 'Select a conversation'} disabled={!activeRoom} />
                <button className="btn btn-primary" onClick={sendMessage} disabled={!activeRoom || !text.trim()}>Send</button>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      )}
    </div>
  );
}
