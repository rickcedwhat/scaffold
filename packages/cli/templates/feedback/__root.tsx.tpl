import { createRootRouteWithContext, Outlet, useLocation } from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { FeedbackWidget, createNoopIssueAdapter } from '@scaffold/feedback';

export interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
});

// Replace with createGitHubIssueAdapter({ repository, proxyUrl }) to file real issues.
const feedbackAdapter = createNoopIssueAdapter({ id: 'local' });

function RootComponent() {
  const { pathname } = useLocation();

  return (
    <>
      <Outlet />
      <FeedbackWidget
        enabled
        adapter={feedbackAdapter}
        pathname={pathname}
        toastOnSuccess={false}
      />
    </>
  );
}
