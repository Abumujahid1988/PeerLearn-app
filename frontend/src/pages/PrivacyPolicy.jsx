import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Privacy Policy</h1>
      <div className="space-y-6 text-slate-800">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p>We collect information you provide when you register, create a profile, enroll in courses, or interact with the platform. This may include your name, email, and course activity.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Information</h2>
          <p>Your information is used to provide and improve PeerLearn services, personalize your experience, and communicate important updates.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Sharing & Disclosure</h2>
          <p>We do not sell your personal information. We may share data with trusted service providers for platform functionality, or as required by law.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
          <p>We implement security measures to protect your data. However, no method of transmission over the Internet is 100% secure.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Your Choices</h2>
          <p>You can update your profile, change notification settings, or delete your account at any time. Contact us for assistance with your data.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">6. Changes to Policy</h2>
          <p>We may update this Privacy Policy periodically. We will notify users of significant changes via the platform or email.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p>If you have questions about this Privacy Policy, contact us at <a href="mailto:support@peerlearn.com" className="text-blue-700 underline">support@peerlearn.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
