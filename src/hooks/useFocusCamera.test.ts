import { describe, it, expect } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import { renderHook, act } from "@testing-library/react";
import { useFocusCamera } from "./useFocusCamera";

function makeCamera() {
	const cam = new PerspectiveCamera(45, 1, 0.1, 1000);
	cam.position.set(0, 0, 10);
	cam.lookAt(0, 0, 0);
	return cam;
}

describe("useFocusCamera", () => {
	it("moves camera towards target with easing", () => {
		const camera = makeCamera();
		const { result } = renderHook(() =>
			useFocusCamera({ camera, animationDuration: 2, offsetMultiplier: 5 })
		);

		// start focusing
		act(() => {
			result.current.beginAnimation();
		});

		const currentBodyPos = new Vector3(10, 0, 0);
		const bodySize = 1;

		// halfway through animation
		act(() => {
			result.current.animateTo({
				currentBodyPos,
				bodySize,
				currentTime: performance.now() / 1000 + 1,
			});
		});

		// camera should be closer to target than initial z=10
		expect(camera.position.z).toBeLessThan(10);

		// at end of animation
		act(() => {
			result.current.animateTo({
				currentBodyPos,
				bodySize,
				currentTime: performance.now() / 1000 + 2,
			});
		});

		// final offset = bodySize * 5 behind target (on +z)
		expect(Math.abs(camera.position.z - 5)).toBeLessThan(0.01);
	});
});
