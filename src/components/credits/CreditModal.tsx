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

  // Countdown placeholder - resetDate not currently in UserCredits
  // Can be re-enabled when resetDate is added to the schema

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deduction':
        return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'topup':
        return <Plus className="h-4 w-4 text-green-400" />;
      case 'reset':
        return <RefreshCw className="h-4 w-4 text-blue-400" />;
      case 'signup_bonus':
        return <Gift className="h-4 w-4 text-accent-foreground" />;
      default:
        return <Coins className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPlanBadge = () => {
    switch (credits?.planType) {
      case 'enterprise':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/20 text-accent-foreground rounded-full text-xs font-medium">
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
          <span className="flex items-center gap-1 px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
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
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-2xl font-bold text-primary">
                {isLoading ? '...' : isUnlimited ? '∞' : credits?.remainingCredits?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Remaining</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-2xl font-bold text-muted-foreground">
                {isLoading ? '...' : credits?.usedCredits?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Used</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-2xl font-bold text-muted-foreground">
                {isLoading ? '...' : isUnlimited ? '∞' : credits?.totalCredits?.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total</p>
            </div>
          </div>

          {/* Progress Bar */}
          {!isUnlimited && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Usage</span>
                <span className="font-medium">{creditPercentage}% remaining</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={cn('h-full rounded-full', getProgressColor())}
                  initial={{ width: 0 }}
                  animate={{ width: `${creditPercentage}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
            </div>
          )}

          {/* Reset Countdown - placeholder */}

          {/* Transaction History */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Activity</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                <AnimatePresence>
                  {transactions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      No transactions yet
                    </p>
                  ) : (
                    transactions.map((tx, i) => (
                      <motion.div
                        key={tx.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          {getTransactionIcon(tx.type)}
                          <div>
                            <p className="text-sm text-gray-200">
                              {tx.description || tx.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(tx.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span
                          className={cn(
                            'text-sm font-medium',
                            tx.type === 'deduction' ? 'text-red-400' : 'text-green-400'
                          )}
                        >
                          {tx.type === 'deduction' ? '-' : '+'}
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
