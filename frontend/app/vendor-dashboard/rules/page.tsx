'use client';
import { ShieldAlert, CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export default function RulesPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-orange-400" />
          Platform Rules & Conduct
        </h1>
        <p className="text-sm text-[#8b949e] mt-1">
          To maintain a fair and secure marketplace, all EventDhara vendors must adhere to these policies. Violations may result in score drops, temporary suspension, or permanent banning.
        </p>
      </div>

      <div className="space-y-4">
        {/* Do's */}
        <div className="bg-[#161b22] border border-green-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-400" /> What You Must Do
          </h2>
          <ul className="space-y-3">
             {[
               "Acknowledge leads within the 20-minute window to maintain a high Response Rate.",
               "Confirm the final agreed price through the Vendor Dashboard immediately after concluding the initial call.",
               "Arrive on-time for the event. For large setups, this means being present at least 2 hours before the start time.",
               "Confirm your 'D-1 Readiness' (Day minus 1) via the dashboard to unlock the full client address.",
               "Ensure your bank details are accurate so payouts can be processed automatically without delay."
             ].map((rule, i) => (
               <li key={i} className="flex items-start gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 shrink-0" />
                 <span className="text-sm text-[#8b949e] leading-relaxed"><strong className="text-white font-medium">{rule.split('.')[0]}.</strong>{rule.substring(rule.indexOf('.'))}</span>
               </li>
             ))}
          </ul>
        </div>

        {/* Don'ts */}
        <div className="bg-[#161b22] border border-red-500/20 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <XCircle className="w-5 h-5 text-red-400" /> Strict Violations (Zero Tolerance)
          </h2>
          <ul className="space-y-4">
             {[
               { title: "Bypassing the Platform", desc: "You must NOT share your personal phone number, WhatsApp, Instagram, or direct UPI details with the client. All communication (via masked calls) and payments must be routed through EventDhara." },
               { title: "Direct Booking Inducement", desc: "You must NOT offer discounts to the client for booking directly or bypassing EventDhara. Clients are surveyed post-event regarding this." },
               { title: "No-Shows", desc: "Failing to show up for a confirmed order (where a deposit was paid) without 48 hours prior emergency notice will result in immediate permanent suspension." },
               { title: "Subcontracting", desc: "You must NOT send another unregulated vendor in your place without notifying EventDhara and the client." }
             ].map((rule, i) => (
               <li key={i} className="flex items-start gap-3">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0" />
                 <div className="text-sm text-[#8b949e] leading-relaxed">
                   <strong className="text-white font-medium">{rule.title}</strong>
                   <p className="mt-0.5">{rule.desc}</p>
                 </div>
               </li>
             ))}
          </ul>
        </div>

        {/* Dispute Policy */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Dispute & Payout Policy
          </h2>
          <div className="space-y-3 text-sm text-[#8b949e] leading-relaxed">
             <p>All payouts to vendors are subject to a <strong className="text-white">T+2 to T+3 settlement cycle</strong> after the order is marked 'Delivered'.</p>
             <p>If a client raises a service dispute within 24 hours of the event (e.g., poor quality, rude behavior, late arrival), <strong className="text-yellow-400">the payout will be placed on hold</strong>.</p>
             <p>EventDhara will mediate the dispute by reviewing masked call recordings and asking for photographic evidence of the setup from both parties. The final decision made by EventDhara's arbitration team is binding.</p>
          </div>
        </div>
        
        {/* Score Note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
           <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
           <p className="text-sm text-blue-100">
             <strong className="text-blue-400">Did you know?</strong> Vendors who strictly adhere to the rules automatically receive the <span className="font-mono">#1 position</span> in the lead queue more often due to a highly optimized matching score.
           </p>
        </div>

      </div>
    </div>
  );
}
