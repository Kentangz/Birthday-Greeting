// Centralized tunables with env overrides

const env = (key, fallback) => {
	const v = import.meta.env?.[key];
	if (v === undefined || v === null || v === "") return fallback;
	if (v === "true") return true;
	if (v === "false") return false;
	const num = Number(v);
	return Number.isNaN(num) ? v : num;
};

export const CAMERA_OFFSET_MULTIPLIER = env("VITE_CAMERA_OFFSET_MULTIPLIER", 7);
export const ANIMATION_DURATION = env("VITE_ANIMATION_DURATION", 2.5);

export const AMBIENT_LIGHT_INTENSITY = env("VITE_AMBIENT_LIGHT_INTENSITY", 0.1);
export const SUN_LIGHT_INTENSITY = env("VITE_SUN_LIGHT_INTENSITY", 80);
export const SUN_WARM_LIGHT_INTENSITY = env(
	"VITE_SUN_WARM_LIGHT_INTENSITY",
	40
);
export const SUN_EMISSIVE_INTENSITY = env("VITE_SUN_EMISSIVE_INTENSITY", 1.2);

// Postprocessing (example for GodRays)
export const GODRAYS_WEIGHT = env(
	"VITE_GODRAYS_WEIGHT",
	import.meta.env.MODE === "production" ? 0.12 : 0.14
);
export const GODRAYS_EXPOSURE = env(
	"VITE_GODRAYS_EXPOSURE",
	import.meta.env.MODE === "production" ? 0.24 : 0.28
);

// Env toggles
export const SHOW_GIZMOS = env(
	"VITE_SHOW_GIZMOS",
	import.meta.env.MODE !== "production"
);
export const ENABLE_STATS = env("VITE_ENABLE_STATS", false);
