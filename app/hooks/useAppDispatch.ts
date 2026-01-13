import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';

// Typed dispatch hook
export const useAppDispatch = () => useDispatch<AppDispatch>();
