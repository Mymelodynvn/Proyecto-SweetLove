// carousel.js — carrusel de portada (librería Swiper)
const coverSwiper = document.querySelector(".cover__swiper");

if (coverSwiper) {
    new Swiper(coverSwiper, {
        loop: true,
        grabCursor: true,
        autoplay: {
            delay: 6000,
            disableOnInteraction: false
        },
        navigation: {
            prevEl: ".cover__arrow--prev",
            nextEl: ".cover__arrow--next"
        },
        pagination: {
            el: ".cover__dots",
            clickable: true
        }
    });
}
