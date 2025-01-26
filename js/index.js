var swiper = new Swiper('.multiple-slide-carousel', {
	loop: true,
	slidesPerView: 1.4,
	spaceBetween: 16,
	navigation: {
		nextEl: '.multiple-slide-carousel .swiper-button-next',
		prevEl: '.multiple-slide-carousel .swiper-button-prev'
	},
	breakpoints: {
		768: {
			slidesPerView: (function () {
				const containerWidth = document.querySelector(
					'.multiple-slide-carousel'
				).clientWidth;
				return Math.floor(containerWidth / 277);
			})()
		}
	}
});

document.addEventListener('DOMContentLoaded', function () {
	document.body.style.visibility = 'visible';
});
