
import toast from 'react-hot-toast';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToast = () => {
  const showToast = (options: ToastOptions) => {
    if (options.variant === 'destructive') {
      toast.error(options.description || options.title || '', {
        duration: options.duration || 4000
      });
    } else {
      toast.success(options.description || options.title || '', {
        duration: options.duration || 4000
      });
    }
  };

  return {
    toast: showToast
  };
};

export { toast };
