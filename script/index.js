const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const welcomeSpan = document.getElementById("welcome");

loginBtn.addEventListener("click", () => {
      window.location.href = "login.html";
})

logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("loggedInUser");
      updateUI();
});

function updateUI() {
      const username = localStorage.getItem("loggedInUser");
      if (username) {
        welcomeSpan.textContent = `Welcome, ${username}`;
        welcomeSpan.style.display = "inline";
        logoutBtn.style.display = "inline-block";
        loginBtn.style.display = "none";
      } else {
        welcomeSpan.style.display = "none";
        logoutBtn.style.display = "none";
        loginBtn.style.display = "inline-block";
      }
}

window.onload = () => {
      updateUI();
};
const productContainer = document.getElementById("product-list");
const cartLink = document.querySelector(".cart-link");
const channel = new BroadcastChannel("cart_channel");

const toast = document.createElement("div");
toast.classList.add("toast");
document.body.appendChild(toast);

function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => { toast.style.display = "none"; }, 2000);
}

function updateCartCount() {
  const cartlist = JSON.parse(localStorage.getItem("cartlist")) || [];
  const totalItems = cartlist.reduce((sum, item) => sum + item.quantity, 0);
  if (cartLink) {
    cartLink.innerHTML = `<i class="fa-solid fa-cart-shopping"></i>(${totalItems})`;
  }
}
updateCartCount();

async function fetchProducts() {
  try {
    const response = await fetch("https://fakestoreapi.com/products");
    const products = await response.json();
    renderProducts(products);
    setupFilters(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function renderProducts(products) {
  productContainer.innerHTML = "";
  products.forEach((p) => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}" class="product-img">
      <h3 class="product-name">${p.title}</h3>
      <p class="product-price">₹${(p.price * 85).toFixed(0)}</p>
      <button class="add-to-cart-btn" data-name="${p.title}" data-price="${(p.price * 85).toFixed(0)}" data-image="${p.image}">Add to Cart</button>
    `;
    productContainer.appendChild(card);

    const addBtn = card.querySelector(".add-to-cart-btn");
    addBtn.addEventListener("click", () => {
      let cartlist = JSON.parse(localStorage.getItem("cartlist")) || [];
      const existing = cartlist.find(item => item.name === p.title);

      if (existing) {
        existing.quantity += 1;
      } else {
        cartlist.push({
          name: p.title,
          price: Number((p.price * 85).toFixed(0)),
          quantity: 1,
          image: p.image
        });
      }
      localStorage.setItem("cartlist", JSON.stringify(cartlist));
      channel.postMessage({ type: "cartUpdated" });
      updateCartCount();
      showToast(`${p.title} added to cart!`);
    });
  });
}

function setupFilters(allProducts) {
  const searchBox = document.getElementById("search-bar");
  function applyFilters() {
    let filtered = [...allProducts];
    const searchText = searchBox.value.toLowerCase();
    filtered = filtered.filter(p => p.title.toLowerCase().includes(searchText));
    renderProducts(filtered);
  }
  searchBox.addEventListener("input", applyFilters);
}

channel.onmessage = (event) => {
  if (event.data.type === "cartUpdated") {
    updateCartCount();
  }
};
fetchProducts();

