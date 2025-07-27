import { useEffect } from 'react';

const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Don't trigger shortcuts when typing in input fields
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrl = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      // Check each shortcut
      shortcuts.forEach(({ keys, action, description }) => {
        const keyMatch = keys.key === key;
        const ctrlMatch = keys.ctrl === ctrl;
        const shiftMatch = keys.shift === shift;
        const altMatch = keys.alt === alt;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          action();
        }
      });
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default useKeyboardShortcuts; 