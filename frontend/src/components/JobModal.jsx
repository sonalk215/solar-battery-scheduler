import { FiX } from 'react-icons/fi';
import CheckoutButton from './CheckoutButton';

const JobModal = ({ job, onClose }) => {
  if (!job) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <FiX className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          Job Details: {job.job_id}
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Review job particulars and collect deposit via Stripe.
        </p>

        <div className="space-y-2.5 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
          <div className="flex justify-between">
            <span className="text-slate-500">Customer Name:</span>
            <span className="font-semibold text-slate-800">
              {job.customer_name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Location / Suburb:</span>
            <span className="font-semibold text-slate-800">{job.suburb}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Duration Blocks:</span>
            <span className="font-semibold text-slate-800">
              {job.duration_blocks} Hour(s)
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <CheckoutButton job={job} />
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
