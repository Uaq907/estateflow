import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from './page';
import '@testing-library/jest-dom';

// Mock the useActionState hook as it's not supported in jsdom
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: (action: any, initialState: any) => [initialState, action, false],
}));

// Mock the server action module
jest.mock('./actions', () => ({
  authenticate: jest.fn(),
  createAdminAction: jest.fn(),
}));

// Mock the auth lib functions
jest.mock('@/lib/auth', () => ({
    getEmployeeByEmail: jest.fn().mockResolvedValue(null)
}));

describe('LoginPage', () => {
  it('renders the login form', () => {
    render(<LoginPage />);

    // Check for the main title
    expect(screen.getByText('Welcome to EstateFlow')).toBeInTheDocument();

    // Check for form fields
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    // Check for the login button
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows the create admin button if no admin exists', async () => {
    // Mock that admin does not exist
    const { getEmployeeByEmail } = require('@/lib/auth');
    getEmployeeByEmail.mockResolvedValue(null);
    
    render(<LoginPage />);

    // The component uses useEffect to check for admin, so we need to wait for it
    expect(await screen.findByRole('button', { name: /Create Admin Account/i })).toBeInTheDocument();
  });

  it('does not show the create admin button if an admin exists', async () => {
    // Mock that admin exists
    const { getEmployeeByEmail } = require('@/lib/auth');
    getEmployeeByEmail.mockResolvedValue({ id: '1', name: 'Admin', email: 'admin@oligo.ae' });
    
    render(<LoginPage />);

    // Wait for the component to check for admin
    await screen.findByText('Welcome to EstateFlow');

    // Assert that the create admin button is not present
    expect(screen.queryByRole('button', { name: /Create Admin Account/i })).not.toBeInTheDocument();
  });
});
