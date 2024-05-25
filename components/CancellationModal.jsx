// CancellationModal.js
import React from "react";

const CancellationModal = ({ isOpen, onCancel, onConfirm, loadingPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">
          Confirm Subscription Cancellation
        </h2>
        <p>Are you sure you want to cancel your subscription?</p>
        <div className="flex justify-end mt-4">
          <button
            className="bg-red-500 text-white px-4 py-2 mr-4 rounded hover:bg-red-300"
            onClick={onCancel}
          >
            No
          </button>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-300"
            disabled={loadingPlan}
            onClick={onConfirm}
          >
            {loadingPlan ? "Processing..." : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;
