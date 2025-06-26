import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  past: T[];
  present: T;
  future: T[];
}

interface UndoRedoActions<T> {
  set: (newState: T) => void;
  setImmediate: (newState: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
}

export function useUndoRedo<T>(initialState: T, debounceMs: number = 1000): [T, UndoRedoActions<T>] {
  const [state, setState] = useState<UndoRedoState<T>>({
    past: [],
    present: initialState,
    future: []
  });

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingStateRef = useRef<T | null>(null);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  // Immediate state update without saving to history (for smooth typing)
  const setImmediate = useCallback((newState: T) => {
    setState(currentState => ({
      ...currentState,
      present: newState
    }));
  }, []);

  // Debounced state update that saves to history (for undo/redo)
  const set = useCallback((newState: T) => {
    // Update state immediately for smooth UX
    setImmediate(newState);
    
    // Store the pending state
    pendingStateRef.current = newState;
    
    // Clear existing timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout to save to history
    debounceTimeoutRef.current = setTimeout(() => {
      if (pendingStateRef.current) {
        setState(currentState => ({
          past: [...currentState.past, currentState.present],
          present: pendingStateRef.current!,
          future: []
        }));
        pendingStateRef.current = null;
      }
    }, debounceMs);
  }, [debounceMs, setImmediate]);

  const undo = useCallback(() => {
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      pendingStateRef.current = null;
    }

    setState(currentState => {
      if (currentState.past.length === 0) return currentState;

      const previous = currentState.past[currentState.past.length - 1];
      const newPast = currentState.past.slice(0, currentState.past.length - 1);

      return {
        past: newPast,
        present: previous,
        future: [currentState.present, ...currentState.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      pendingStateRef.current = null;
    }

    setState(currentState => {
      if (currentState.future.length === 0) return currentState;

      const next = currentState.future[0];
      const newFuture = currentState.future.slice(1);

      return {
        past: [...currentState.past, currentState.present],
        present: next,
        future: newFuture
      };
    });
  }, []);

  const clear = useCallback(() => {
    // Clear any pending debounced save
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
      pendingStateRef.current = null;
    }

    setState(currentState => ({
      past: [],
      present: currentState.present,
      future: []
    }));
  }, []);

  return [
    state.present,
    {
      set,
      setImmediate,
      undo,
      redo,
      canUndo,
      canRedo,
      clear
    }
  ];
}