import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { UserMenu } from '../UserMenu';
import { useAuthStore } from '@/stores/useAuthStore';

const logout = vi.fn();

function renderMenu() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<UserMenu />} />
        <Route path="/tokens" element={<div>Tokens page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  useAuthStore.setState({
    user: { sub: 'u1', preferred_username: 'alice', email: 'alice@example.com' },
    logout,
  });
});

describe('UserMenu', () => {
  it('renders nothing while no user is loaded', () => {
    useAuthStore.setState({ user: null });

    const { container } = renderMenu();

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the username on the trigger', () => {
    renderMenu();

    expect(screen.getByRole('button', { name: /alice/ })).toBeInTheDocument();
  });

  it('navigates to the API tokens page', async () => {
    const user = userEvent.setup();

    renderMenu();
    await user.click(screen.getByRole('button', { name: /alice/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'API Tokens' }));

    expect(await screen.findByText('Tokens page')).toBeInTheDocument();
  });

  it('logs the user out', async () => {
    const user = userEvent.setup();

    renderMenu();
    await user.click(screen.getByRole('button', { name: /alice/ }));
    await user.click(await screen.findByRole('menuitem', { name: 'Logout' }));

    expect(logout).toHaveBeenCalled();
  });
});
