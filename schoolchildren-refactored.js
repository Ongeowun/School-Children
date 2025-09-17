/**
 * School Children Management System
 * Refactored version with improved organization and maintainability
 */

// Configuration object for centralized settings
const CONFIG = {
  API_ENDPOINTS: {
    SEND_TEXT: 'http://localhost:5500/send-text',
    SAVE_DATA: 'http://localhost:5500/save-data',
    GET_DATA: 'http://localhost:5500/get-data',
    DOWNLOAD_CSV: 'http://localhost:5500/download-csv',
    GET_STUDENTS: 'http://localhost:5500/get-students'
  },
  PHONE_NUMBERS: {
    FROM: '+15075563406',
    TO: '+256775820129'
  },
  TIMEOUTS: {
    ALERT_MESSAGE: 100000
  }
};

// Utility functions
const Utils = {
  formatDate: () => new Date().toISOString().split('T')[0],
  
  formatTimestamp: () => new Date().toLocaleString(),
  
  createStorageKey: (prefix, index) => `${prefix}_${index}_${Utils.formatDate()}`,
  
  logError: (error, context) => {
    console.error(`Error in ${context}:`, error);
  },
  
  showAlert: (message, duration = CONFIG.TIMEOUTS.ALERT_MESSAGE) => {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert-message';
    alertDiv.textContent = message;
    //alertDiv.style.cssText = 'position: relative; background: #eae6e6ff; color: Black; padding: 15px; border-radius: 5px; z-index: 1000;';
    document.body.appendChild(alertDiv);
    
    setTimeout(() => alertDiv.remove(), duration);
  }
};

// API Service for handling all backend communications
const APIService = {
  async sendSMS(messageBody) {
    try {
      const response = await fetch(CONFIG.API_ENDPOINTS.SEND_TEXT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          body: messageBody,
          from: CONFIG.PHONE_NUMBERS.FROM,
          to: CONFIG.PHONE_NUMBERS.TO,
          timestamp: Utils.formatTimestamp()
        })
      });
      
      if (!response.ok) throw new Error('Failed to send SMS');
      return await response.text().then(text => text ? JSON.parse(text) : {});
    } catch (error) {
      Utils.logError(error, 'sendSMS');
      throw error;
    }
  },
  
  async saveStudentData(data) {
    try {
      const response = await fetch(CONFIG.API_ENDPOINTS.SAVE_DATA, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Failed to save data');
      return await response.text().then(text => text ? JSON.parse(text) : {});
    } catch (error) {
      Utils.logError(error, 'saveStudentData');
      throw error;
    }
  },
  
  async fetchDashboardData() {
    try {
      const response = await fetch(CONFIG.API_ENDPOINTS.GET_DATA);
      if (!response.ok) throw new Error('Failed to fetch data');
      return await response.json();
    } catch (error) {
      Utils.logError(error, 'fetchDashboardData');
      throw error;
    }
  },
  
  async downloadCSV() {
    try {
      const response = await fetch(CONFIG.API_ENDPOINTS.DOWNLOAD_CSV);
      if (!response.ok) throw new Error('Failed to download CSV');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'school-children-data.csv';
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      Utils.logError(error, 'downloadCSV');
    }
  },

  async fetchStudents() {
    try {
      const response = await fetch(CONFIG.API_ENDPOINTS.GET_STUDENTS);
      if (!response.ok) throw new Error('Failed to fetch students');
      return await response.json();
    } catch (error) {
      Utils.logError(error, 'fetchStudents');
      throw error;
    }
  }
};

// Student Management Module
const StudentManager = {
  students: [],
  
  init() {
    this.bindEvents();
    this.loadFromStorage();
  },
  
  bindEvents() {
    const checkboxes = document.querySelectorAll('.tickBox');
    checkboxes.forEach((checkbox, index) => {
      checkbox.addEventListener('change', (e) => this.handleStudentCheck(e, index));
    });
  },
  
  handleStudentCheck(event, index) {
    const checkbox = event.target;
    const studentName = checkbox.parentElement.textContent.trim();
    const storageKey = Utils.createStorageKey('dropped', index);
    
    if (checkbox.checked) {
      localStorage.setItem(storageKey, 'true');
      checkbox.disabled = true;
      
      const data = {
        name: studentName,
        message: 'Your child has been dropped at home',
        checked: true,
        timestamp: Utils.formatTimestamp()
      };
      
      APIService.saveStudentData(data)
        .then(() => Utils.showAlert(`Message sent for ${studentName}`))
        .catch(error => Utils.showAlert(`Failed to save data for ${studentName}`));
    }
  },
  
  loadFromStorage() {
    const checkboxes = document.querySelectorAll('.tickBox');
    checkboxes.forEach((checkbox, index) => {
      const storageKey = Utils.createStorageKey('dropped', index);
      if (localStorage.getItem(storageKey) === 'true') {
        checkbox.checked = true;
        checkbox.disabled = true;
      }
    });
  },
  
  searchStudents(query) {
    const students = document.querySelectorAll('.nameDisplay .tickBox');
    const displayArea = document.querySelector('.displaySearchedName');
    let results = [];
    
    students.forEach(student => {
      const studentName = student.parentElement.textContent.trim().toLowerCase();
      const shouldShow = studentName.includes(query.toLowerCase());
      
      student.parentElement.style.display = shouldShow ? 'block' : 'none';
      if (shouldShow) results.push(studentName);
    });
    
    if (displayArea) {
      displayArea.nextSibling.textContent = results.length 
        ? results.join(', ') 
        : 'No student matched your search';
    }
  },
  
  searchTeachers(query) {
    const teachers = document.querySelectorAll('.nameDisplay .tickBox');
    teachers.forEach(teacher => {
      const teacherName = teacher.textContent.toLowerCase();
      teacher.parentElement.style.display = teacherName.includes(query.toLowerCase()) 
        ? 'block' 
        : 'none';
    });
  }
};

// SMS Service
const SMSService = {
  sendDropOffMessage() {
    const pickUpInput = document.querySelector('.pickUpTheChild');
    const pickUpName = pickUpInput?.value.trim() || '';
    
    const messageBody = pickUpName
      ? `Your child has been dropped at home and picked up by ${pickUpName}`
      : 'Your child has been dropped at home';
    
    return APIService.sendSMS(messageBody);
  }
};

// UI Controller
const UIController = {
  init() {
    this.setupNavigation();
    this.setupFormToggle();
    this.setupSearch();
    this.setupDownload();
  },
  
  setupNavigation() {
    const dashboardBtn = document.querySelector('.dashboard');
    dashboardBtn?.addEventListener('click', () => {
      window.location.href = 'dashboard.html';
    });
  },
  
  setupFormToggle() {
    const formPopup = document.querySelector('.info-form');
    const toggleBtn = document.querySelector('.hidingButton');
    
    toggleBtn?.addEventListener('click', () => {
      const isVisible = formPopup.style.display === 'block';
      formPopup.style.display = isVisible ? 'none' : 'block';
    });
  },
  
  setupSearch() {
    const searchStudentBtn = document.querySelector('.searchStudent');
    const searchTeacherBtn = document.querySelector('.searchTeacher');
    
    searchStudentBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const query = document.getElementById('studentInputButton')?.value || '';
      StudentManager.searchStudents(query);
    });
    
    searchTeacherBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      const query = document.getElementById('teacherInputButton')?.value || '';
      StudentManager.searchTeachers(query);
    });
  },
  
  setupDownload() {
    const downloadBtn = document.querySelector('.downloadButton');
    downloadBtn?.addEventListener('click', () => {
      APIService.downloadCSV();
    });
  }
};

// Main Application Controller
const SchoolChildrenApp = {
  init() {
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('schoolchildren.html')) {
      this.initSchoolChildrenPage();
    } else if (currentPage.includes('dashboard.html')) {
      this.initDashboardPage();
    }
  },
  
  initSchoolChildrenPage() {
    // Set UI text
    document.querySelector('.hidingButton').textContent = 'Submit New Students details';
    document.querySelector('.dashboard').textContent = 'DASHBOARD';
    document.querySelector('.makePayments').textContent = 'MAKE PAYMENTS';
    
    UIController.init();
    StudentManager.init();
  },
  
  initDashboardPage() {
    document.querySelector('.dashboard').textContent = 'DASHBOARD';
    document.querySelector('.makePayments').textContent = 'MAKE PAYMENTS';
    
    DashboardManager.init();
  }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  SchoolChildrenApp.init();
});
