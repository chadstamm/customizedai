'use client';

import { WizardProvider } from '@/context/WizardContext';
import { Wizard } from '@/components/wizard/Wizard';

export default function Home() {
  return (
    <WizardProvider>
      <Wizard />
    </WizardProvider>
  );
}
