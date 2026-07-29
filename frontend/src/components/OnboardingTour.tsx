import React from 'react';
import * as JoyrideModule from 'react-joyride';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingTourProps {
  run?: boolean;
  onFinish?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onFinish }) => {
  const { t } = useLanguage();
  const [internalRun, setInternalRun] = React.useState(false);

  React.useEffect(() => {
    const hasSeen = localStorage.getItem('km-has-seen-tour');
    if (!hasSeen && run === undefined) {
      setInternalRun(true);
    }
  }, [run]);

  const activeRun = run !== undefined ? run : internalRun;

  const steps: any[] = [
    {
      target: '#location-selector',
      content: t('tourLocationDesc'),
      title: t('tourLocationTitle'),
      disableBeacon: true
    },
    {
      target: '#quick-actions-row',
      content: t('tourActionsDesc'),
      title: t('tourActionsTitle')
    },
    {
      target: '#dashboard-stats-grid',
      content: t('tourStatsDesc'),
      title: t('tourStatsTitle')
    },
    {
      target: '#sidebar-nav-container',
      content: t('tourSidebarDesc'),
      title: t('tourSidebarTitle')
    }
  ];

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (['finished', 'skipped'].includes(status)) {
      localStorage.setItem('km-has-seen-tour', 'true');
      if (onFinish) {
        onFinish();
      } else {
        setInternalRun(false);
      }
    }
  };

  // Get the named Joyride component from the module exports
  const JoyrideComponent = (JoyrideModule as any).Joyride || JoyrideModule;

  return (
    <JoyrideComponent
      steps={steps}
      run={activeRun}
      continuous
      showSkipButton
      showProgress
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#16a34a', // KrishiMitra emerald-600
          textColor: '#1f2937',
          backgroundColor: '#ffffff',
          arrowColor: '#ffffff',
          zIndex: 10000
        },
        buttonClose: {
          display: 'none'
        },
        buttonBack: {
          marginRight: 10,
          color: '#6b7280',
          fontSize: '11px',
          fontWeight: 'bold'
        },
        buttonNext: {
          fontSize: '11px',
          fontWeight: 'bold',
          borderRadius: '8px',
          padding: '8px 12px',
          color: '#ffffff',
          backgroundColor: '#16a34a'
        },
        tooltipContainer: {
          textAlign: 'left'
        }
      }}
    />
  );
};

export default OnboardingTour;
