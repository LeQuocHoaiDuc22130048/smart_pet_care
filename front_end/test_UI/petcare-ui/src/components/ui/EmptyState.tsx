import { Link } from 'react-router-dom';
import { Button } from './Button';
import type { ButtonVariant } from '../../types';

interface EmptyStateAction {
  label: string;
  to?: string;
  onClick?: () => void;
  variant?: ButtonVariant;
}

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: EmptyStateAction;
}

export function EmptyState({ icon = '🔍', title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="text-6xl mb-4 float">{icon}</div>
      <h3 className="text-xl font-bold text-neutral-700 dark:text-neutral-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-neutral-400 max-w-xs mb-6">{description}</p>}
      {action && (
        action.to
          ? <Link to={action.to}><Button variant={action.variant ?? 'primary'}>{action.label}</Button></Link>
          : <Button onClick={action.onClick} variant={action.variant ?? 'primary'}>{action.label}</Button>
      )}
    </div>
  );
}
