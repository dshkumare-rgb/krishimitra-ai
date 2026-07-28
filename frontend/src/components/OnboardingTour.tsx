import React from 'react';
import Joyride, { Step, CallBackProps, STATUS } from 'react-joyride';
import { useLanguage } from '../context/LanguageContext';

interface OnboardingTourProps {
  run: boolean;
  onFinish: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ run, onFinish }) => {
  const { t } = useLanguage();

  const steps: Step[] = [
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

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      onFinish();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
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
