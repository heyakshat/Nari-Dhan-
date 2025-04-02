document.addEventListener('DOMContentLoaded', () => {
    function openModal() {
      document.getElementById('applyModal').classList.remove('hidden');
    }
  
    function closeModal() {
      document.getElementById('applyModal').classList.add('hidden');
    }
  
    // Handle form submission
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
      applicationForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent actual form submission
        alert('Your application has been submitted successfully!');
        closeModal(); // Close the modal
      });
    }
  });
  