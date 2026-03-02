import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredits } from '@/hooks/useCredits';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Coins,
  Sparkles,
  Zap,
  Clock,
  ArrowUpRight,
  TrendingDown,
  RefreshCw,
  Gift,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreditModal({ open, onOpenChange }: CreditModalProps) {
  const navigate = useNavigate();
  const { credits, transactions, isLoading, creditPercentage, fetchTransactions, refetch } = useCredits();
  const [countdown, setCountdown] = useState('');

  // Fetch transactions when modal opens
  useEffect(() => {
    if (open) {
      fetchTransactions(10);
      refetch();
    }
  }, [open, fetchTransactions, refetch]);

  // Calculate countdown to reset
  useEffect(() => {
    if (!credits?.resetDate) return;

    const updateCountdown = () => {
      const now = new Date();
      const reset = new Date(credits.resetDate);
      const diff = reset.getTime() - now.getTime();

      if (diff <= 0) {
        setCountdown('Resetting...');
        refetch();
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setCountdown(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`);
      } else {
        setCountdown(`${minutes}m`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [credits?.resetDate, refetch]);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deduct':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'topup':
        return <Plus className="h-4 w-4 text-green-400" />;
      case 'reset':
        return <RefreshCw className="h-4 w-4 text-blue-400" />;
      case 'signup_bonus':
        return <Gift className="h-4 w-4 text-purple-400" />;
      default:
        return <Coins className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPlanBadge = () => {
    switch (credits?.planType) {
      case 'enterprise':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded-full text-xs font-medium">
            <Sparkles className="h-3 w-3" /> Enterprise
          </span>
        );
      case 'pro':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium">
            <Zap className="h-3 w-3" /> Pro
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium">
            <Coins className="h-3 w-3" /> Free
          </span>
        );
    }
  };

  const getProgressColor = () => {
    if (credits?.planType === 'enterprise') return 'bg-purple-500';
    if (creditPercentage > 50) return 'bg-emerald-500';
    if (creditPercentage > 20) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const isUnlimited = credits?.planType === 'enterprise';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#1a1a2e] border-gray-700/50 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Credit Balance
            </span>
            {getPlanBadge()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Credit Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-primary">
                {isLoading ? '...' : isUnlimited ? '∞' : credits?.remainingCredits?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Remaining</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-gray-300">
                {isLoading ? '...' : credits?.usedCredits?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Used</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-2xl font-bold text-gray-300">
                {isLoading ? '...' : isUnlimited ? '∞' : credits?.totalCredits?.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-1">Total</p>
            </div>
          </div>

          {/* Progress Bar */}
          {!isUnlimited && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Usage</span>
                <span className="font-medium">{creditPercentage}% remaining</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', getProgressColor())}
                  initial={{ width: 0 }}
                  animate={{ width: `${creditPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Reset Countdown */}
          {!isUnlimited && credits?.resetDate && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-gray-300">Credits reset in</span>
              </div>
              <span className="font-semibold text-blue-400">{countdown}</span>
            </div>
          )}

          {/* Transaction History */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-400">Recent Activity</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                <AnimatePresence>
                  {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4 text-sm">
                      No transactions yet
                    </p>
                  ) : (
                    transactions.map((tx, i) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <p className="text-sm text-gray-200">
                              {tx.description || tx.type}
                            </p>
                            <p className="text-xs text-gray-500">
                              {tx.modelUsed && `${tx.modelUsed} • `}
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            tx.type === 'deduct' ? 'text-red-400' : 'text-green-400'
                          )}
                        >
                          {tx.type === 'deduct' ? '-' : '+'}
                          {Math.abs(tx.amount)}
                        </span>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </ScrollArea>
          </div>

          {/* Upgrade CTA */}
          {credits?.planType === 'free' && (
            <Button
              onClick={() => {
                onOpenChange(false);
                navigate('/upgrade');
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Zap className="h-4 w-4 mr-2" />
              Upgrade to Pro
              <ArrowUpRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default CreditModal;
