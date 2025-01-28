document.addEventListener("DOMContentLoaded", () => {
    const tableBody = document.querySelector("#formDataTable tbody");
  
    // Check if the user is authenticated
    fetch("/api/admin/check-auth")
      .then(response => {
        if (!response.ok) {
          window.location.href = "/login.html"; // Redirect to login if not authenticated
        } else {
          loadFormData();
        }
      })
      .catch(() => {
        window.location.href = "/login.html"; // Redirect on error
      });
  
    function loadFormData() {
      // Fetch form data from the backend
      fetch("/api/admin/data")
        .then(response => response.json())
        .then(data => {
          tableBody.innerHTML = ""; // Clear previous data
  
          if (data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='6' style='text-align: center;'>No data available</td></tr>";
            return;
          }
  
          data.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${item.name}</td>
              <td>${item.contact}</td>
              <td>${item.address || "N/A"}</td>
              <td>${item.email || "N/A"}</td>
              <td>${item.willingness}</td>
              <td>${item.products ? item.products.join(", ") : "N/A"}</td>
            `;
            tableBody.appendChild(row);
          });
        })
        .catch(error => console.error("Error fetching data:", error));
    }
  });
  