import { useEffect } from "react";

export function useAutoTour({
	enabled,
	isAnimating,
	selectedIndex,
	itemsLength,
	onStep,
	intervalMs = 4000,
}) {
	useEffect(() => {
		if (!enabled) return;
		const id = setInterval(() => {
			if (isAnimating) return;
			const nextIndex =
				selectedIndex === null ? 0 : (selectedIndex + 1) % itemsLength;
			onStep(nextIndex);
		}, intervalMs);
		return () => clearInterval(id);
	}, [enabled, isAnimating, selectedIndex, itemsLength, intervalMs, onStep]);
}
