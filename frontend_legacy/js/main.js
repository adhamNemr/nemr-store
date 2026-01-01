document.addEventListener('DOMContentLoaded', () => {

  // 1. Header Scroll Effect (Transparent to Solid)
  const header = document.querySelector('.nemr-header');
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check in case of reload
    handleScroll();
  }

  // 2. Mobile Menu Toggle (To be implemented with mobile view)
  const menuTrigger = document.querySelector('.mobile-menu-trigger');
  if (menuTrigger) {
    // Add logic later
  }

  // 3. User Authentication State (Login/Logout)
  const token = localStorage.getItem('token');
  const userActions = document.querySelector('.user-actions');
  const loginIcon = userActions?.querySelector('a[href="login.html"]');
  // const logoutBtn = document.getElementById('logout-btn'); // Will need to specific place for this now

  if (token && userActions) {
    // User is logged in
    // Change profile icon to indicate active state or show dropdown
    if (loginIcon) {
      loginIcon.innerHTML = '<i class="bi bi-person-fill"></i>'; 
      loginIcon.href = 'account.html'; // Redirect to account instead of login
    }
  }

  // Logout Logic (Needs to be reachable from new design, e.g. in Account page)
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    });
  }

  // 4. Split Hero Interaction (Optional Enhancement)
  const splitPanes = document.querySelectorAll('.split-pane');
  splitPanes.forEach(pane => {
    pane.addEventListener('mouseenter', () => {
      // Logic handled via CSS flex-grow, but JS can add more complex animations here
    });
  });

});