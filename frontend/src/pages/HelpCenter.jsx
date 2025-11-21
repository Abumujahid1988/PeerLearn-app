import React from 'react';

export default function HelpCenter() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Help Center</h1>
      <div className="space-y-8 text-slate-800">
        <section>
          <h2 className="text-xl font-semibold mb-2">Getting Started</h2>
          <p>To begin using PeerLearn, sign up for an account as a learner or instructor. Explore available courses, enroll, and start learning or teaching right away. Our intuitive dashboard helps you track your progress and manage your courses easily.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Account & Profile</h2>
          <p>Update your profile information, change your password, and manage your notification preferences from your dashboard. If you forget your password, use the password reset link on the login page.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Courses & Enrollment</h2>
          <p>Browse courses by category or search for specific topics. Enroll in courses with a single click. Instructors can create, edit, and publish courses using the Course Builder. Learners can track their progress and revisit completed lessons anytime.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Collaboration & Discussion</h2>
          <p>Each course features real-time chat and discussion boards. Ask questions, participate in group discussions, and connect with instructors and peers to enhance your learning experience.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">Support</h2>
          <p>If you need help, visit our FAQ section or contact our support team:</p>
          <ul className="mt-2 space-y-1">
            <li>Email: <a href="mailto:abumujahid555@gmail.com" className="text-blue-700 underline">support@peerlearn.com</a></li>
            <li>Phone: <a href="tel:+2348035220554" className="text-blue-700 underline">+2348035220554</a></li>
            <li>Phone: <a href="tel:+2349123165313" className="text-blue-700 underline">+2349123165313</a></li>
          </ul>
          <p className="mt-2">We’re here to assist you with any issues or questions.</p>
        </section>
      </div>
    </div>
  );
}
