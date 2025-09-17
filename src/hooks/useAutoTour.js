import { useEffect, useRef } from "react";

export function useAutoTour({
	enabled,
	isAnimating,
	selectedIndex,
	itemsLength,
	onStep,
	intervalMs = 3000,
}) {
	const timeoutRef = useRef();
	const startedRef = useRef(false);

	useEffect(() => {
		if (!enabled) {
			startedRef.current = false;
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
			return;
		}

		// Clear any existing schedule
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
		}

		// If currently animating, wait until it finishes (effect will rerun)
		if (isAnimating) return;

		if (!startedRef.current) {
			// First activation: step immediately once, then wait for anim end
			const nextIndex =
				selectedIndex === null ? 0 : (selectedIndex + 1) % itemsLength;
			onStep(nextIndex);
			startedRef.current = true;
			return;
		}

		// After animation completes, schedule dwell before next step
		timeoutRef.current = setTimeout(() => {
			if (!enabled) return;
			if (isAnimating) return;
			const n = selectedIndex === null ? 0 : (selectedIndex + 1) % itemsLength;
			onStep(n);
		}, intervalMs);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [enabled, isAnimating, selectedIndex, itemsLength, intervalMs, onStep]);
}
