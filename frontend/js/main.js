document.addEventListener("DOMContentLoaded", () => {
  const topBar = document.querySelector(".Top-Bar");
  const navbar = document.querySelector(".custom-navbar");

  if (!topBar || !navbar) return;

  const topBarHeight = topBar.offsetHeight;
  const stickyOffset = 70;
  let ticking = false;

  const updateNavbarPosition = () => {
    const isSticky = window.scrollY > topBarHeight;
    navbar.classList.toggle("sticky-active", isSticky);
    document.body.style.paddingTop = isSticky ? `${stickyOffset}px` : "0";
    ticking = false;
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateNavbarPosition);
      ticking = true;
    }
  };

  window.addEventListener("scroll", onScroll);
});