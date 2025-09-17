import { Vector3 } from "three";

export function getCircularOrbitPosition(
	time,
	orbitalRadius,
	orbitalSpeed,
	target = null
) {
	const x = Math.sin(time * orbitalSpeed) * orbitalRadius;
	const z = Math.cos(time * orbitalSpeed) * orbitalRadius;
	if (target) {
		target.set(x, 0, z);
		return target;
	}
	return new Vector3(x, 0, z);
}

export function easeInOutCubic(t) {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
