import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | CustomizedAI',
  description: 'How CustomizedAI handles your data, privacy, and security.',
};

export default function PrivacyPage() {
  return (
    <div
      className="min-h-screen py-16 px-4 sm:px-6"
      style={{ background: 'var(--bg)', color: 'var(--ink)' }}
    >
      <div className="max-w-2xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm mb-10 transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Back to CustomizedAI
        </Link>

        <h1
          className="font-display text-3xl sm:text-4xl font-semibold mb-2"
          style={{ color: 'var(--ink)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm mb-12" style={{ color: 'var(--muted)' }}>
          Last updated: March 2026
        </p>

        <div className="space-y-10">
          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              What Data We Collect
            </h2>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'var(--ink-light)' }}
            >
              CustomizedAI collects the following information during your session:
            </p>
            <ul
              className="text-sm leading-relaxed list-disc pl-5 space-y-2"
              style={{ color: 'var(--ink-light)' }}
            >
              <li>
                Your answers to the onboarding questions about your AI usage
                preferences and communication style.
              </li>
              <li>
                Uploaded documents (writing codex, personal constitution, story
                bank) that you optionally provide to improve your results.
              </li>
              <li>
                Your email address, if you choose to provide it via the optional
                email collection form.
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              How Your Data Is Processed
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--ink-light)' }}
            >
              Your answers and uploaded documents are sent to Anthropic&apos;s
              Claude API to generate personalized custom AI instructions. This
              processing happens in real time during your session. Your data is
              not stored on our servers &mdash; it is transmitted directly to the
              API for generation and the results are returned to your browser.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              Third-Party Services
            </h2>
            <ul
              className="text-sm leading-relaxed list-disc pl-5 space-y-2"
              style={{ color: 'var(--ink-light)' }}
            >
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  Anthropic Claude API
                </strong>{' '}
                &mdash; Processes your answers and documents to generate custom
                AI instructions. Anthropic&apos;s data handling is governed by
                their own{' '}
                <a
                  href="https://www.anthropic.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                >
                  privacy policy
                </a>
                .
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>HubSpot</strong> &mdash;
                If you provide your email address, it is collected and stored via
                HubSpot for communication purposes only. HubSpot&apos;s data
                handling is governed by their own{' '}
                <a
                  href="https://legal.hubspot.com/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-accent"
                >
                  privacy policy
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              Data Retention
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--ink-light)' }}
            >
              Uploaded documents and your question answers are not stored on our
              servers. They exist only in your browser session and are discarded
              when you close the page or start a new session. Generated custom
              instructions are rendered in your browser only &mdash; we do not
              retain a copy.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              Cookies
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--ink-light)' }}
            >
              CustomizedAI uses minimal cookies required for the application to
              function. We do not use tracking cookies, advertising cookies, or
              third-party analytics cookies.
            </p>
          </section>

          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              GDPR Compliance
            </h2>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: 'var(--ink-light)' }}
            >
              If you are a resident of the European Union, you have the
              following rights under the General Data Protection Regulation
              (GDPR):
            </p>
            <ul
              className="text-sm leading-relaxed list-disc pl-5 space-y-2"
              style={{ color: 'var(--ink-light)' }}
            >
              <li>
                <strong style={{ color: 'var(--ink)' }}>Right of access</strong>{' '}
                &mdash; You can request a copy of any personal data we hold
                about you.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  Right to rectification
                </strong>{' '}
                &mdash; You can request correction of inaccurate personal data.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  Right to erasure
                </strong>{' '}
                &mdash; You can request deletion of your personal data.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  Right to restrict processing
                </strong>{' '}
                &mdash; You can request that we limit how we use your data.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  Right to data portability
                </strong>{' '}
                &mdash; You can request your data in a structured, commonly used
                format.
              </li>
              <li>
                <strong style={{ color: 'var(--ink)' }}>
                  Right to object
                </strong>{' '}
                &mdash; You can object to processing of your personal data.
              </li>
            </ul>
            <p
              className="text-sm leading-relaxed mt-3"
              style={{ color: 'var(--ink-light)' }}
            >
              Since we do not store your session data server-side, most of these
              rights are satisfied by default. If you have provided your email
              via HubSpot and wish to have it deleted, or if you have any other
              data-related request, contact us at{' '}
              <a href="mailto:chad@chadstamm.com" className="link-accent">
                chad@chadstamm.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2
              className="font-display text-xl font-semibold mb-3"
              style={{ color: 'var(--ink)' }}
            >
              Contact
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: 'var(--ink-light)' }}
            >
              For any privacy-related questions or requests, reach out to{' '}
              <a href="mailto:chad@chadstamm.com" className="link-accent">
                chad@chadstamm.com
              </a>
              .
            </p>
          </section>
        </div>

        <div
          className="mt-16 pt-8 text-center text-xs"
          style={{
            borderTop: '1px solid var(--border-light)',
            color: 'var(--muted)',
          }}
        >
          &copy; 2026 CustomizedAI
        </div>
      </div>
    </div>
  );
}
