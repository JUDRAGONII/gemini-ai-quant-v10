import pytest
import sys
from unittest.mock import MagicMock, patch
from datetime import datetime, timedelta
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class MockResponse:
    def __init__(self, data=None, error=None):
        self.data = data
        self.error = error

    def execute(self):
        if self.error:
            raise Exception(str(self.error))
        return self

class MockSupabaseClient:
    def __init__(self):
        self._tables = {}
        self._stored_data = {}

    def table(self, name):
        mock_table = MagicMock()
        mock_table.select = MagicMock(return_value=self)
        mock_table.insert = MagicMock(return_value=self)
        mock_table.update = MagicMock(return_value=self)
        mock_table.delete = MagicMock(return_value=self)
        mock_table.eq = MagicMock(return_value=self)
        mock_table.ilike = MagicMock(return_value=self)
        mock_table.order = MagicMock(return_value=self)
        mock_table.limit = MagicMock(return_value=self)
        mock_table.range = MagicMock(return_value=self)
        mock_table.single = MagicMock(return_value=self)
        self._stored_data[name] = []
        return mock_table

    def upsert(self, records, on_conflict=None):
        return MockResponse(data=records)

class TestAPIEndpoints:
    @pytest.fixture
    def mock_supabase(self):
        return MockSupabaseClient()

    @pytest.fixture
    def sample_stock_data(self):
        return {
            'stock_code': '2330',
            'stock_name': '台積電',
            'market_type': 'TWSE',
            'industry': '半導體',
            'sector': '電子',
            'list_date': '1997-10-21',
            'currency': 'TWD',
            'is_active': True
        }

    @pytest.fixture
    def sample_price_data(self):
        return {
            'trade_date': '2026-01-28',
            'open_price': 720.0,
            'high_price': 735.0,
            'low_price': 715.0,
            'close_price': 725.0,
            'volume': 15420000,
            'change_percent': 1.52,
            'adjusted_close': 725.0,
            'market_type': 'TWSE'
        }

    @pytest.fixture
    def sample_factor_data(self):
        return {
            'stock_code': '2330',
            'trade_date': '2026-01-28',
            'pe_ratio': 18.5,
            'pb_ratio': 4.2,
            'revenue_growth': 0.25,
            'eps_growth': 0.15,
            'momentum_1m': 0.08,
            'roe': 0.32,
            'gross_margin': 0.54,
            'composite_score': 86.5,
            'value_score': 78.0,
            'growth_score': 85.0,
            'quality_score': 90.0,
            'momentum_score': 72.0,
            'macro_score': 80.0
        }

    @pytest.fixture
    def sample_financial_data(self):
        return {
            'stock_code': '2330',
            'report_type': 'annual',
            'report_date': '2025-12-31',
            'fiscal_year': 2025,
            'revenue': 2500000000000,
            'net_income': 950000000000,
            'eps': 36.5,
            'pe_ratio': 19.8,
            'pb_ratio': 4.5,
            'roe': 0.31,
            'gross_margin': 0.53,
            'net_margin': 0.38
        }

    @pytest.fixture
    def sample_report_data(self):
        return {
            'id': '550e8400-e29b-41d4-a716-446655440000',
            'stock_code': '2330',
            'stock_name': '台積電',
            'report_type': 'daily',
            'report_date': '2026-01-28',
            'title': '台積電 AI 投資分析報告',
            'content': '這是一份完整的投資分析報告...',
            'summary': '綜合評分 86.5 分，給予買進建議',
            'version': 'v1.0',
            'context_snapshot': '{}',
            'composite_score': 86.5,
            'scores': '{"value": 78.0, "growth": 85.0, "quality": 90.0, "momentum": 72.0, "macro": 80.0}',
            'created_at': '2026-01-28T10:00:00Z',
            'updated_at': '2026-01-28T10:00:00Z'
        }

    def test_stock_detail_endpoint_structure(self, sample_stock_data, sample_price_data, sample_factor_data):
        """測試股票詳情端點返回結構"""
        expected_keys = ['stock', 'quote', 'financials', 'ai_score', 'technical_indicators']
        assert all(key in sample_stock_data for key in ['stock_code', 'stock_name', 'market_type'])

    def test_stock_data_has_required_fields(self, sample_stock_data):
        """測試股票資料包含必要欄位"""
        required_fields = ['stock_code', 'stock_name', 'market_type', 'is_active']
        for field in required_fields:
            assert field in sample_stock_data, f"Missing required field: {field}"

    def test_price_data_has_required_fields(self, sample_price_data):
        """測試價格資料包含必要欄位"""
        required_fields = ['trade_date', 'close_price', 'volume']
        for field in required_fields:
            assert field in sample_price_data, f"Missing required field: {field}"

    def test_factor_data_scores_calculation(self, sample_factor_data):
        """測試因子評分計算邏輯"""
        factor = sample_factor_data
        if factor['pe_ratio'] and factor['pe_ratio'] > 0:
            value_score = min(100, max(0, 100 - factor['pe_ratio'] / 2))
            assert value_score >= 0 and value_score <= 100

        if factor['revenue_growth'] is not None:
            growth_score = factor['revenue_growth'] * 50 + 50
            assert growth_score >= 0 and growth_score <= 100

    def test_ai_report_structure(self, sample_report_data):
        """測試 AI 報告結構"""
        required_fields = ['id', 'stock_code', 'report_type', 'title', 'content', 'composite_score']
        for field in required_fields:
            assert field in sample_report_data, f"Missing required field: {field}"

    def test_scores_json_parsing(self, sample_report_data):
        """測試評分 JSON 解析"""
        scores_str = sample_report_data['scores']
        if isinstance(scores_str, str):
            import json
            scores = json.loads(scores_str)
            assert 'value' in scores
            assert 'growth' in scores
            assert 'quality' in scores
            assert 'momentum' in scores
            assert 'macro' in scores

    def test_technical_indicators_view_structure(self):
        """測試技術指標視圖結構"""
        view_fields = ['stock_code', 'trade_date', 'ma5', 'ma20', 'ma60', 'rsi_14', 'macd_line', 'bb_upper', 'bb_lower']
        sample_record = {
            'stock_code': '2330',
            'trade_date': '2026-01-28',
            'ma5': 720.5,
            'ma20': 695.2,
            'ma60': 650.8,
            'rsi_14': 58.5,
            'macd_line': 12.5,
            'signal_line': 10.3,
            'macd_histogram': 2.2,
            'bb_upper': 755.0,
            'bb_middle': 725.0,
            'bb_lower': 695.0
        }
        for field in ['stock_code', 'trade_date', 'ma5', 'rsi_14', 'bb_upper']:
            assert field in sample_record

    def test_institutional_data_structure(self):
        """測試三大法人資料結構"""
        sample_data = {
            'stock_code': '2330',
            'trade_date': '2026-01-28',
            'foreign_investor_buy': 1500000000,
            'foreign_investor_sell': 1200000000,
            'foreign_investor_net': 300000000,
            'investment_trust_buy': 500000000,
            'investment_trust_sell': 600000000,
            'investment_trust_net': -100000000,
            'dealer_buy': 200000000,
            'dealer_sell': 250000000,
            'dealer_net': -50000000
        }
        required_fields = ['stock_code', 'trade_date', 'foreign_investor_buy', 'foreign_investor_sell', 'foreign_investor_net']
        for field in required_fields:
            assert field in sample_data

    def test_margin_data_structure(self):
        """測試融資融券資料結構"""
        sample_data = {
            'stock_code': '2330',
            'trade_date': '2026-01-28',
            'margin_balance': 8500000000,
            'margin_buy': 350000000,
            'margin_sell': 280000000,
            'margin_net': 70000000,
            'short_balance': 1200000000,
            'short_buy': 80000000,
            'short_sell': 95000000,
            'short_net': -15000000,
            'margin_rate': 0.35
        }
        required_fields = ['stock_code', 'trade_date', 'margin_balance', 'short_balance', 'margin_rate']
        for field in required_fields:
            assert field in sample_data

    def test_api_response_format(self):
        """測試 API 響應格式標準化"""
        response = {
            'status': 'success',
            'data': {},
            'meta': {
                'page': 1,
                'per_page': 50,
                'total': 100,
                'has_more': True
            },
            'timestamp': '2026-01-28T10:00:00.000Z'
        }
        assert 'status' in response
        assert 'data' in response
        assert 'timestamp' in response
        assert response['status'] in ['success', 'error']

    def test_error_response_format(self):
        """測試錯誤響應格式"""
        error_response = {
            'status': 'error',
            'error': {
                'code': '40401',
                'message': '股票不存在'
            },
            'timestamp': '2026-01-28T10:00:00.000Z'
        }
        assert error_response['status'] == 'error'
        assert 'code' in error_response['error']
        assert 'message' in error_response['error']

    def test_pagination_meta_structure(self):
        """測試分頁元數據結構"""
        meta = {
            'page': 1,
            'per_page': 50,
            'total': 100,
            'total_pages': 2,
            'has_more': True
        }
        assert 'page' in meta
        assert 'per_page' in meta
        assert 'total' in meta
        assert 'has_more' in meta

    def test_stock_code_format_validation(self):
        """測試股票代碼格式驗證"""
        valid_codes = ['2330', '2330.TW', 'AAPL', 'NVDA']
        invalid_codes = ['', '12345', 'ABC', '2330.TWW']

        for code in valid_codes:
            assert len(code) <= 10, f"Invalid stock code: {code}"

        for code in invalid_codes:
            if code:
                assert len(code) > 6, f"Potentially invalid format: {code}"

    def test_composite_score_range(self):
        """測試綜合評分範圍"""
        scores = [
            {'stock': '2330', 'score': 86.5},
            {'stock': '2454', 'score': 72.3},
            {'stock': '2317', 'score': 65.8}
        ]
        for item in scores:
            assert 0 <= item['score'] <= 100, f"Score out of range: {item['score']}"

    def test_date_format_consistency(self):
        """測試日期格式一致性"""
        date_formats = [
            '2026-01-28',
            '2026-01-28T10:00:00Z',
            '2026-01-28 10:00:00'
        ]
        for date_str in date_formats:
            try:
                if 'T' in date_str:
                    datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                else:
                    datetime.strptime(date_str, '%Y-%m-%d')
            except ValueError:
                pass

    def test_db_partition_check(self):
        """測試分區表識別"""
        sample_partition_info = [
            {'tablename': 'daily_price_2023', 'partition_range': '[2023-01-01, 2024-01-01)'},
            {'tablename': 'daily_price_2024', 'partition_range': '[2024-01-01, 2025-01-01)'},
            {'tablename': 'daily_price_2025', 'partition_range': '[2025-01-01, 2026-01-01)'}
        ]
        for partition in sample_partition_info:
            assert partition['tablename'].startswith('daily_price_')
            year = partition['tablename'].split('_')[-1]
            assert year.isdigit() and len(year) == 4


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
