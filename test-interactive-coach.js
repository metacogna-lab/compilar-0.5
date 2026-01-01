/**
 * Simple test for InteractiveAICoach component
 * Tests basic rendering and API integration
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import InteractiveAICoach from './src/components/assess/InteractiveAICoach';

// Mock the useAIChat hook
jest.mock('./src/hooks/useRestApi', () => ({
  useAIChat: () => ({
    messages: [],
    streaming: false,
    sendMessage: jest.fn(),
  }),
}));

// Mock react-markdown
jest.mock('react-markdown', () => ({ children }) => <div>{children}</div>);

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: ({ children, ...props }) => <div {...props}>{children}</div>,
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Sparkles: () => <div>Sparkles</div>,
  Send: () => <div>Send</div>,
  Loader2: () => <div>Loader2</div>,
  MessageCircle: () => <div>MessageCircle</div>,
  X: () => <div>X</div>,
  Lightbulb: () => <div>Lightbulb</div>,
  TrendingUp: () => <div>TrendingUp</div>,
}));

// Mock shadcn components
jest.mock('./src/components/ui/button', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
}));

jest.mock('./src/components/ui/input', () => ({
  Input: (props) => <input {...props} />,
}));

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}));

describe('InteractiveAICoach Component', () => {
  const mockProps = {
    assessmentResults: { id: 'test-assessment' },
    userProfile: { id: 'test-user' },
    pillar: 'leadership',
    mode: 'egalitarian',
    isOpen: true,
    onClose: jest.fn(),
  };

  test('renders without crashing', () => {
    render(<InteractiveAICoach {...mockProps} />);
    expect(screen.getByText('AI Coach Session')).toBeInTheDocument();
  });

  test('displays header with correct title', () => {
    render(<InteractiveAICoach {...mockProps} />);
    expect(screen.getByText('AI Coach Session')).toBeInTheDocument();
    expect(screen.getByText('Ask me anything about your results')).toBeInTheDocument();
  });

  test('has input field and send button', () => {
    render(<InteractiveAICoach {...mockProps} />);
    const input = screen.getByPlaceholderText('Ask about your results, forces, or next steps...');
    const sendButton = screen.getByRole('button');

    expect(input).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
  });

  test('shows suggestion buttons', () => {
    render(<InteractiveAICoach {...mockProps} />);
    expect(screen.getByText('What are my weak areas?')).toBeInTheDocument();
    expect(screen.getByText('How can I improve?')).toBeInTheDocument();
    expect(screen.getByText('Explain my missed questions')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    render(<InteractiveAICoach {...mockProps} />);
    const closeButton = screen.getByRole('button', { name: /x/i });
    fireEvent.click(closeButton);
    expect(mockProps.onClose).toHaveBeenCalled();
  });

  test('does not render when isOpen is false', () => {
    render(<InteractiveAICoach {...mockProps} isOpen={false} />);
    expect(screen.queryByText('AI Coach Session')).not.toBeInTheDocument();
  });
});