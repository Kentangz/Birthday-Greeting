import { useRef, useState } from "react";
import { Vector3 } from "three";
import { easeInOutCubic } from "../utils/orbit";

export function useFocusCamera({
	camera,
	animationDuration = 2.5,
	offsetMultiplier = 7,
}) {
	const [isAnimating, setAnimating] = useState(false);
	const [startTime, setStartTime] = useState(0);
	const startCameraPos = useRef(new Vector3());
	const startCameraTarget = useRef(new Vector3());

	const tempVec1 = useRef(new Vector3());
	const tempVec2 = useRef(new Vector3());
	const tempVec3 = useRef(new Vector3());

	const getCurrentCameraTarget = () => {
		const direction = tempVec1.current;
		camera.getWorldDirection(direction);
		direction.multiplyScalar(camera.position.length());
		return camera.position.clone().add(direction);
	};

	function beginAnimation() {
		setAnimating(true);
		setStartTime(performance.now() / 1000);
		startCameraPos.current.copy(camera.position);
		startCameraTarget.current.copy(getCurrentCameraTarget());
	}

	function animateTo({ currentBodyPos, bodySize, currentTime }) {
		const elapsed = currentTime - startTime;
		const progress = Math.min(elapsed / animationDuration, 1);
		const eased = easeInOutCubic(progress);

		const offsetDistance = bodySize * offsetMultiplier;
		const targetCameraPos = tempVec2.current.set(
			currentBodyPos.x,
			currentBodyPos.y,
			currentBodyPos.z + offsetDistance
		);

		const newCameraPos = tempVec1.current.lerpVectors(
			startCameraPos.current,
			targetCameraPos,
			eased
		);

		const newTarget = tempVec3.current.lerpVectors(
			startCameraTarget.current,
			currentBodyPos,
			eased
		);

		camera.position.copy(newCameraPos);
		camera.lookAt(newTarget);

		if (progress >= 1) setAnimating(false);
	}

	function chase({ currentBodyPos, bodySize }) {
		const offsetDistance = bodySize * offsetMultiplier;
		const cameraPosition = tempVec1.current.set(
			currentBodyPos.x,
			currentBodyPos.y,
			currentBodyPos.z + offsetDistance
		);
		camera.position.copy(cameraPosition);
		camera.lookAt(currentBodyPos);
	}

	return { isAnimating, beginAnimation, animateTo, chase };
}
