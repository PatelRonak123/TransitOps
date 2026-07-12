const DeleteDriverModal = ({ open, onClose, onConfirm, driver }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <h2 className="text-xl font-bold text-slate-800">
            Delete Driver
          </h2>

          <p className="mt-3 text-gray-600">
            Are you sure you want to delete{" "}
            <span className="font-semibold">{driver?.full_name || driver?.name || "this driver"}</span>?
          </p>

          <p className="mt-1 text-sm text-red-500">
            This action cannot be undone.
          </p>
        </div>

        <div className="flex justify-end gap-3 border-t p-4">
          <button
            onClick={onClose}
            className="rounded-lg border px-5 py-2 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteDriverModal;