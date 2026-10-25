// Agar CDN ochilmasa, sayt animatsiyasiz ishlayveradi
if (window.AOS) {
  AOS.init({
    duration: 600,
    easing: "ease-out-cubic",
    once: true,
    offset: 40,
    // Animatsiyani yoqtirmaydigan foydalanuvchilarga o'chiriladi
    disable: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  });
}