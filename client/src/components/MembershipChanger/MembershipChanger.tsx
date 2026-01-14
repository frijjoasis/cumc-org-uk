import React, { useState } from 'react';
import axios from 'axios';
import { Check, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface MembershipChangerProps {
  callback: (error: string | null, success: string | null) => void;
  id: string;
  default: boolean; // Current paid status
}

const MembershipChanger = ({ callback, id, default: isPaid }: MembershipChangerProps) => {
  const [loading, setLoading] = useState(false);

  const toggleStatus = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/member/update', {
        id: id,
        status: !isPaid,
      });

      if (res.data.err) {
        callback(res.data.err, null);
      } else {
        callback(null, `Membership for user ${id} updated to ${!isPaid ? 'Paid' : 'Unpaid'}`);
      }
    } catch (err) {
      callback('Network error: Failed to update status', null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleStatus}
            disabled={loading}
            className={`
              w-24 px-2 justify-between font-bold uppercase tracking-tighter transition-all
              ${isPaid 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 hover:text-emerald-800' 
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:text-rose-800'
              }
            `}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin mx-auto" />
            ) : (
              <>
                <span className="text-[10px]">{isPaid ? 'PAID' : 'UNPAID'}</span>
                {isPaid ? (
                  <Check className="h-3 w-3 text-emerald-500" />
                ) : (
                  <X className="h-3 w-3 text-rose-500" />
                )}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p className="text-[10px] font-bold uppercase tracking-widest">
            Click to mark as {isPaid ? 'Unpaid' : 'Paid'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default MembershipChanger;