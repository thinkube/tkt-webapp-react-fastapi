import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { TkAppLayout, type TkNavItem } from 'thinkube-style';
import { ListTodo, Settings, Key } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageMenu } from '@/components/LanguageMenu';
import { UserMenu } from '@/components/UserMenu';
import HomePage from '@/pages/HomePage';
import ApiTokensPage from '@/pages/ApiTokensPage';
import NotFoundPage from '@/pages/NotFoundPage';

/** Route each navigation item points at, keyed by its id. */
const NAV_ROUTES: Record<string, string> = {
  tasks: '/',
  'api-tokens': '/tokens',
};

export default function App() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems: TkNavItem[] = [
    {
      id: 'workspace',
      label: t('nav.workspace'),
      lucideIcon: ListTodo,
      isGroup: true,
      children: [{ id: 'tasks', label: t('nav.home'), lucideIcon: ListTodo, href: '/' }],
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      lucideIcon: Settings,
      isGroup: true,
      children: [
        { id: 'api-tokens', label: t('nav.apiTokens'), lucideIcon: Key, href: '/tokens' },
      ],
    },
  ];

  const activeItem = location.pathname.startsWith('/tokens') ? 'api-tokens' : 'tasks';
  const pageTitle = activeItem === 'api-tokens' ? t('apiTokens.title') : t('nav.home');

  return (
    <TkAppLayout
      navigationItems={navigationItems}
      activeItem={activeItem}
      onItemClick={(id) => {
        const path = NAV_ROUTES[id];
        if (path) navigate(path);
      }}
      logoText={t('app.title')}
      topBarTitle={pageTitle}
      topBarContent={
        <div className="flex items-center gap-2">
          <LanguageMenu />
          <ThemeToggle />
          <UserMenu />
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/tokens" element={<ApiTokensPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </TkAppLayout>
  );
}
