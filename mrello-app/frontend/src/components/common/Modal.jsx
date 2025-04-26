// frontend/src/components/common/Modal.jsx
import React from 'react';
import { FiX } from 'react-icons/fi'; // Import close icon

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  // Handle clicks outside the modal content to close
  const handleOutsideClick = (e) => {
    if (e.target.id === 'modal-backdrop') {
      onClose();
    }
  };

  return (
    // Backdrop with background blur and click handling
    <div
      id="modal-backdrop"
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4" // High z-index
    >
      {/* Modal Content Box */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-auto relative max-h-[90vh] flex flex-col">
         {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">{title || 'Modal'}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 rounded-full hover:bg-gray-200"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>

         {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto">
          {children}
        </div>

        {/* Optional: Modal Footer - can be added via children if needed */}
        {/* <div className="p-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose} className="...">Close</button>
        </div> */}
      </div>
    </div>
  );
}

export default Modal;