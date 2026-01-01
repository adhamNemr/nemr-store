document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const accountBtn = document.querySelector(".account-dropdown");
  const signInBtn = document.querySelector(".sign-in-btn");
  const inboxItem = document.querySelector(".dropdown-inbox");
  const hiUserSpan = document.querySelector(".hi-user");
  const mainContent = document.getElementById("main-content");

  if (!token) {
    mainContent.innerHTML = "<p class='text-center mt-4 text-muted'>Please log in to view your account.</p>";
    inboxItem?.remove();
    hiUserSpan?.remove();
    return;
  }

  try {
    const res = await fetch("http://localhost:3000/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    console.log("Fetched user data:", data);

    if (!data.user) {
      mainContent.innerHTML = "<p class='text-center mt-4 text-muted'>User data not found.</p>";
      return;
    }

    signInBtn?.remove();
    if (hiUserSpan) {
      hiUserSpan.textContent = `Hi, ${data.user.username}`;
      hiUserSpan.style.display = "inline";
    }
    inboxItem?.classList.remove("d-none");

    const navItems = document.querySelectorAll("[data-target]");
    const renderSection = async (target) => {
      switch (target) {
        case "profile":
          mainContent.innerHTML = `
            <h3 class="section-title">My Profile</h3>
            <div class="account-section">
              <p><strong>Name:</strong> ${data.user.username}</p>
              <p><strong>Email:</strong> ${data.user.email}</p>
              <button class="btn btn-primary mt-3">Edit Profile</button>
            </div>`;
          break;
        case "inbox":
          mainContent.innerHTML = `
            <h3 class="section-title text-primary fw-bold text-center">Inbox</h3>
            <hr class="mb-4" />
            <div class="account-section">
              <div id="chat-list" class="list-group"></div>
              <div id="chat-box" class="mt-4 d-none"></div>
            </div>
          `;
          const chatListContainer = document.getElementById("chat-list");
          const chatBox = document.getElementById("chat-box");

          try {
            const res = await fetch("http://localhost:3000/api/inbox", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const chats = await res.json();
            const inbox = chats.conversations || [];

            // تأكد من أن شات السبورت موجود دائمًا
            const supportExists = inbox.some(chat => chat.userId == 999);
            if (!supportExists) {
              inbox.push({
                userId: 999,
                latestMessage: null,
                unreadCount: 0,
                receiver: { username: "Support Team" }
              });
            }

            chatListContainer.innerHTML = "";

            inbox.sort((a, b) => {
              const aTime = a.latestMessage?.createdAt || 0;
              const bTime = b.latestMessage?.createdAt || 0;
              return new Date(bTime) - new Date(aTime);
            });

            inbox.forEach(chat => {
              const chatItem = document.createElement("a");
              chatItem.href = "#";
              chatItem.className = "chat-preview list-group-item list-group-item-action d-flex justify-content-between align-items-start";
              chatItem.dataset.chatId = chat.userId;
              chatItem.innerHTML = `
                <div class="ms-2 me-auto">
                  <div class="fw-bold">${chat.receiver?.username || (chat.userId == 999 ? "Support Team" : "Unknown User")}</div>
                  <small class="text-muted">${chat.latestMessage?.text || "Start a conversation"}</small>
                </div>
                ${chat.unreadCount > 0 ? `<span class="badge bg-primary rounded-pill">${chat.unreadCount}</span>` : ""}
              `;
              chatListContainer.appendChild(chatItem);
            });

            document.querySelectorAll(".chat-preview").forEach(chat => {
              chat.addEventListener("click", async (e) => {
                e.preventDefault();
                const chatId = parseInt(chat.dataset.chatId); // تأكد أن chatId رقم وليس نص
                const chatName = chat.querySelector(".fw-bold")?.textContent || "Chat";

                chatBox.classList.remove("d-none");
                chatListContainer.classList.add("d-none");

                chatBox.innerHTML = `
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <button class="btn btn-sm btn-outline-secondary" id="back-to-chats">
                      <i class="bi bi-arrow-left"></i> Back
                    </button>
                    <h5 class="mb-0">${chatName}</h5>
                    <div style="width: 40px;"></div>
                  </div>
                  <div class="bg-light border rounded p-3 mb-3" style="height: 300px; overflow-y: auto;">
                    <div class="d-flex flex-column gap-2" id="chat-messages"></div>
                  </div>
                  <form id="chat-form" class="d-flex">
                    <input type="text" class="form-control me-2" placeholder="Type a message..." />
                    <button class="btn btn-primary" type="submit">Send</button>
                  </form>
                `;

                const chatMessages = document.getElementById("chat-messages");
                // إضافة متغير chatScrollContainer فورًا بعد إنشاء chatMessages
                const chatScrollContainer = chatMessages.parentElement;
                chatMessages.innerHTML = "";

                try {
                  // لو الشات support، نفذ نفس طلب API لعرض الرسائل الفعلية
                  const msgRes = await fetch(`http://localhost:3000/api/inbox/${chatId === 999 ? 999 : chatId}`, {
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  const { messages } = await msgRes.json();
                  // لإظهار التاريخ أعلى الرسائل اليومية
                  let lastDate = null;
                  messages.forEach(msg => {
                    const msgDate = new Date(msg.createdAt);
                    const msgDay = msgDate.toDateString();

                    if (lastDate !== msgDay) {
                      lastDate = msgDay;

                      const today = new Date();
                      const yesterday = new Date();
                      yesterday.setDate(today.getDate() - 1);

                      let dateLabel = msgDay;

                      if (msgDay === today.toDateString()) {
                        dateLabel = "Today";
                      } else if (msgDay === yesterday.toDateString()) {
                        dateLabel = "Yesterday";
                      }

                      const dateDiv = document.createElement("div");
                      dateDiv.className = "text-center text-muted small my-2";
                      dateDiv.textContent = dateLabel;
                      chatMessages.appendChild(dateDiv);
                    }

                    const msgDiv = document.createElement("div");
                    msgDiv.className = `text-${msg.senderId === data.user.id ? "end" : "start"}`;
                    msgDiv.innerHTML = `
                      <span class="badge ${msg.senderId === data.user.id ? "bg-primary" : "bg-secondary"}">${msg.text}</span>
                      <div class="small text-muted mt-1">${msgDate.toLocaleTimeString()}</div>
                    `;
                    chatMessages.appendChild(msgDiv);
                  });
                  // مرر تلقائيًا إلى آخر رسالة بعد إضافة كل الرسائل
                  // استبدل بالسطر المطلوب
                  requestAnimationFrame(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                  });
                  // أضف تمرير للحاوية الكاملة كذلك
                  requestAnimationFrame(() => {
                    chatScrollContainer.scrollTop = chatScrollContainer.scrollHeight;
                  });
                } catch (error) {
                  console.error("Failed to fetch messages:", error);
                }

                const chatForm = document.getElementById("chat-form");
                const chatInput = chatForm.querySelector("input");

                chatForm.addEventListener("submit", async (e) => {
                  e.preventDefault();

                  const messageText = chatInput.value.trim();
                  if (!messageText) return;

                  // أضف الرسالة مباشرة إلى الشات قبل إرسال الطلب للسيرفر
                  const msgDiv = document.createElement("div");
                  msgDiv.className = "text-end";
                  msgDiv.innerHTML = `
                    <span class="badge bg-primary">${messageText}</span>
                    <div class="small text-muted mt-1">${new Date().toLocaleTimeString()}</div>
                  `;
                  chatMessages.appendChild(msgDiv);
                  requestAnimationFrame(() => {
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                  });
                  chatInput.value = "";

                  try {
                    // ارسال الرسالة للسيرفر
                    const sendRes = await fetch("http://localhost:3000/api/inbox", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({
                        receiverId: chatId,
                        text: messageText,
                      }),
                    });

                    const newMsg = await sendRes.json();

                    // تحديث معاينة آخر رسالة فورًا
                    const preview = document.querySelector(`.chat-preview[data-chat-id="${chatId}"] small`);
                    if (preview) preview.textContent = newMsg.text;
                  } catch (err) {
                    console.error("Error sending message:", err);
                  }
                });

                document.getElementById("back-to-chats")?.addEventListener("click", () => {
                  chatBox.classList.add("d-none");
                  chatListContainer.classList.remove("d-none");
                });
              });
            });

          } catch (err) {
            console.error("Failed to load chats:", err);
            chatListContainer.innerHTML = `<div class="text-danger">Failed to load inbox.</div>`;
          }
          break;
        case "wishlist":
          mainContent.innerHTML = `
            <h3 class="section-title">Wishlist</h3>
            <div class="account-section text-muted">
              <p>You haven’t saved any items yet.</p>
              <a href="index.html" class="btn btn-outline-primary mt-3">Start Shopping</a>
            </div>`;
          break;
        case "orders":
          mainContent.innerHTML = `
            <h3 class="section-title">My Orders</h3>
            <div class="account-section">
              <table class="table table-bordered">
                <thead>
                  <tr><th>Order #</th><th>Date</th><th>Status</th><th>Total</th></tr>
                </thead>
                <tbody>
                  <tr><td>1001</td><td>2025-07-01</td><td>Delivered</td><td>EGP 250.00</td></tr>
                  <tr><td>1002</td><td>2025-07-05</td><td>Processing</td><td>EGP 430.00</td></tr>
                </tbody>
              </table>
            </div>`;
          break;
        case "addresses":
          mainContent.innerHTML = `
            <h3 class="section-title">Saved Addresses</h3>
            <div class="account-section">
              <p>No addresses saved.</p>
              <button class="btn btn-secondary mt-3">Add Address</button>
            </div>`;
          break;
        case "payment":
          mainContent.innerHTML = `
            <h3 class="section-title">Payment Methods</h3>
            <div class="account-section">
              <p>No payment methods saved.</p>
              <button class="btn btn-secondary mt-3">Add Card</button>
            </div>`;
          break;
        case "security":
          mainContent.innerHTML = `
            <h3 class="section-title">Login & Security</h3>
            <div class="account-section">
              <form>
                <div class="mb-3">
                  <label>Current Password</label>
                  <input type="password" class="form-control">
                </div>
                <div class="mb-3">
                  <label>New Password</label>
                  <input type="password" class="form-control">
                </div>
                <button type="submit" class="btn btn-warning text-white">Update Password</button>
              </form>
            </div>`;
          break;
        case "help":
          mainContent.innerHTML = `
            <h3 class="section-title">Help Center</h3>
            <div class="account-section">
              <p>Need assistance? Visit our <a href="#">support page</a> or contact customer service.</p>
            </div>`;
          break;
        case "notifications":
          mainContent.innerHTML = `
            <h3 class="section-title">Notifications</h3>
            <div class="account-section">
              <p>You’re all caught up. No new notifications.</p>
            </div>`;
          break;
        case "referrals":
          mainContent.innerHTML = `
            <h3 class="section-title">Referrals</h3>
            <div class="account-section">
              <p>Invite your friends and get rewards!</p>
              <button class="btn btn-success mt-3">Copy Referral Link</button>
            </div>`;
          break;
        case "settings":
          mainContent.innerHTML = `
            <h3 class="section-title">Settings</h3>
            <div class="account-section">
              <p>Customize your account preferences.</p>
            </div>`;
          break;
        case "dashboard":
          mainContent.innerHTML = `
      <h3 class="section-title text-primary text-center fw-bold mb-4">Dashboard</h3>
      <hr class="mb-4" />
      <div class="account-section">
        <div class="row g-4 text-center">
          <div class="col-md-4">
            <div class="bg-light rounded p-4 shadow-sm h-100">
              <i class="bi bi-bag-fill fs-2 text-primary mb-2"></i>
              <h5 class="fw-semibold text-dark">Orders</h5>
              <p class="text-muted small mb-0">Total Orders: 2</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="bg-light rounded p-4 shadow-sm h-100">
              <i class="bi bi-heart-fill fs-2 text-danger mb-2"></i>
              <h5 class="fw-semibold text-dark">Wishlist</h5>
              <p class="text-muted small mb-0">Items Saved: 0</p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="bg-light rounded p-4 shadow-sm h-100">
              <i class="bi bi-envelope-fill fs-2 text-success mb-2"></i>
              <h5 class="fw-semibold text-dark">Messages</h5>
              <p class="text-muted small mb-0">Unread Messages: 0</p>
            </div>
          </div>
        </div>
      </div>`;
          break;
        default:
          mainContent.innerHTML = `<p class='text-danger'>No valid section found for: ${target}</p>`;
      }
    };

    navItems.forEach((item) => {
      item.addEventListener("click", async (e) => {
        e.preventDefault();
        navItems.forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        const target = item.getAttribute("data-target");
        if (target) {
          localStorage.setItem("active-section", target); // ✅ احفظ القسم الحالي
          await renderSection(target);
        }
      });
    });

    const savedSection = localStorage.getItem("active-section") || "dashboard";
    const defaultItem = document.querySelector(`[data-target="${savedSection}"]`) || navItems[0];
    if (defaultItem) {
      defaultItem.classList.add("active");
      const target = defaultItem.getAttribute("data-target");
      if (target) await renderSection(target);
    }
  } catch (err) {
    console.error("Error fetching current user:", err);
  }
});