document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token && !window.location.pathname.endsWith("login.html")) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    // تحقق من أن البيانات تحتوي على معلومات مستخدم صحيحة
    if (!data || !data.username || !data.email) {
      localStorage.removeItem("token");
      if (!window.location.pathname.endsWith("login.html")) {
        window.location.href = "login.html";
      }
    }
  } catch (err) {
    localStorage.removeItem("token");
    if (!window.location.pathname.endsWith("login.html")) {
      window.location.href = "login.html";
    }
  }

  const storedName = localStorage.getItem("firstName");
  if (storedName) {
    const nameSpan = document.getElementById("user-first-name");
    if (nameSpan) nameSpan.textContent = storedName;
  }
});

const emailInput = document.querySelector(".login-input");
const signInBtn = document.querySelector(".login-btn");
const passwordSection = document.getElementById("password-section");
const signupSection = document.getElementById("signup-section");

// تحقق من وجود المستخدم
signInBtn.addEventListener("click", async () => {
  const value = emailInput.value.trim();
  if (!value) return;

  try {
    const res = await fetch("http://localhost:3000/api/auth/check-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value }),
    });

    const data = await res.json();
    console.log("Login response data:", data);

    if (data.exists) {
      passwordSection.style.display = "block";
      signupSection.style.display = "none";
    } else {
      signupSection.style.display = "block";
      passwordSection.style.display = "none";
    }

    signInBtn.style.display = "none";
  } catch (err) {
    console.error("Error checking user:", err);
    alert("Something went wrong. Please try again.");
  }
});

const loginWithPassword = async () => {
  const password = document.querySelector("#password-section input").value;

  try {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailInput.value.trim(), password }),
    });

    const data = await res.json();

    if (data.token) {
      if (data.user?.username) {
        const firstName = data.user.username.split(" ")[0];
        localStorage.setItem("firstName", firstName);
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("userLoggedIn", "true");
      window.location.href = "index.html"; 
    } else {
      alert(data.error || "Login failed");
    }
  } catch (err) {
    console.error("Login error:", err);
  }
};

document.querySelector("#password-section button").addEventListener("click", loginWithPassword);

// إنشاء مستخدم جديد
const registerNewUser = async () => {
  const inputs = document.querySelectorAll("#signup-section input");
  const [firstName, lastName, password, confirmPassword] = [...inputs].map(i => i.value.trim());

  if (password !== confirmPassword) {
    alert("Passwords do not match");
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: `${firstName} ${lastName}`,
        email: emailInput.value.trim(),
        password
      })
    });

    const data = await res.json();

    if (data.user) {
      alert("Account created successfully. Please log in.");
      window.location.reload();
    } else {
      alert(data.error || "Something went wrong.");
    }
  } catch (err) {
    console.error("Registration error:", err);
  }
};

document.querySelector("#signup-section button").addEventListener("click", registerNewUser);