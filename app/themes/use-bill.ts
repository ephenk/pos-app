import { useState } from 'react';
import { computeTotals, type Item, type Settings } from '@/lib/bill';

export function useBill(settings: Settings) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [confirmed, setConfirmed] = useState(false);
  const [copied, setCopied] = useState(false);

  const change = (item: Item, delta: number) => {
    setQuantities((prev) => {
      const newQty = Math.min(Math.max((prev[item.name] || 0) + delta, 0), item.maxQty);
      return { ...prev, [item.name]: newQty };
    });
  };

  const copyAccount = () => {
    navigator.clipboard.writeText(settings.bank.number).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return {
    quantities,
    change,
    confirmed,
    setConfirmed,
    copied,
    copyAccount,
    ...computeTotals(settings, quantities),
  };
}
