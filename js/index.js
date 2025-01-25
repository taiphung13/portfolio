var swiper = new Swiper('.multiple-slide-carousel', {
	loop: true,
	slidesPerView: 1.4,
	spaceBetween: 16,
	navigation: {
		nextEl: '.multiple-slide-carousel .swiper-button-next',
		prevEl: '.multiple-slide-carousel .swiper-button-prev'
	},
	breakpoints: {
		1920: {
			spaceBetween: 30
		},
		1028: {
			spaceBetween: 30
		},
		990: {
			spaceBetween: 0
		}
	}
});
