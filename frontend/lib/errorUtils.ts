/**
 * 錯誤訊息雙語格式化工具
 * 將英文錯誤訊息轉換為「繁體中文 (英文)」格式，方便人類閱讀與 AI 排錯。
 */

const ERROR_MAP: Record<string, string> = {
    'Unauthorized': '登入逾時或權限不足',
    'Failed to fetch': '連線失敗或無法串接數據',
    'Failed to fetch portfolios': '無法載入投資組合列表',
    'Failed to create portfolio': '建立投資組合失敗',
    'Failed to delete portfolio': '刪除投資組合失敗',
    'Failed to fetch portfolio': '無法載入投資組合詳情',
    'Failed to fetch performance': '無法載入績效數據',
    'Failed to add holding': '新增持股失敗',
    'Failed to delete holding': '移除持股失敗',
    'Failed to fetch watchlist': '無法載入自選股列表',
    'Failed to fetch quotes': '無法載入即時報價',
    'Failed to add stock': '加入自選股失敗',
    'Failed to remove stock': '移除自選股失敗',
    'Internal Server Error': '伺服器內部錯誤',
    'Not Found': '找不到資源',
};

/**
 * 格式化錯誤訊息為雙語模式
 * @param message 原始錯誤訊息
 * @returns 雙語格式化後的字串
 */
export function formatErrorMessage(message: string): string {
    if (!message) return '發生未知錯誤 (Unknown error)';

    // 檢查是否有精確匹配
    if (ERROR_MAP[message]) {
        return `${ERROR_MAP[message]} (${message})`;
    }

    // 檢查關鍵字匹配 (例如 Failed to fetch stock detail: 404)
    for (const [key, value] of Object.entries(ERROR_MAP)) {
        if (message.includes(key)) {
            return `${value} (${message})`;
        }
    }

    // 若無匹配則返回原訊息 (如果是英文) 或補上 Unknown
    const isEnglish = /^[A-Za-z0-9\s.,!?:;'"()-]+$/.test(message);
    if (isEnglish) {
        return `發生錯誤 (${message})`;
    }

    return message;
}
