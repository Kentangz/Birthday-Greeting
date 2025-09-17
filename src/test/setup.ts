import "@testing-library/jest-dom/vitest";

// Polyfill ResizeObserver for @react-three/fiber (react-use-measure)
class RO {
	observe() {}
	unobserve() {}
	disconnect() {}
}
// @ts-ignore
(globalThis as any).ResizeObserver = (globalThis as any).ResizeObserver || RO;

// Mock CanvasRenderingContext to avoid WebGL requirements
if (typeof HTMLCanvasElement !== "undefined") {
	// @ts-ignore
	HTMLCanvasElement.prototype.getContext =
		HTMLCanvasElement.prototype.getContext ||
		(() => {
			return {
				canvas: {},
				drawImage: () => {},
				getImageData: () => ({ data: [] }),
				createImageData: () => ({}),
				putImageData: () => {},
				clearRect: () => {},
				fillRect: () => {},
				beginPath: () => {},
				stroke: () => {},
				closePath: () => {},
				save: () => {},
				restore: () => {},
			};
		});
}
