import courseBuilderImg from '../assets/Online-Learning.jpg';
import chatDiscussionImg from '../assets/chat-online.jpg';

import React from 'react';
import { Link } from 'react-router-dom';

export default function About(){
  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-12 space-y-16">
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-10 md:p-16 shadow-lg">
        <div className="md:flex md:items-center md:justify-between gap-6">
          <div className="md:flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Build, Learn, and Grow Together</h1>
            <p className="mt-4 text-lg text-blue-100 max-w-2xl">PeerLearn empowers instructors and learners with collaborative courses, structured lesson paths, and real-time communication — all in a single platform designed for community-driven learning.</p>
            <div className="mt-6 flex gap-3">
              <Link to="/courses" className="bg-white text-blue-700 font-semibold px-5 py-3 rounded-md shadow hover:opacity-95">Explore Courses</Link>
              <Link to="/contact" className="border border-white text-white px-5 py-3 rounded-md hover:bg-white/10">Request a Demo</Link>
            </div>
          </div>
          <div className="hidden md:block md:flex-1">
            <div className="bg-white/20 rounded-lg p-6">
              <h4 className="text-white font-semibold">Why PeerLearn?</h4>
              <p className="mt-2 text-blue-100">Community-first approach, hands-on lessons, and tools that help instructors focus on teaching while learners get practical experience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features - horizontal sections */}
      <section className="space-y-12">
        <div className="md:flex md:items-center md:gap-8 md:space-y-0">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-slate-900">Intuitive Course Builder</h2>
            <p className="mt-3 text-slate-700">Create courses with sections and lessons, structure pathways for learners, and rearrange content quickly using drag-and-drop. The editor is built to be fast and forgiving.</p>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>Visual section & lesson organization</li>
              <li>Lesson-level content and resource attachments</li>
              <li>Publish when you're ready</li>
            </ul>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <div className="rounded-xl bg-white p-0 shadow overflow-hidden h-56 flex items-stretch">
              <img src={courseBuilderImg} alt="Course Builder Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="md:flex md:items-center md:gap-8 md:flex-row-reverse md:space-y-0">
          <div className="md:w-1/2">
            <h2 className="text-2xl font-bold text-slate-900">Real-time Collaboration</h2>
            <p className="mt-3 text-slate-700">Discuss lessons, send messages, and host live Q&amp;A inside course rooms. PeerLearn connects learners and instructors in context so collaboration happens where learning happens.</p>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>Per-course chat rooms</li>
              <li>Threaded discussions and comments</li>
              <li>Notifications and moderation tools for instructors</li>
            </ul>
          </div>
          <div className="md:w-1/2 mt-6 md:mt-0">
            <div className="rounded-xl bg-white p-0 shadow overflow-hidden h-56 flex items-stretch">
              <img src={chatDiscussionImg} alt="Chat & Discussion Preview" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Community</h3>
          <p className="mt-2 text-slate-600">Learners teach and learn from each other; instructors facilitate and guide.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Accessibility</h3>
          <p className="mt-2 text-slate-600">Designed to be usable across devices and connectivity levels.</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow">
          <h3 className="text-lg font-semibold text-slate-900">Practical Outcomes</h3>
          <p className="mt-2 text-slate-600">Focus on projects, applied tasks, and demonstrable skills.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl bg-gradient-to-r from-indigo-50 to-white p-8 md:p-12 shadow-inner">
        <div className="md:flex md:items-center md:justify-between">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Ready to get started?</h3>
            <p className="mt-2 text-slate-700">Create your first course or explore existing content — PeerLearn supports both instructors and learners with easy onboarding.</p>
          </div>
            <div className="mt-4 md:mt-0">
            <Link to="/register" className="bg-indigo-600 text-white font-semibold px-5 py-3 rounded-md shadow hover:bg-indigo-700 transition">Sign Up</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
