'use client';

import { WizardProvider } from '@/context/WizardContext';
import { Wizard } from '@/components/wizard/Wizard';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export default function Home() {
  return (
    <ErrorBoundary>
      <WizardProvider>
        <Wizard />
      </WizardProvider>
    </ErrorBoundary>
  );
}
