
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname
  if(currentPage.includes('schoolchildren.html')) {
    initializeschoolChildrenPage()
  } else if(currentPage.includes('dashboard.html')){
    initiliazedashBoardPage()
  }

  function initializeschoolChildrenPage() {
    let dropDown = document.querySelector(".hidingButton");
    let tickBoxes = document.getElementsByClassName("tickBox");
    let alertMessages = document.getElementsByClassName("alertMessage");
    const searchStudent = document.querySelector(".searchStudent")
    const searchTeacher = document.querySelector(".searchTeacher")
    let pickUpTheChild = document.querySelector(".pickUpTheChild")
    let dashboard = document.querySelector(".dashboard")
    let makePayments = document.querySelector(".makePayments")
    let mainPage = document.querySelector(".mainPage")


    dropDown.textContent = `Submit New Students details`
    dashboard.textContent = `DASHBOARD`
    makePayments.textContent = `MAKE PAYMENTS`

   dashboard.addEventListener('click', () => {
    window.location.href = 'dashboard.html'
   })

    //Pop up alert
    Array.from(tickBoxes).forEach((tickBox, index) => {
      tickBox.addEventListener("click", () => {
        const alertMessage = alertMessages[index]
        if(alertMessage) {
          if(tickBox.checked) {
            alertMessage.style.display = "block"
            alertMessage.textContent =    `You have sent a message to the Parent`
            setTimeout(() => {
              alertMessage.style.display = "none"
            }, 3000)// clear the message after 3 seconds
            textMessage()//send a text message to the parent
          } else {
                  alertMessage.style.display = "none"
                } 
        }
      });
      });
    }
    //sending a text message to the parent
    function textMessage() {
      const pickUpTheChild = document.querySelector(".pickUpTheChild")
      const pickUpName = pickUpTheChild.value.trim()
      const messageBody = pickUpName
            ? `Your child has been dropped at home and picked up by ${pickUpName}` 
            : 'Your child has been dropped at home'
      fetch('http://localhost:5500/send-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          body:  messageBody,
          from: '+15075563406',
          to: '+256775820129',
          timestamp: new Date().toLocaleString() // Built in Date Objective
        })
      })
        .then(response => {
          if(!response.ok){
            throw new Error('Network response was not Ok')
          }
          return response.text().then(text => text ? JSON.parse(text) : {})
        })
        .then(data => console.log(data))
        .catch(error => console.error('Error:', error))
          
    }
    
    
    //Search tabs
      searchStudent.addEventListener('click', (event) => {
        event.preventDefault();
        const studentInputButton = document.getElementById("studentInputButton").value.toLowerCase();
        studentButton(studentInputButton);
      });

    searchTeacher.addEventListener('click', () => {
      const teacherInputButton = document.getElementById("teacherInputButton").value.toLowerCase()
      teacherButton(teacherInputButton)
    })
    
    function studentButton(query){
    const displaySearchedName = document.querySelector(".displaySearchedName")
    const students = document.querySelectorAll('.nameDisplay .tickBox')
    let results = []
    students.forEach(student => {
      const studentName = displaySearchedName.nextSibling.textContent.trim().toLowerCase()
      if(studentName.includes(query)) {
        student.parentElement.style.display = 'block'
        results.push(student.textContent)
      } else {
        student.parentElement.style.display = 'none'
      }
    })
    displaySearchedName.nextSibling.textContent = results.length ? `${results.join(' , ')}` : 'No student matched your search'
    }
    function teacherButton(query) {
     const teachers = document.querySelectorAll('.nameDisplay .tickBox')
     teachers.forEach(teacher => {
      if(teacher.textContent.toLocaleLowerCase().includes(query)) {
        teacher.parentElement.style.display = 'block'
      } else {
        teacher.parentElement.style.display = 'none'
      }
     })
    }
    popUp()
    })
    
    //Drop down for the form
    function popUp() {
      let formpopUp = document.querySelector(".info-form");
      let dropDown = document.querySelector(".hidingButton");
       dropDown.addEventListener('click', () => {
        if(formpopUp.style.display === "none" || formpopUp.style.display === "") {
          formpopUp.style.display = "block";
        } else {
          formpopUp.style.display = "none";
        }
       })
    }
    
    //saving the clicked buttton to the local storage
    document.addEventListener('DOMContentLoaded', () => {
      const checkboxes = document.querySelectorAll('.tickBox')
    
      checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('click', () => {
          const pupilName = checkbox.parentElement.textContent.trim()
          const isChecked = checkbox.checked
    
          //The data to be stored in the local storage
          const data = {
            name: pupilName,
            checked: isChecked,
            timestamp: new Date().toLocaleString()
          }
          //sending the stored data to the local storage/ backend 
          fetch('http://localhost:5500/save-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
           .then(response => response.json())
           .then(result => {
              console.log('Saved succesfully', result)
           })
           .catch(error => {
            console.error('Error saving data:', error)
           })
        })
      })
    })
    
    //download the data in a CSV file
    document.addEventListener('DOMContentLoaded', () => {
      const downloadButton = document.querySelector('.downloadButton')
      downloadButton.addEventListener('click', () => {
        fetch('http://localhost:5500/download-csv')
          .then(response => response.blob())
          .then(blob => {
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = 'data.csv'
            a.click()
            a.remove()
          })
          .catch(error => {
            console.error('Error downloading data:', error)
          })
      })
    })
    
  

function initiliazedashBoardPage() {

  let dashboard = document.querySelector(".dashboard")
  let makePayments = document.querySelector(".makePayments")
  let mainPage = document.querySelector(".mainPage")

    dashboard.textContent = `DASHBOARD`
    makePayments.textContent = `MAKE PAYMENTS`

    mainPage.addEventListener('click', () => {
      window.location.href = 'schoolchildren.html'
    })

// Fetching the day's data from the backend
fetch('http://localhost:5500/get-data')
.then((response) => {
   if (!response.ok) {
     throw new Error('Network response was not ok, Failed to fetch data')
   }
   return response.json()
})
.then((data) => {
 //Counting dropped children and children not yet dropped
 const droppedChildren = data.filter(child => child.checked).length
 const notDroppedChildren = data.filter(child => !child.checked).length

 //Displaying the data on the dashboard
 //Bar chart
 const barChart = document.querySelector('.barChart').getContext('2d')
 new Chart(barChart, {
   type: 'bar',
   data: {
     labels: ['Dropped at Home', 'Not Dropped at Home'],
     datasets: [{
       label: 'Number of Children',
       data: [droppedChildren, notDroppedChildren],
       backgroundColor: ['#4CAF50', '#FF5733'],
       borderWidth: 1
     }]
   },
   options: {
     responsive: true,
     scales: {
       Y: {
         beginAtZero: true,
       }
    }
   }
 })
 //Pie chart
 const pieChart = document.querySelector('.pieChart').getContext('2d')
 new Chart(pieChart, {
   type: 'pie',
   data: {
     labels: ['Dropped at Home', 'Not Dropped at Home'],
     datasets: [{
       label: 'Delivery Status',
       data: [droppedChildren, notDroppedChildren],
       backgroundColor: ['#4CAF50', '#FF5733'],
       borderWidth: 1
     }]
   },
   options: {
     responsive: true,
     plugins: {
       legend: {
         position: 'top',
       }
     }
   }
 })
})
.catch((error) => {
   console.error('Error fetching data:', error)
})
console.log('Dropped Children:', droppedChildren);
console.log('Not Dropped Children:', notDroppedChildren);

console.log(document.querySelector('.barChart'));
console.log(document.querySelector('.pieChart'));
}

