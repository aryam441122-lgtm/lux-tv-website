
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useLanguage } from "@/contexts/LanguageContext"

export function Toaster() {
  const { toasts } = useToast()
  const { isRTL } = useLanguage()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className={isRTL ? "rtl" : "ltr"}>
            <div className="grid gap-1">
              {title && <ToastTitle className={isRTL ? "text-right" : "text-left"}>{title}</ToastTitle>}
              {description && (
                <ToastDescription className={isRTL ? "text-right" : "text-left"}>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport className={isRTL ? "right-auto left-0" : ""} />
    </ToastProvider>
  )
}
