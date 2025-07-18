document.addEventListener("DOMContentLoaded", () => {
  // Sticky Navbar
  const topBar = document.querySelector(".Top-Bar");
  const navbar = document.querySelector(".custom-navbar");
  if (topBar && navbar) {
    const topBarHeight = topBar.offsetHeight;
    const stickyOffset = 70;
    let ticking = false;

    const updateNavbarPosition = () => {
      const isSticky = window.scrollY > topBarHeight;
      navbar.classList.toggle("sticky-active", isSticky);
      document.body.style.paddingTop = isSticky ? `${stickyOffset}px` : "0";
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(updateNavbarPosition);
        ticking = true;
      }
    });
  }

  // Account Dropdown
  const accountDropdown = document.querySelector(".account-dropdown");
  const dropdownMenu = document.querySelector(".dropdown-menu-custom");
  if (accountDropdown && dropdownMenu) {
    let isDropdownOpen = false;

    const openDropdown = () => {
      dropdownMenu.style.display = "block";
      setTimeout(() => {
        dropdownMenu.style.opacity = "1";
        dropdownMenu.style.transform = "translateY(0)";
        dropdownMenu.style.pointerEvents = "auto";
      }, 20);
      isDropdownOpen = true;
    };

    const closeDropdown = () => {
      dropdownMenu.style.opacity = "0";
      dropdownMenu.style.transform = "translateY(-10px)";
      dropdownMenu.style.pointerEvents = "none";
      setTimeout(() => {
        dropdownMenu.style.display = "none";
      }, 150);
      isDropdownOpen = false;
    };

    accountDropdown.addEventListener("mouseenter", openDropdown);
    accountDropdown.addEventListener("mouseleave", () => {
      if (!isDropdownOpen) closeDropdown();
    });

    accountDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      isDropdownOpen ? closeDropdown() : openDropdown();
    });

    document.addEventListener("click", (e) => {
      if (isDropdownOpen && !accountDropdown.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // Toggle account icon and sign in button based on login state
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  if (isLoggedIn) {
    fetch("http://localhost:3000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user && data.user.username) {
          const firstName = data.user.username.split(" ")[0];
          const nameSpan = document.getElementById("user-first-name");
          if (nameSpan) nameSpan.textContent = firstName;
        }
      })
      .catch((err) => {
        console.error("Error fetching user name:", err);
      });
  }

  const accountWrapper = document.querySelector(".account-dropdown");
  const signInButton = document.querySelector(".nav-signin-btn") || document.querySelector("#sign-in-button");

  if (isLoggedIn) {
    if (accountWrapper) {
      accountWrapper.style.display = "flex";
    }
    if (signInButton) {
      signInButton.style.display = "none";
      signInButton.remove(); // remove from DOM to prevent layout conflicts
    }
  } else {
    if (accountWrapper) {
      accountWrapper.style.display = "none";
    }
    if (!signInButton) {
      const navIcons = document.querySelector(".nav-icons");
      if (navIcons) {
        const btn = document.createElement("a");
        btn.href = "login.html";
        btn.id = "sign-in-button";
        btn.className = "nav-signin-btn";
        btn.textContent = "Sign In";
        navIcons.insertBefore(btn, navIcons.firstChild);
      }
    } else {
      signInButton.style.display = "inline-flex";
      // Ensure correct class for styling and animation
      if (!signInButton.classList.contains("nav-signin-btn")) {
        signInButton.classList.add("nav-signin-btn");
      }
    }
  }
});

document.getElementById("logout-btn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userLoggedIn");
  window.location.reload();
});