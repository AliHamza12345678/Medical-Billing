'use client';

import { useRouter } from 'next/navigation';
import { HeartPulse, ShieldCheck, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Users, title: 'Patient Management', desc: 'Track patients, insurance, and documents in one place.' },
  { icon: ShieldCheck, title: 'Claims & Insurance', desc: 'Submit claims, verify eligibility, manage authorizations.' },
  { icon: BarChart3, title: 'Revenue Insights', desc: 'Real-time dashboards and detailed financial reports.' },
];

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-12 text-primary-foreground lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <button
          onClick={() => router.push('/login')}
          className="relative flex items-center gap-2.5"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <HeartPulse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold leading-tight">MediBill</p>
            <p className="text-xs text-primary-foreground/70">Billing Management Suite</p>
          </div>
        </button>

        <div className="relative max-w-md">
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold leading-tight"
          >
            The modern medical billing platform for growing practices.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-3 text-primary-foreground/80"
          >
            Streamline claims, payments, and reporting with a clean,
            professional dashboard your team will actually enjoy using.
          </motion.p>
          <div className="mt-8 space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15">
                  <f.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <p className="font-semibold">{f.title}</p>
                  <p className="text-sm text-primary-foreground/70">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © 2025 MediBill Inc. HIPAA-compliant billing platform.
        </p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <p className="text-lg font-bold leading-tight">MediBill</p>
              <p className="text-xs text-muted-foreground">Billing Management Suite</p>
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
