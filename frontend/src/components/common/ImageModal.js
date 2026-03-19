import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Fragment } from 'react';

export default function ImageModal({ src, open, setOpen }) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="relative max-w-3xl w-full">
              <button
                className="absolute top-2 right-2 text-white hover:text-gray-300"
                onClick={() => setOpen(false)}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
              <img src={src} alt="Full view" className="rounded-lg shadow-xl w-full" />
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
