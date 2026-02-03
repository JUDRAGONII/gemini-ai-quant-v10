import useSWR, { mutate } from 'swr';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface MarketQuote {
  stock_code: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  volume: number;
  updated_at: string;
  source: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

/**
 * useMarketQuotes Hook
 * 結合 SWR (初始載入) 與 Supabase Realtime (即時推送)
 * 實現高效能且配額平衡的行情分發。
 */
export function useMarketQuotes(symbols?: string[]) {
  const url = symbols 
    ? `/api/v1/market/quotes?symbols=${symbols.join(',')}` 
    : '/api/v1/market/quotes';

  const { data, error, isLoading } = useSWR<MarketQuote[]>(url, fetcher, {
    revalidateOnFocus: false, // 優先依賴 Realtime
    refreshInterval: 600000, // 每 10 分鐘兜底刷新一次
  });

  useEffect(() => {
    // 1. 設定 Realtime 訂閱
    const channel = supabase
      .channel('market-relay-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'market_quotes',
        },
        (payload) => {
          const updatedQuote = payload.new as MarketQuote;
          
          // 2. 更新 SWR 快取 (Optimistic Update 概念)
          mutate(url, (currentData: MarketQuote[] | undefined) => {
            if (!currentData) return [updatedQuote];
            return currentData.map((item) =>
              item.stock_code === updatedQuote.stock_code ? updatedQuote : item
            );
          }, false);
        }
      )
      .subscribe();

    // 2. 清理訂閱
    return () => {
      supabase.removeChannel(channel);
    };
  }, [url]);

  return {
    quotes: data || [],
    isLoading,
    isError: error,
  };
}
