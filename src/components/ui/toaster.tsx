import { useEffect } from 'react';

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from 'src/components/ui/toast';
import { useToast } from 'src/components/ui/use-toast';

export const Toaster = () => {
  const { toasts, dismiss } = useToast();

  useEffect(() => {
    return () => {
      toasts.forEach((toast) => {
        if (!toast.open) {
          dismiss(toast.id);
        }
      });
    };
  }, [toasts, dismiss]);

  return (
    <ToastProvider swipeDirection="right">
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title ? <ToastTitle>{title}</ToastTitle> : null}
              {description ? <ToastDescription>{description}</ToastDescription> : null}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
};
