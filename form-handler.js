/**
 * Form Handler for Student Registration
 * Handles form submission and saves data to CSV
 */

class FormHandler {
  constructor() {
    this.form = null;
    this.init();
  }

  init() {
    this.form = document.getElementById('studentForm');
    if (this.form) {
      
      this.bindEvents();
    }
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(event) {
    event.preventDefault();
    
    const formData = this.collectFormData();
    
    if (!this.validateFormData(formData)) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await this.saveToCSV(formData);
      this.showSuccessMessage();
      this.clearForm();
    } catch (error) {
      console.error('Error saving student data:', error);
      alert('Failed to save student data. Please try again.');
    }
  }

  collectFormData() {
    const formData = new FormData(this.form);
    const data = {};
    
    // Collect all form fields
    data.firstName = this.form.querySelector('#firstName').value.trim();
    data.lastName = this.form.querySelector('#lastName').value.trim();
    data.studentsClass = this.form.querySelector('#studentsClass').value.trim();
    data.parentsFirstName = this.form.querySelector('#parentsFirstName').value.trim();
    data.parentsSecondName = this.form.querySelector('#parentsSecondName').value.trim();
    data.parentsContacts = this.form.querySelector('#parentsContacts').value.trim();
    data.parentsemails = this.form.querySelector('#parentsemails').value.trim();
    data.parentsLocations = this.form.querySelector('#parentsLocations').value.trim();
    data.secondParentsFirstName = this.form.querySelector('#SecondParentFirstName').value.trim();
    data.secondParentsLastName = this.form.querySelector('#SecondParentSecondName').value.trim();
    data.secondParentsContacts = this.form.querySelector('#SecondparentContacts').value.trim();
    data.secondParentsEmails = this.form.querySelector('#SecondParentEmail').value.trim();
    data.secondParentsLocations = this.form.querySelector('#SecondParentLocation').value.trim();
    
    return data;
  }

  validateFormData(data) {
    const requiredFields = [
      'firstName', 'lastName', 'studentsClass',
      'parentsFirstName', 'parentsSecondName',
      'parentsContacts', 'parentsemails', 'parentsLocations'
    ];

    return requiredFields.every(field => data[field] && data[field].trim() !== '');
  }

  async saveToCSV(data) {
    const response = await fetch('http://localhost:5500/submit-student-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  showSuccessMessage() {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = 'Student details saved successfully!';
    successDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      z-index: 1000;
    `;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
      successDiv.remove();
    }, 10000);
  }

  clearForm() {
    this.form.reset();
  }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new FormHandler();
});
