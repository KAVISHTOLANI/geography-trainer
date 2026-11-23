import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { COUNTRIES } from './lib/geo';

const KEY = 'mapwise:store';

describe('Mapwise', () => {
  it('runs a multiple-choice round to the results screen and saves it', async () => {
    localStorage.setItem(KEY, JSON.stringify({ history: [] }));
    window.location.hash = '/quiz';
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('Questions'), '5');
    await user.click(screen.getByRole('button', { name: /Start 5 questions/ }));
    for (let i = 0; i < 5; i++) {
      const opts = screen.getAllByRole('button').filter((b) => b.classList.contains('opt'));
      await user.click(opts[0]);
      expect(screen.getByRole('status')).toHaveTextContent(/Correct!|Not quite/);
      await user.click(screen.getByRole('button', { name: i === 4 ? 'See results' : 'Next →' }));
    }
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/out of 5/);
    expect(JSON.parse(localStorage.getItem(KEY)!).history).toHaveLength(1);
  });

  it('accepts typed answers with aliases', async () => {
    localStorage.setItem(KEY, JSON.stringify({ history: [] }));
    window.location.hash = '/quiz';
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('radio', { name: 'Capital → country' }));
    await user.click(screen.getByLabelText('Type answers instead of choosing'));
    await user.click(screen.getByRole('button', { name: /Start 10 questions/ }));
    const capital = screen.getByRole('heading', { level: 1 }).querySelector('strong')!.textContent!;
    const country = COUNTRIES.find((c) => c.capital === capital)!;
    await user.type(screen.getByLabelText('Your answer'), (country.aliases?.[0] ?? country.name).toLowerCase());
    await user.click(screen.getByRole('button', { name: 'Check' }));
    expect(screen.getByRole('status')).toHaveTextContent('Correct!');
  });

  it('retries last round’s misses', async () => {
    window.location.hash = '/quiz';
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Retry last round’s 3 misses' }));
    expect(screen.getByText(/Question 1 of 3/)).toBeInTheDocument();
  });

  it('measures the distance between capitals', async () => {
    window.location.hash = '/map';
    const user = userEvent.setup();
    render(<App />);
    await user.selectOptions(screen.getByLabelText('From'), 'France');
    await user.selectOptions(screen.getByLabelText('To'), 'Germany');
    expect(screen.getByTestId('distance').textContent).toMatch(/^8\d\d km$/);
    await user.click(screen.getByRole('button', { name: 'Canberra, Australia' }));
    expect(screen.getByRole('status')).toHaveTextContent('Canberra is the capital of Australia');
  });

  it('searches the reference and shows history', () => {
    window.location.hash = '/reference';
    const { unmount } = render(<App />);
    expect(within(screen.getByRole('table')).getAllByRole('row').length).toBe(16);
    unmount();
    window.location.hash = '/history';
    render(<App />);
    expect(screen.getByRole('heading', { name: 'Most often missed' })).toBeInTheDocument();
    expect(screen.getByText('Switzerland')).toBeInTheDocument();
  });
});
