import React, { useState } from 'react';
import api from '../api/axios';
import { useToast } from '../context/ToastContext';

export default function Contact(){
  const { addToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if(!email || !message) { addToast('Please provide your email and a message', 'error'); return; }
    setSending(true);
    try{
      // Attempt to send to backend contact endpoint; if missing, fallback to mailto
      await api.post('/contact', { name, email, message });
      addToast('Message sent. We will respond shortly.', 'success');
      setName(''); setEmail(''); setMessage('');
    }catch(err){
      console.warn('Contact submit failed, falling back to mailto', err?.message || err);
      // fallback: open mail client
      const mailto = `mailto:abumujahid555@gmail.com?subject=Contact%20from%20${encodeURIComponent(name||email)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailto;
      addToast('Opened mail client as fallback.', 'info');
    }finally{ setSending(false); }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-4">Contact Us</h1>
      <p className="text-slate-700 mb-4">Have a question, feedback, or partnership inquiry? Send us a message and our team will get back to you.</p>
      <form onSubmit={submit} className="space-y-4 bg-white p-6 rounded shadow">
        <input className="w-full p-3 border rounded" placeholder="Your name (optional)" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full p-3 border rounded" placeholder="Your email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <textarea className="w-full p-3 border rounded min-h-[140px]" placeholder="How can we help?" value={message} onChange={e=>setMessage(e.target.value)} required />
        <div className="flex justify-between items-center">
          <div className="text-sm text-slate-500">Or email us at <a href="mailto:abumujahid555@gmail.com" className="underline">abumujahid555@gmail.com</a></div>
          <button type="submit" disabled={sending} className="px-4 py-2 bg-blue-700 text-white rounded">{sending ? 'Sending...' : 'Send Message'}</button>
        </div>
      </form>
    </div>
  );
}
