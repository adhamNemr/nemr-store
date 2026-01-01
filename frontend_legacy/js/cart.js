const cartItems = [
{
    id: 1,
    name: "Product C",
    price: 250,
    image: "https://via.placeholder.com/80",
    size: "M",
    color: "Red",
    qty: 1,
    discount: 50,
    discountPercent: 10
},
{
    id: 2,
    name: "Product D",
    price: 150,
    image: "https://via.placeholder.com/80",
    size: "L",
    color: "Blue",
    qty: 2,
    discount: 0,
    discountPercent: 0
},
{
    id: 3,
    name: "Product E",
    price: 300,
    image: "https://via.placeholder.com/80",
    size: "S",
    color: "Black",
    qty: 1,
    discount: 30,
    discountPercent: 10
},
{
    id: 4,
    name: "Product F",
    price: 200,
    image: "https://via.placeholder.com/80",
    size: "XL",
    color: "White",
    qty: 3,
    discount: 20,
    discountPercent: 5
},
{
    id: 5,
    name: "Product G",
    price: 100,
    image: "https://via.placeholder.com/80",
    size: "M",
    color: "Yellow",
    qty: 2,
    discount: 0,
    discountPercent: 0
}
];

// const savedCart = localStorage.getItem("cartItems");
// if (savedCart) {
//     const parsed = JSON.parse(savedCart);
//     cartItems.length = 0;
//     cartItems.push(...parsed);
// }

let fullSummaryHeight = 0;

function renderCartItems() {
    const cartContainer = document.getElementById("cart-items");
    cartContainer.innerHTML = "";

    cartItems.forEach((item) => {
    const cartItemHTML = `
        <div class="cart-item">
        <div class="product-preview">
            <img src="${item.image}" alt="${item.name}" />
        </div>
        <div class="product-details">
            <h6>${item.name}</h6>
            <p>Size: ${item.size} | Color: ${item.color}</p>
        </div>
        <div class="product-actions">
            <div class="price-line">EGP ${(item.price * item.qty).toFixed(2)}</div>
            ${item.discount && item.discount > 0 ? `
            <div class="discount">
                EGP ${(item.discount * item.qty).toFixed(2)}
                <span class="discount-badge">${item.discountPercent}% OFF</span>
            </div>
            ` : ""}
            <div class="cart-controls">
            <div class="qty-buttons">
                <button class="decrease-btn" data-id="${item.id}">-</button>
                <div class="qty-display">${item.qty}</div>
                <button class="increase-btn" data-id="${item.id}">+</button>
            </div>
            <button class="delete-btn" data-id="${item.id}">Remove</button>
            </div>
        </div>
        </div>
    `;
    cartContainer.insertAdjacentHTML("beforeend", cartItemHTML);
    });

    updateCartTotal();
    attachQuantityListeners();
    attachDeleteListeners();

    const emptyMessage = document.getElementById("empty-cart-message");
    const startShoppingBtn = document.querySelector("a.btn.btn-primary");
    if (cartItems.length === 0) {
    if (emptyMessage) emptyMessage.style.display = "block";
    if (startShoppingBtn) startShoppingBtn.style.display = "inline-block";
    } else {
    if (emptyMessage) emptyMessage.style.display = "none";
    if (startShoppingBtn) startShoppingBtn.style.display = "none";
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function updateCartTotal() {
    let totalQty = 0;
    let totalPrice = 0;
    let totalDiscount = 0;

    cartItems.forEach((item) => {
    totalQty += item.qty;
    totalPrice += item.price * item.qty;
    totalDiscount += (item.discount || 0) * item.qty;
    });

    const subtotal = totalPrice - totalDiscount;
    const formatEGP = (amount) => `EGP ${amount.toFixed(2)}`;

    const cartTotalEl = document.getElementById("cart-total");
    const summaryCountEl = document.getElementById("summary-item-count");
    const summaryTotalEl = document.getElementById("summary-item-total");
    const summaryDiscountEl = document.getElementById("summary-discount");
    const summaryExtraDiscountEl = document.getElementById("summary-extra-discount");
    const checkoutBtn = document.getElementById("checkout-btn");

    if (cartTotalEl) cartTotalEl.textContent = formatEGP(subtotal);
    if (summaryCountEl) summaryCountEl.textContent = totalQty;
    if (summaryTotalEl) summaryTotalEl.textContent = formatEGP(totalPrice);
    if (summaryDiscountEl) summaryDiscountEl.textContent = `EGP ${totalDiscount.toFixed(2)}`;
    if (summaryExtraDiscountEl) summaryExtraDiscountEl.textContent = "EGP 0.00";
    if (checkoutBtn) checkoutBtn.textContent = `Checkout (${formatEGP(subtotal)})`;
}

function attachQuantityListeners() {
    const increaseBtns = document.querySelectorAll(".increase-btn");
    const decreaseBtns = document.querySelectorAll(".decrease-btn");

    increaseBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = cartItems.find((i) => i.id === id);
        if (item) {
        item.qty++;
        renderCartItems();
        }
    });
    });

    decreaseBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
        const id = parseInt(btn.dataset.id);
        const item = cartItems.find((i) => i.id === id);
        if (item && item.qty > 1) {
        item.qty--;
        renderCartItems();
        }
    });
    });
}

function attachDeleteListeners() {
    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.dataset.id);
        const index = cartItems.findIndex((item) => item.id === id);
        if (index !== -1) {
        cartItems.splice(index, 1);
        renderCartItems();
        }
    });
    });
}

document.addEventListener("DOMContentLoaded", () => {
renderCartItems();
renderRecentlyViewed();
});

// Sticky summary scroll handler with internal scroll if needed
let summaryLeft = 0;
let summaryWidth = 0;
const navbarHeight = 70;
const marginTop = 40;
const fixedTop = navbarHeight + marginTop; // نثبت قيمة top

window.addEventListener("DOMContentLoaded", () => {
const summary = document.querySelector(".cart-summary-wrapper");
if (summary) {
    // حساب المواقع مرة واحدة فقط
    summaryLeft = summary.getBoundingClientRect().left + window.scrollX;
    summaryWidth = summary.offsetWidth;

    // ضبط top ثابت في العنصر
    summary.style.top = `${fixedTop}px`;
    fullSummaryHeight = summary.scrollHeight;
}
});

window.addEventListener("scroll", () => {
  const summary = document.querySelector(".cart-summary-wrapper");
  const placeholder = document.querySelector(".cart-summary-placeholder");
  const cartBox = document.querySelector(".cart-box-wrapper");

  if (!summary || !cartBox || !placeholder) return;

  const summaryHeight = fullSummaryHeight;
  const cartTop = cartBox.offsetTop;
  const cartBottom = cartBox.offsetTop + cartBox.offsetHeight;
  const scrollY = window.scrollY;

  const triggerPoint = cartTop - fixedTop;
  const stopPoint = cartBottom - summaryHeight - 104;
  const offsetFromTrigger = stopPoint - triggerPoint;



  if (scrollY < triggerPoint) {
    summary.classList.remove("sticky-summary-active", "sticky-summary-stopped");
    summary.style.position = "";
    summary.style.left = "";
    summary.style.width = "";
    summary.style.top = "";
    summary.style.transform = "";
    placeholder.style.height = "auto";
    placeholder.style.width = "auto";
  } else if (scrollY >= triggerPoint && scrollY <= stopPoint) {
    summary.classList.add("sticky-summary-active");
    summary.classList.remove("sticky-summary-stopped");

    summary.style.position = "fixed";
    summary.style.left = `${summaryLeft}px`;
    summary.style.width = `${summaryWidth}px`;
    summary.style.top = `${fixedTop}px`;
    summary.style.transform = "translateY(0)";
    summary.style.transition = "transform 0.3s ease-in-out";

    placeholder.style.height = `${summaryHeight}px`;
    placeholder.style.width = `${summaryWidth}px`;
  } else {
    summary.classList.remove("sticky-summary-active");
    summary.classList.add("sticky-summary-stopped");

    // ثبّت الكارد مكانه باستخدام absolute ليقف فعليًا في نهاية العمود
    summary.style.position = "absolute";
    summary.style.left = `${summaryLeft}px`;
    summary.style.width = `${summaryWidth}px`;
    summary.style.top = `${stopPoint + 100}px`;
    summary.style.transition = "box-shadow 0.4s ease-in-out, transform 0.3s ease-in-out";
    summary.style.transform = "none";

    placeholder.style.height = `${summaryHeight}px`;
    placeholder.style.width = `${summaryWidth}px`;
  }
});

document.getElementById("clear-cart")?.addEventListener("click", () => {
    cartItems.length = 0;
    renderCartItems();
});

function renderRecentlyViewed() {
    const section = document.querySelector(".recently-viewed-section");
    const recentContainer = document.getElementById("recently-viewed");
    if (!section || !recentContainer) return;

    // إزالة الهيدر السابق إن وجد
    const existingHeader = section.querySelector(".section-header");
    if (existingHeader) existingHeader.remove();

    // إنشاء الهيدر الجديد
    const header = document.createElement("div");
    header.className = "section-header d-flex justify-content-between align-items-center mb-3";
    header.innerHTML = `
    <h4 class="m-0">Recently Viewed</h4>
    <a href="#" class="text-primary small fw-semibold" id="see-all-recent">See All</a>
    `;
    section.insertBefore(header, recentContainer);

    // استخدم فقط آخر 4 عناصر مختلفة تم عرضها في cartItems
    const recentSet = new Map();
    for (let i = cartItems.length - 1; i >= 0; i--) {
    if (!recentSet.has(cartItems[i].id)) {
        recentSet.set(cartItems[i].id, cartItems[i]);
    }
    if (recentSet.size === 4) break;
    }

    const recentItems = Array.from(recentSet.values());
    recentContainer.innerHTML = "";

    recentItems.forEach((item) => {
    const itemHTML = `
        <div class="col">
        <div class="card h-100">
            <img src="${item.image}" class="card-img-top" alt="${item.name}" />
            <div class="card-body">
            <h6 class="card-title">${item.name}</h6>
            <p class="card-text text-muted">Size: ${item.size} | Color: ${item.color}</p>
            <div class="fw-bold">EGP ${item.price.toFixed(2)}</div>
            </div>
        </div>
        </div>
    `;
    recentContainer.insertAdjacentHTML("beforeend", itemHTML);
    });
}