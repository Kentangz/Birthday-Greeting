import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoTour } from "./useAutoTour";

describe("useAutoTour", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});
	afterEach(() => {
		vi.useRealTimers();
	});

	it("calls onStep periodically when enabled", () => {
		const onStep = vi.fn();
		const { rerender } = renderHook(
			({ idx }) =>
				useAutoTour({
					enabled: true,
					isAnimating: false,
					selectedIndex: idx,
					itemsLength: 3,
					onStep,
					intervalMs: 1000,
				}),
			{ initialProps: { idx: null as number | null } }
		);

		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(onStep).toHaveBeenCalledWith(0);

		rerender({ idx: 0 });
		act(() => {
			vi.advanceTimersByTime(1000);
		});
		expect(onStep).toHaveBeenCalledWith(1);
	});

	it("does not call onStep while animating", () => {
		const onStep = vi.fn();
		renderHook(() =>
			useAutoTour({
				enabled: true,
				isAnimating: true,
				selectedIndex: 0,
				itemsLength: 3,
				onStep,
				intervalMs: 1000,
			})
		);
		act(() => {
			vi.advanceTimersByTime(2000);
		});
		expect(onStep).not.toHaveBeenCalled();
	});
});
