import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Bilingual } from '../../components/ui/Bilingual';

describe('Bilingual 雙語組件', () => {
    describe('基礎渲染', () => {
        it('TC-5001: Stacked 模式渲染中英文上下分層', () => {
            render(<Bilingual zh="市場動態" en="Market" mode="stacked" />);
            expect(screen.getByText('市場動態')).toBeInTheDocument();
            expect(screen.getByText('Market')).toBeInTheDocument();
        });

        it('TC-5002: Inline 模式渲染中英文左右同行', () => {
            render(<Bilingual zh="選單" en="Menu" mode="inline" />);
            expect(screen.getByText('選單')).toBeInTheDocument();
            expect(screen.getByText('Menu')).toBeInTheDocument();
        });

        it('TC-5003: Suffix 模式渲染括號後綴', () => {
            render(<Bilingual zh="營收" en="Revenue" mode="suffix" />);
            expect(screen.getByText(/營收/)).toBeInTheDocument();
            expect(screen.getByText(/Revenue/)).toBeInTheDocument();
        });

        it('TC-5004: 預設模式為 stacked', () => {
            const { container } = render(<Bilingual zh="測試" en="Test" />);
            // Stacked 模式使用 flex-col 容器
            expect(container.querySelector('.flex-col')).toBeInTheDocument();
        });
    });

    describe('自訂樣式', () => {
        it('TC-5005: 支援自訂 zhClassName 與 enClassName', () => {
            render(
                <Bilingual
                    zh="自訂"
                    en="Custom"
                    zhClassName="text-2xl font-bold"
                    enClassName="text-xs text-red-500"
                />
            );
            const zhEl = screen.getByText('自訂');
            expect(zhEl).toHaveClass('text-2xl', 'font-bold');
            const enEl = screen.getByText('Custom');
            expect(enEl).toHaveClass('text-xs', 'text-red-500');
        });
    });
});
