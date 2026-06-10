import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the ReelCraft AI header and empty-state upload prompt', () => {
  render(<App />);
  expect(screen.getByText(/ReelCraft/i)).toBeInTheDocument();
  expect(screen.getByText(/Upload your media/i)).toBeInTheDocument();
});
