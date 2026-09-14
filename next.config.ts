import type {NextConfig} from 'next';
import {PHASE_DEVELOPMENT_SERVER} from 'next/constants';

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self' mailto:",
      "script-src 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.recaptcha.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://*.firebaseapp.com https://*.google.com https://www.gstatic.com https://www.recaptcha.net https://api.emailjs.com",
      "frame-src 'self' https://*.firebaseapp.com https://*.google.com https://www.recaptcha.net",
      "worker-src 'self' blob:",
      "media-src 'self' data: blob:",
      "manifest-src 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'X-Frame-Options', value: 'DENY'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

const createNextConfig = (phase: string): NextConfig => {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;

  return {
    distDir: isDev ? '.next-dev' : '.next',
    reactStrictMode: true,
    poweredByHeader: false,
    eslint: {
      ignoreDuringBuilds: true,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'picsum.photos',
          port: '',
          pathname: '/**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ];
    },
    transpilePackages: ['motion'],
    webpack: (config, {dev}) => {
      if (dev && process.env.DISABLE_HMR === 'true') {
        config.watchOptions = {
          ignored: /.*/,
        };
      }
      return config;
    },
  };
};

export default createNextConfig;
