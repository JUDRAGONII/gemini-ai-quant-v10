export type AlertLevel = 'info' | 'warning' | 'critical';

export interface MarketAlert {
    id: string;
    stock_code: string;
    stock_name?: string;
    market_type: string;
    alert_type: string;
    alert_level: AlertLevel;
    alert_title: string;
    alert_description?: string;
    trigger_value?: number;
    threshold_value?: number;
    change_percent?: number;
    triggered_at: string;
    expires_at?: string;
    is_read: boolean;
    read_at?: string;
    is_dismissed: boolean;
    metadata?: any;
    created_at: string;
}

export interface UnreadCountResponse {
    unread_count: number;
}
