document.addEventListener('DOMContentLoaded', function () {
	const menuButton = document.getElementById('home-menu-button');
	const menuClose = document.getElementById('home-menu-close');
	const mobileMenu = document.getElementById('home-mobile-menu');
	const backdrop = document.getElementById('home-backdrop');
	const mobileLinks = document.querySelectorAll('.home-mobile-links a');

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
