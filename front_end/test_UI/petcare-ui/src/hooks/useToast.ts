import { useContext } from 'react';
import { ToastContext } from '../context/ToastContext';
import type { ToastFn } from '../types';

export const useToast = (): ToastFn => useContext(ToastContext) as ToastFn;
