export function emitFocusStatus(nameEn: string, nameId: string) {
	const event = new CustomEvent("a11y-focus-status", {
		detail: { en: `Focusing ${nameEn}`, id: `Fokus ${nameId}` },
	});
	window.dispatchEvent(event);
}
