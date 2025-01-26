document.addEventListener("DOMContentLoaded", () => {
  const categoriesDiv = document.getElementById("categories");
  const productsContainer = document.getElementById("productsContainer");
  const form = document.getElementById("donationForm");

  // Fetch and render categories
  fetch("/api/categories")
    .then(response => response.json())
    .then(categories => {
      categories.forEach(category => {
        const categoryButton = document.createElement("div");
        categoryButton.className = "category";
        categoryButton.textContent = category.name;

        categoryButton.addEventListener("click", () => {
          // Toggle the selected class
          categoryButton.classList.toggle("selected");

          if (categoryButton.classList.contains("selected")) {
            fetchProducts(category.name);
          } else {
            removeCategoryProducts(category.name);
          }
        });

        categoriesDiv.appendChild(categoryButton);
      });
    });

  // Fetch products for a selected category
  function fetchProducts(category) {
    fetch(`/api/products?category=${category}`)
      .then(response => response.json())
      .then(products => {
        products.forEach(product => {
          const productCard = document.createElement("div");
          productCard.className = "product-card";
          productCard.dataset.category = category;

          productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <input type="checkbox" id="${product.name}" name="products" value="${product.name}">
            <label for="${product.name}">${product.name}</label>
          `;

          productsContainer.appendChild(productCard);
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
