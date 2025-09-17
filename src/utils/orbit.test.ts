import { describe, it, expect } from "vitest";
import { getCircularOrbitPosition, easeInOutCubic } from "./orbit";

describe("orbit helpers", () => {
	it("getCircularOrbitPosition returns correct Vector3 on axes", () => {
		const r = 10;
		const s = 1;
		const p0 = getCircularOrbitPosition(0, r, s);
		expect(p0.x).toBeCloseTo(0);
		expect(p0.z).toBeCloseTo(10);

		const pQuarter = getCircularOrbitPosition(Math.PI / 2, r, s);
		expect(pQuarter.x).toBeCloseTo(10, 4);
		expect(pQuarter.z).toBeCloseTo(0, 4);
	});

	it("easeInOutCubic is symmetric and within [0,1]", () => {
		expect(easeInOutCubic(0)).toBeCloseTo(0);
		expect(easeInOutCubic(1)).toBeCloseTo(1);
		const mid = easeInOutCubic(0.5);
		expect(mid).toBeGreaterThan(0.49);
		expect(mid).toBeLessThan(0.51);
	});
});
