import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { cn } from "@/lib/cn";

export interface ToastAction {
  /** Visible label of the action, e.g. "Deshacer". */
  label: string;
  /** Called when the action is activated. Toast does not know what it does. */
  onClick: () => void;
}

export interface ToastOptions {
  /** The text announced and shown in the toast. */
  message: string;
  /** Decorative icon rendered before the message, e.g. `<Icon name="status-success" size={18} />`. */
  icon?: ReactNode;
  /** Optional action, e.g. an undo. Its presence extends the default duration to 10s. */
  action?: ToastAction;
  /** Milliseconds before the toast auto-dismisses. Defaults to 5000, or 10000 when `action` is set. */
  duration?: number;
}

interface QueuedToast extends ToastOptions {
  id: number;
}

interface ToastContextValue {
  /** Queues a toast. Only one is ever visible — later calls wait their turn. */
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Mount once, near the root of the app. Everything under it can call
 * `useToast()` to trigger a confirmation without knowing where the visual
 * element lives or coordinating with other callers — the provider owns the
 * queue, the timer and the fixed position, none of which a consumer should
 * have to rebuild per screen.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueuedToast[]>([]);
  const [open, setOpen] = useState(false);
  const nextId = useRef(0);
  const current = queue[0];

  useEffect(() => {
    if (current && !open) setOpen(true);
  }, [current, open]);

  const toast = useCallback((options: ToastOptions) => {
    const id = nextId.current++;
    setQueue((queued) => [...queued, { ...options, id }]);
  }, []);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      // Give the current toast's exit a beat before the next one takes its
      // place, so two toasts never visually overlap mid-transition.
      window.setTimeout(() => setQueue((queued) => queued.slice(1)), 150);
    }
  }

  const duration = current?.duration ?? (current?.action ? 10000 : 5000);

  return (
    <ToastContext.Provider value={{ toast }}>
      <RadixToast.Provider duration={duration}>
        {children}
        {current && (
          <RadixToast.Root
            open={open}
            onOpenChange={handleOpenChange}
            duration={duration}
            className={cn(
              "flex items-center gap-3 rounded-control bg-neutral-bold px-4 py-3.5 text-neutral-inverse shadow-md",
              "data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
              "data-[swipe=cancel]:translate-x-0",
              "data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)]",
            )}
          >
            {current.icon && (
              <span aria-hidden="true" className="shrink-0">
                {current.icon}
              </span>
            )}
            <RadixToast.Title className="flex-1 text-body-sm">{current.message}</RadixToast.Title>
            {current.action && (
              <RadixToast.Action
                altText={current.action.label}
                onClick={current.action.onClick}
                className="shrink-0 text-body-sm font-medium text-neutral-inverse underline underline-offset-2"
              >
                {current.action.label}
              </RadixToast.Action>
            )}
          </RadixToast.Root>
        )}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-notification flex w-80 flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastContext.Provider>
  );
}

/** Returns `{ toast }` to trigger a Toast. Throws outside of `ToastProvider`, the same way a missing router provider would. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
