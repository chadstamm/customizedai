import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'CustomizedAI — Set up your custom instructions for every AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 20% 10%, rgba(79, 70, 229, 0.15), transparent)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse 60% 50% at 80% 90%, rgba(6, 182, 212, 0.1), transparent)',
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span>Set Up Your</span>
            <span
              style={{
                background: 'linear-gradient(135deg, #818CF8, #06B6D4)',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Custom Instructions
            </span>
            <span>for Every AI</span>
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 22,
              color: 'rgba(255, 255, 255, 0.55)',
              marginTop: 24,
              textAlign: 'center',
              maxWidth: 700,
              lineHeight: 1.5,
            }}
          >
            Answer a few questions, get copy-paste ready instructions for ChatGPT, Claude, Gemini, and Perplexity.
          </div>

          {/* Model dots */}
          <div
            style={{
              display: 'flex',
              gap: 16,
              marginTop: 40,
              alignItems: 'center',
            }}
          >
            {[
              { color: '#10A37F', name: 'ChatGPT' },
              { color: '#D4A574', name: 'Claude' },
              { color: '#4285F4', name: 'Gemini' },
              { color: '#20808D', name: 'Perplexity' },
            ].map((model) => (
              <div
                key={model.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 100,
                  padding: '8px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: model.color,
                  }}
                />
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: 15,
                    fontWeight: 500,
                  }}
                >
                  {model.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span
            style={{
              color: 'rgba(255, 255, 255, 0.3)',
              fontSize: 16,
            }}
          >
            customizedai.app
          </span>
          <span style={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: 16 }}>·</span>
          <span style={{ color: 'rgba(255, 255, 255, 0.3)', fontSize: 16 }}>
            Free · No sign-up required
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
