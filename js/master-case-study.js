document.addEventListener('DOMContentLoaded', function () {
	const sectionLinks = Array.from(document.querySelectorAll('#side-nav a[data-section]'));
	const sections = sectionLinks.map(function (link) {
		return { link: link, element: document.getElementById(link.dataset.section) };
	}).filter(function (item) { return item.element; });
	let scrollSyncQueued = false;

	function syncSectionMenu() {
		scrollSyncQueued = false;
		if (!sections.length) return;
		let current = sections[0];
		const activationLine = Math.min(window.innerHeight * 0.1, 96);
		sections.forEach(function (item) {
			if (item.element.getBoundingClientRect().top <= activationLine) current = item;
		});
		if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
			current = sections[sections.length - 1];
		}
		sectionLinks.forEach(function (link) {
			const selected = link === current.link;
			link.classList.toggle('is-active', selected);
			link.classList.toggle('active', selected);
			link.classList.toggle('is-parent-active', link.dataset.section === current.link.dataset.parent);
			if (selected) link.setAttribute('aria-current', 'location');
			else link.removeAttribute('aria-current');
		});
	}

	function queueSectionSync() {
		if (scrollSyncQueued) return;
		scrollSyncQueued = true;
		window.requestAnimationFrame(syncSectionMenu);
	}
	sections.forEach(function (item) {
		item.link.addEventListener('click', function (event) {
			event.preventDefault();
			item.element.scrollIntoView({
				behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
				block: 'start'
			});
		});
	});
	window.addEventListener('scroll', queueSectionSync, { passive: true });
	window.addEventListener('resize', queueSectionSync);
	window.addEventListener('load', queueSectionSync);
	syncSectionMenu();

	const menu = document.getElementById('home-mobile-menu');
	const trigger = document.getElementById('home-menu-button');
	const close = document.getElementById('home-menu-close');
	if (!menu || !trigger || !close) return;

	const background = document.querySelectorAll('main, body > footer, .home-nav, .cs-skip-link, #side-nav');
	const previousInert = new Map();
	const desktop = window.matchMedia('(min-width: 768px)');
	let active = false;

	function focusableItems() {
		return Array.from(menu.querySelectorAll('a[href], button:not([disabled])')).filter(function (item) {
			return item.getClientRects().length > 0 && getComputedStyle(item).visibility !== 'hidden';
		});
	}

	function syncMenuFocus() {
		const open = menu.classList.contains('is-open');
		if (open === active) return;
		active = open;
		if (open) {
			menu.scrollTop = 0;
			background.forEach(function (element) {
				previousInert.set(element, element.inert);
				element.inert = true;
			});
			close.focus({ preventScroll: true });
		} else {
			previousInert.forEach(function (wasInert, element) {
				element.inert = wasInert;
			});
			previousInert.clear();
			const returnTarget = desktop.matches ? document.querySelector('[data-design-trigger]') : trigger;
			if (returnTarget) returnTarget.focus({ preventScroll: true });
		}
	}

	// Observe the shared menu controller without changing behavior on other pages.
	new MutationObserver(syncMenuFocus).observe(menu, { attributes: true, attributeFilter: ['class'] });
	document.addEventListener('keydown', function (event) {
		if (!active) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			close.click();
			return;
		}
		if (event.key !== 'Tab') return;
		const items = focusableItems();
		const first = items[0];
		const last = items[items.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}, true);
	document.addEventListener('focusin', function (event) {
		if (active && !menu.contains(event.target)) close.focus({ preventScroll: true });
	});
	desktop.addEventListener('change', function (event) {
		if (event.matches && active) close.click();
	});
	syncMenuFocus();
});
