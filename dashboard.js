

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
    
  