import { ReactNode, useEffect } from "react";

type ModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
};

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEsc);
        }
        return () => document.removeEventListener("keydown", handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()} // Prevent close on inner click
            >
                {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
                {children}
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    onClick={onClose}
                    aria-label="Close Modal"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Modal;
