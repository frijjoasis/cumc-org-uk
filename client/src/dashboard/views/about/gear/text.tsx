import React from 'react';
import { NavLink } from 'react-router-dom';

const gearSecLink = (
  <NavLink
    to="/about/committee"
    className="text-primary font-bold hover:underline"
  >
    gear secretary
  </NavLink>
);

const gearAbout = [
  <p>
    The club maintains an extensive rack of equipment available for member use.
    Gear can be borrowed and returned at regular <strong>"gear teas"</strong>{' '}
    during term time, which are advertised via the mailing list. Outside of term
    time, please contact the {gearSecLink} directly.
  </p>,
  <p>
    <strong>Membership is required</strong> to borrow technical gear. However,
    climbing shoes can be borrowed by non-members for a{' '}
    <strong>£5 refundable deposit</strong>—perfect for those just trying out the
    sport.
  </p>,
  <p>
    In term time, gear must be returned within <strong>one week</strong> of
    issue. To keep equipment for longer trips, you must contact the gear
    secretary to renew the loan. Failure to return gear without a legitimate
    reason may result in the borrower being invoiced for the replacement cost.
  </p>,
  <p>
    The club covers the cost of gear lost or damaged during normal, responsible
    use. If reasonable precautions were not taken, the borrower will be expected
    to cover replacement costs calculated using the following depreciation
    formula:
  </p>,
  <div className="py-8 my-6 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col items-center justify-center shadow-inner">
    <span className="text-zinc-400 uppercase text-[10px] font-black tracking-[0.2em] mb-4">
      Depreciation Formula
    </span>
    <div className="text-lg md:text-xl font-mono font-bold text-zinc-800 tracking-tight">
      Value = Cost × (1 — [Age / Max Age])
    </div>
  </div>,
];

export { gearAbout };
