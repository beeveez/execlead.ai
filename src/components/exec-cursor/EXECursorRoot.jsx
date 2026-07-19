import React from 'react';
import { EXECursorProvider } from '@/lib/EXECursorContext';
import EXECursor from './EXECursor';

/**
 * EXECursorRoot — wraps the app with the cursor provider and renders the cursor.
 * Place at the app root so every page automatically inherits cursor behavior.
 */
export default function EXECursorRoot({ children }) {
  return (
    <EXECursorProvider>
      {children}
      <EXECursor />
    </EXECursorProvider>
  );
}