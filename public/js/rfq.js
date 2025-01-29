document.addEventListener("DOMContentLoaded", function () {
    const rfqForm = document.getElementById("rfqForm");
    const specSheetInput = document.getElementById("specSheet");
    const specSheetYes = document.getElementById("specSheetYes");
    const specSheetNo = document.getElementById("specSheetNo");
    const specSheetText = document.getElementById("specSheetText");

    // Show/Hide Specification Sheet Input
    specSheetYes.addEventListener("change", function () {
        specSheetText.style.display = "none";
    });

    specSheetNo.addEventListener("change", function () {
        specSheetText.style.display = "block";
    });

    // Handle Form Submission
    rfqForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        // ✅ Use FormData for File Uploads
        const formData = new FormData();
        formData.append("buyerName", document.getElementById("buyerName").value);
        formData.append("contact", document.getElementById("contact").value);
        formData.append("company", document.getElementById("company").value);
        formData.append("email", document.getElementById("email").value);
        formData.append("instrumentName", document.getElementById("instrumentName").value);
        formData.append("specSheetOption", document.querySelector('input[name="specSheetOption"]:checked')?.value || "No");
        formData.append("specSheetDetails", document.getElementById("specSheetDetails").value);
        formData.append("quantity", document.getElementById("quantity").value);
        formData.append("urgency", document.querySelector('input[name="urgency"]:checked')?.value || "Standard");
        formData.append("additionalInfo", document.getElementById("additionalInfo").value);

        // ✅ Append File if Selected
        if (specSheetInput && specSheetInput.files.length > 0) {
            formData.append("specSheet", specSheetInput.files[0]); // Attach file
        }

        try {
            // ✅ Send Data to Backend
            const response = await fetch("/api/submitRFQ", {
                method: "POST",
                body: formData, // ✅ FormData sends both file & JSON data
            });

            const result = await response.json();

            if (response.ok) {
                alert("RFQ Submitted Successfully!");
                rfqForm.reset();
            } else {
                alert("Error: " + result.message);
            }
        } catch (error) {
            console.error("Error submitting RFQ:", error);
            alert("Submission failed. Please try again.");
        }
    });
});
