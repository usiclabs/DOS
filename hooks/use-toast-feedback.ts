import { toast } from "@/hooks/use-toast"

export function useToastFeedback() {
  const showSuccess = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
    })
  }

  const showError = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      variant: "destructive",
      duration: 4000,
    })
  }

  const showLoading = (message: string) => {
    return toast({
      title: message,
      description: "Please wait...",
      duration: Number.POSITIVE_INFINITY,
    })
  }

  const showInfo = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3000,
    })
  }

  const showWarning = (message: string, description?: string) => {
    toast({
      title: message,
      description,
      duration: 3500,
    })
  }

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showWarning,
    dismiss: (toastId?: string) => {
      // Dismiss functionality handled by toast system
    },
  }
}
