import { useTranslation } from 'react-i18next';
import { Header } from '@/components/ui';

export const LoadingState: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-bg-primary">
      <Header />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="spinner w-12 h-12 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-dark-text-secondary">{t('dashboard.loading')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
