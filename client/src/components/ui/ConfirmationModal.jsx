const ConfirmationModal = ({
  open,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to continue?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  showCancel = true,
}) => {
  if (!open) return null;

  const buttonClass =
    variant === "info"
      ? "bg-orange-500 text-white hover:bg-orange-600"
      : "bg-red-600 text-white hover:bg-red-700";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="mt-3 whitespace-pre-line text-gray-600">{message}</p>
        </div>

        <div className="flex justify-end gap-3 border-t p-4">
          {showCancel ? (
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-5 py-2 text-gray-700 transition hover:bg-gray-100"
            >
              {cancelText}
            </button>
          ) : null}

          <button
            onClick={() => {
              onConfirm?.();
            }}
            className={`rounded-lg px-5 py-2 transition ${buttonClass}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
