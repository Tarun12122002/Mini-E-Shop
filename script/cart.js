const cartlistContainer = document.querySelector(".cartlist");
let cartlist = JSON.parse(localStorage.getItem("cartlist")) || [];
const toast = document.createElement("div");
toast.classList.add("toast");
document.body.appendChild(toast);

function saveCart() {
  localStorage.setItem("cartlist", JSON.stringify(cartlist));
}
function showToast(msg) {
  toast.textContent = msg;
  toast.style.display = "block";
  setTimeout(() => {
    toast.style.display = "none";
  }, 2000);
}

function renderCart() {
  cartlistContainer.innerHTML = "";
  cartlist.forEach((item, index) => {
    const citems = document.createElement("div");
    citems.classList.add("citems");
    citems.innerHTML = `
      <div class="sub1">
        <img src="${item.image}" alt="${item.name}">
        <h2>${item.name}</h2>   
      </div>    
      <div class="sub2">
        <div class="quantity-control">
          <h1 class="decrease">-</h1>
          <button class="update">${item.quantity}</button>
          <p class="increase">+</p>
          <h1 class="remove">REMOVE</h1>
        </div>
        <span>Total: ₹${item.price * item.quantity}</span>
      </div>
    `;
    cartlistContainer.appendChild(citems);

    citems.querySelector(".decrease").addEventListener("click", () => {
      if (item.quantity > 1) item.quantity -= 1;
      else cartlist.splice(index, 1);
      saveCart();
      renderCart();
      showToast(`${item.name} updated!`);
    });
    citems.querySelector(".increase").addEventListener("click", () => {
      item.quantity += 1;
      saveCart();
      renderCart();
      showToast(`${item.name} updated!`);
    });
    citems.querySelector(".remove").addEventListener("click", () => {
      cartlist.splice(index, 1);
      saveCart();
      renderCart();
      showToast(`${item.name} removed!`);
    });
  });

  const totalAmnt = cartlist.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalcart = cartlist.reduce((sum, item) => sum + item.quantity, 0);
  const totalEl = document.querySelector(".totalamnt h3");
  if (totalEl) totalEl.textContent = `Price (${totalcart} items) - ₹${totalAmnt}`;
  const totalFinalEl = document.querySelector(".totalamnt h1");
  if (totalFinalEl) totalFinalEl.textContent = `Total Amount ₹${totalAmnt}`;
}
renderCart();
const channel = new BroadcastChannel("cart_channel");
channel.onmessage = (event) => {
  if (event.data.type === "cartUpdated") {
    cartlist = JSON.parse(localStorage.getItem("cartlist")) || [];
    renderCart();
  }
};

document.querySelector(".placeorder button").addEventListener("click", () => {
  if (cartlist.length === 0) {
    showToast("Cart is empty! Redirecting to Home Page");
    setTimeout(() => {
      window.open("./index.html", "_self"); 
    }, 2000); 
    return;
  }
  showToast("Order placed successfully!");
  setTimeout(() => {
    window.open("./cart.html", "_self");  
  }, 1000); 
  localStorage.removeItem("cartlist");
  renderCart();
});
