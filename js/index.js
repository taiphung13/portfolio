document.addEventListener('DOMContentLoaded', function () {
	const menuButton = document.getElementById('home-menu-button');
	const menuClose = document.getElementById('home-menu-close');
	const mobileMenu = document.getElementById('home-mobile-menu');
	const backdrop = document.getElementById('home-backdrop');
	const mobileLinks = document.querySelectorAll('.home-mobile-links a');
	const designTriggers = document.querySelectorAll('[data-design-trigger]');
	const designOptionLinks = Array.from(document.querySelectorAll('[data-design-option]'));
	const mobileDesignToggle = document.getElementById('home-mobile-design-toggle');
	const mobileDesignGroup = document.getElementById('home-mobile-design-group');

	function normalizePath(pathname) {
		if (!pathname) return '/';
		const normalized = pathname.replace(/\/+$/, '') || '/';
		return normalized === '/index.html' ? '/' : normalized;
	}

	function setMobileDesignOpen(isOpen) {
		if (!mobileDesignGroup || !mobileDesignToggle) return;
		mobileDesignGroup.classList.toggle('is-open', isOpen);
		mobileDesignToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
	}

	const currentPath = normalizePath(window.location.pathname);
	const currentHash = window.location.hash || '';

	const parsedDesignOptions = designOptionLinks
		.map(function (link) {
			const href = link.getAttribute('href');
			if (!href || href.startsWith('#')) return null;
			try {
				const url = new URL(href, window.location.origin);
				return {
					link: link,
					path: normalizePath(url.pathname),
					hash: url.hash || ''
				};
			} catch (error) {
				return null;
			}
		})
		.filter(Boolean);

	const matchingPathOptions = parsedDesignOptions.filter(function (item) {
		return item.path === currentPath;
	});

	const isOnDesignOptionPage = matchingPathOptions.length > 0;
	let hasSpecificMatch = false;

	matchingPathOptions.forEach(function (item) {
		if (currentHash && item.hash && item.hash === currentHash) {
			item.link.classList.add('is-active');
			hasSpecificMatch = true;
		}
	});

	if (!hasSpecificMatch && matchingPathOptions.length === 1) {
		matchingPathOptions[0].link.classList.add('is-active');
	}

	if (isOnDesignOptionPage) {
		designTriggers.forEach(function (trigger) {
			trigger.classList.add('home-nav-link-active');
		});
	}

	function openMenu() {
		if (!mobileMenu || !backdrop || !menuButton) return;
		mobileMenu.classList.add('is-open');
		backdrop.classList.add('is-open');
		mobileMenu.setAttribute('aria-hidden', 'false');
		menuButton.setAttribute('aria-expanded', 'true');
		document.body.style.overflow = 'hidden';
	}

	function closeMenu() {
		if (!mobileMenu || !backdrop || !menuButton) return;
		mobileMenu.classList.remove('is-open');
		backdrop.classList.remove('is-open');
		mobileMenu.setAttribute('aria-hidden', 'true');
		menuButton.setAttribute('aria-expanded', 'false');
		document.body.style.overflow = '';
	}

	if (menuButton) {
		menuButton.addEventListener('click', openMenu);
	}

	if (menuClose) {
		menuClose.addEventListener('click', closeMenu);
	}

	if (mobileDesignToggle) {
		mobileDesignToggle.addEventListener('click', function () {
			const isOpen = mobileDesignGroup ? mobileDesignGroup.classList.contains('is-open') : false;
			setMobileDesignOpen(!isOpen);
		});
	}

	if (backdrop) {
		backdrop.addEventListener('click', closeMenu);
	}

	mobileLinks.forEach(function (link) {
		link.addEventListener('click', closeMenu);
	});

	document.addEventListener('keydown', function (event) {
		if (event.key === 'Escape') {
			closeMenu();
		}
	});

	setMobileDesignOpen(isOnDesignOptionPage);

	const revealElements = document.querySelectorAll('.home-reveal');
	if (revealElements.length > 0 && 'IntersectionObserver' in window) {
		const revealObserver = new IntersectionObserver(
			function (entries, observer) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) return;
					entry.target.classList.add('is-visible');
					observer.unobserve(entry.target);
				});
			},
			{ threshold: 0.12 }
		);

		revealElements.forEach(function (element, index) {
			element.style.transitionDelay = index * 0.05 + 's';
			revealObserver.observe(element);
		});
	} else {
		revealElements.forEach(function (element) {
			element.classList.add('is-visible');
		});
	}

	document.querySelectorAll('.wip-link, a[href="#"]').forEach(function (link) {
		link.addEventListener('click', function (event) {
			event.preventDefault();
			const toast = document.createElement('div');
			toast.textContent = 'This project is still being worked on.';
			Object.assign(toast.style, {
				position: 'fixed',
				top: '16px',
				right: '16px',
				zIndex: '1000',
				padding: '12px 16px',
				borderRadius: '10px',
				background: '#1f1f1f',
				color: '#ffffff',
				fontSize: '13px',
				fontFamily: 'IBM Plex Sans, sans-serif',
				opacity: '0',
				transform: 'translateY(-6px)',
				transition: 'opacity 0.2s ease, transform 0.2s ease'
			});
			document.body.appendChild(toast);
			requestAnimationFrame(function () {
				toast.style.opacity = '1';
				toast.style.transform = 'translateY(0)';
			});

			setTimeout(function () {
				toast.style.opacity = '0';
				toast.style.transform = 'translateY(-6px)';
				setTimeout(function () {
					toast.remove();
				}, 220);
			}, 2200);
		});
	});
});
