import React from 'react';
import { LogOut } from 'lucide-react';
import { ConfirmationDialog } from './ConfirmationDialog';

export interface LogoutConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  hasUnsavedChanges?: boolean;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  loading = false,
  hasUnsavedChanges = false,
}) => {
  return (
    <ConfirmationDialog
      isOpen={isOpen}
      title="Sign Out"
      message="Are you sure you want to sign out of your NAISIS account?"
      description={
        hasUnsavedChanges
          ? "You have unsaved changes. Leaving this page may cause those changes to be lost."
          : "Any unsaved changes may be lost. Make sure your work has been saved before signing out."
      }
      confirmText="Sign Out"
      cancelText="Cancel"
      confirmVariant="danger"
      icon={LogOut}
      onConfirm={onConfirm}
      onCancel={onCancel}
      loading={loading}
    />
  );
};
