document.addEventListener("DOMContentLoaded", () => {
    const categoriesDiv = document.getElementById("categories");
    const productsContainer = document.getElementById("productsContainer");
    const form = document.getElementById("donationForm");
  
    // Fetch categories and display them as selectable buttons
    fetch("/api/categories")
      .then(response => response.json())
      .then(categories => {
        categories.forEach(category => {
          const button = document.createElement("div");
          button.className = "category";
          button.textContent = category;
          button.dataset.category = category;
  
          button.addEventListener("click", () => {
            button.classList.toggle("selected");
  
            if (button.classList.contains("selected")) {
              fetchProducts(category);
            } else {
              removeCategoryProducts(category);
            }
          });
  
          categoriesDiv.appendChild(button);
        });
      });
  
    // Fetch products for a selected category
    function fetchProducts(category) {
      fetch(`/api/products?category=${category}`)
        .then(response => response.json())
        .then(products => {
          products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.dataset.category = category;
  
            card.innerHTML = `
              <img src="${product.image}" alt="${product.name}">
              <input type="checkbox" id="${product.name}" name="products" value="${product.name}">
              <label for="${product.name}">${product.name}</label>
            `;
  
            productsContainer.appendChild(card);
          });
        });
    }
  
    // Remove products of a deselected category
    function removeCategoryProducts(category) {
      const productCards = productsContainer.querySelectorAll(`[data-category="${category}"]`);
      productCards.forEach(card => card.remove());
    }
  
    // Handle form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.products = formData.getAll("products"); // Get selected products
  
      fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      }).then(response => {
        if (response.ok) {
          alert("Form submitted successfully!");
          form.reset();
          productsContainer.innerHTML = ""; // Clear products
        }
      });
    });
  });
  