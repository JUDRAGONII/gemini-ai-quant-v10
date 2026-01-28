import { render, screen } from "@testing-library/react";
import { Skeleton, SkeletonCard, SkeletonTable } from "../../components/ui/Skeleton";
import "@testing-library/jest-dom";

describe("Skeleton 組件", () => {
    it("TC-1501: Skeleton 基礎組件應正確渲染", () => {
        render(<Skeleton />);
        expect(screen.getByTestId("skeleton")).toBeInTheDocument();
    });

    it("TC-1502: Skeleton 應支援不同 variant", () => {
        render(<Skeleton variant="circle" />);
        const el = screen.getByTestId("skeleton");
        expect(el).toHaveClass("rounded-full");
    });

    it("TC-1503: Skeleton 應支援自定義樣式", () => {
        render(<Skeleton style={{ height: '100px' }} />);
        expect(screen.getByTestId("skeleton")).toHaveStyle({ height: '100px' });
    });
});

describe("SkeletonCard 組件", () => {
    it("TC-1511: SkeletonCard 應正確渲染卡片載入效果", () => {
        render(<SkeletonCard />);
        expect(screen.getByTestId("skeleton-card")).toBeInTheDocument();
    });
});

describe("SkeletonTable 組件", () => {
    it("TC-1521: SkeletonTable 應正確渲染表格載入效果", () => {
        render(<SkeletonTable rows={3} cols={2} />);
        expect(screen.getByTestId("skeleton-table")).toBeInTheDocument();
    });
});
