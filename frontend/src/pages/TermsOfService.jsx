import React from 'react';

export default function TermsOfService() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-6 text-blue-900">Terms of Service</h1>
      <div className="space-y-6 text-slate-800">
        <section>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using PeerLearn, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">2. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and notify us of any unauthorized use of your account.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">3. Content & Conduct</h2>
          <p>Users must not post or share unlawful, harmful, or inappropriate content. PeerLearn reserves the right to remove content or suspend accounts that violate these terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
          <p>All content and materials on PeerLearn, unless uploaded by users, are the property of PeerLearn or its licensors. You may not use, copy, or distribute content without permission.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
          <p>We reserve the right to suspend or terminate your access to PeerLearn at our discretion, with or without notice, for conduct that we believe violates these Terms or is harmful to other users or the platform.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">6. Changes to Terms</h2>
          <p>PeerLearn may update these Terms of Service at any time. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
        </section>
        <section>
          <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
          <p>If you have questions about these Terms, contact us at <a href="mailto:support@peerlearn.com" className="text-blue-700 underline">support@peerlearn.com</a>.</p>
        </section>
      </div>
    </div>
  );
}
