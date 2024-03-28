import cn from "@/utils/cn";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50"
      )}
      onClick={onClose}>
      <div
        className={cn("min-h-screen px-4 text-center")}
        onClick={(e) => e.stopPropagation()}>
        <span
          className={cn("inline-block h-screen align-middle")}
          aria-hidden="true">
          &#8203;
        </span>
        <div
          className={cn(
            "my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
          )}>
          <div className={cn("flex items-center justify-between")}>
            <h3 className={cn("text-lg font-medium leading-6 text-gray-900")}>
              Error
            </h3>
            <button
              type="button"
              className={cn(
                "ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900"
              )}
              onClick={onClose}>
              <svg
                className={cn("h-5 w-5")}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"></path>
              </svg>
            </button>
          </div>
          <div className={cn("mt-4")}>{children}</div>
        </div>
      </div>
    </div>
  );
}
