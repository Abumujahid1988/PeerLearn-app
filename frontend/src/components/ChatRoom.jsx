import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/api\/?$/, '');

export default function ChatRoom({ courseId }){
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const socketRef = useRef(null);

  useEffect(()=>{
    const token = localStorage.getItem('token');
    const socket = io(SOCKET_URL, { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;

    const room = `course-${courseId}`;
    socket.on('connect', () => {
      socket.emit('joinRoom', { room });
    });

    socket.on('chatMessage', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('disconnect', () => console.log('chat socket disconnected'));

    return () => {
      try { socket.emit('leaveRoom', { room }); } catch (e) {}
      socket.disconnect();
    };
  }, [courseId]);

  const send = () => {
    if (!text.trim()) return;
    const payload = { room: `course-${courseId}`, message: text.trim(), user: { _id: user?._id, name: user?.name } };
    socketRef.current?.emit('chatMessage', payload);
    setText('');
  };

  return (
    <div className='bg-white p-4 rounded shadow border'>
      <h3 className='font-semibold text-blue-900 mb-2'>Live Chat</h3>
      <div className='h-48 overflow-auto mb-3 p-2 border rounded bg-slate-50'>
        {messages.length === 0 && <div className='text-slate-500'>No messages yet.</div>}
        {messages.map((m, idx) => (
          <div key={idx} className='mb-2'>
            <div className='text-xs text-slate-500'>{m.user?.name || 'Anon'} • {new Date(m.createdAt).toLocaleTimeString()}</div>
            <div className='text-sm'>{m.message}</div>
          </div>
        ))}
      </div>
      <div className='flex gap-2'>
        <input value={text} onChange={e=>setText(e.target.value)} className='flex-1 p-2 border rounded' placeholder='Write a message...' />
        <button onClick={send} className='px-3 py-2 bg-blue-700 text-white rounded'>Send</button>
      </div>
    </div>
  );
}
