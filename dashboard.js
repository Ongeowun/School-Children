document.addEventListener('DOMContentLoaded', () => {
  let dashboard = document.querySelector(".dashboard")
  let makePayments = document.querySelector(".makePayments")
  let mainPage = document.querySelector(".mainPage")
  const dateDropdownContainer = document.querySelector(".datedropdown")

  dashboard.textContent = `DASHBOARD`
  makePayments.textContent = `MAKE PAYMENTS`

  mainPage.addEventListener('click', () => {
    window.location.href = 'schoolchildren.html'
  })

  // Variables to hold chart instances so we can update them later
  let barChartInstance = null
  let pieChartInstance = null

  // Function to create or update charts
  function renderCharts(droppedChildren, notDroppedChildren) {

    const barChartCtx = document.getElementById('barChart').getContext('2d')
    const pieChartCtx = document.getElementById('pieChart').getContext('2d')

    // Destroy existing charts if they exist to avoid duplicates
    if (barChartInstance) {
      barChartInstance.destroy()
    }
    if (pieChartInstance) {
      pieChartInstance.destroy()
    }

    barChartInstance = new Chart(barChartCtx, {
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
          y: {
            beginAtZero: true,
          }
        }
      }
    })

    pieChartInstance = new Chart(pieChartCtx, {
      type: 'pie',
      data: {
        labels: ['Dropped at Home', 'Not Dropped at Home'],
        datasets: [{
          label: 'Delivery Status',
          data: [droppedChildren, notDroppedChildren],
          backgroundColor: ['#4CAF50', '#f77d61ff'],
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
  }

  // Fetch data and initialize dropdown and charts
  Promise.all([
    fetch('http://localhost:5500/get-data').then(r => r.json()),
    fetch('http://localhost:5500/get-students').then(r => r.json())
  ]).then(([data, students]) => {
      // Extract unique dates from data timestamps
      const uniqueDatesSet = new Set()
      data.forEach(item => {
        // timestamp format: "DD/MM/YYYY, HH:MM:SS"
        if (item.timestamp) {
          const datePart = item.timestamp.split(',')[0].trim()
          uniqueDatesSet.add(datePart)
        }
      })
      const uniqueDates = Array.from(uniqueDatesSet).sort((a, b) => {
        // Sort dates descending (most recent first)
        const [dayA, monthA, yearA] = a.split('/').map(Number)
        const [dayB, monthB, yearB] = b.split('/').map(Number)
        const dateA = new Date(yearA, monthA - 1, dayA)
        const dateB = new Date(yearB, monthB - 1, dayB)
        return dateB - dateA
      })

      // Create dropdown select element
      const selectEl = document.createElement('select')
      selectEl.id = 'dateSelect'
      uniqueDates.forEach(date => {
        const option = document.createElement('option')
        option.value = date
        option.textContent = date
        selectEl.appendChild(option)
      })
      dateDropdownContainer.appendChild(selectEl)

      // Function to filter data by selected date and update charts
      // ...existing code...
function updateChartsByDate(selectedDate) {
  // filter records for the selected date
  const filteredData = data.filter(item => {
    if (!item.timestamp) return false;
    const datePart = item.timestamp.split(',')[0].trim();
    return datePart === selectedDate;
  });

  // keep latest record per student name (in case of multiple entries)
  const statusByName = new Map();
  filteredData.forEach(item => {
    const name = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim();
    const ts = Date.parse(item.timestamp) || 0;
    const existing = statusByName.get(name);
    if (!existing || ts > existing.ts) {
      statusByName.set(name, { checked: !!item.checked, ts });
    }
  });

  let droppedChildren = 0;
  let notDroppedChildren = 0;
  const notDroppedStudents = [];

  // use the students list to determine everyone (students from fetch)
  students.forEach(s => {
    const fullName = s.fullName || `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const status = statusByName.get(fullName);
    if (status) {
      if (status.checked) droppedChildren++;
      else {
        notDroppedChildren++;
        notDroppedStudents.push(fullName);
      }
    } else {
      // no record for this student on selected date => treat as not dropped
      notDroppedChildren++;
      notDroppedStudents.push(fullName);
    }
  });

  console.log('Filtered data length:', filteredData.length);
  console.log('Dropped children:', droppedChildren);
  console.log('Not dropped children:', notDroppedChildren);

  renderCharts(droppedChildren, notDroppedChildren);

  // update the list in DOM only if the element exists
  const notDroppedList = document.getElementById('notDroppedStudents');
  if (!notDroppedList) {
    console.warn('Element #notDroppedStudents not found in DOM; skipping list update.');
    return;
  }

  notDroppedList.innerHTML = '';
  if (notDroppedStudents.length === 0) {
    notDroppedList.innerHTML = '<li>No students dropped at home</li>';
  } else {
    notDroppedStudents.forEach(name => {
      const li = document.createElement('li');
      li.textContent = name;
      notDroppedList.appendChild(li);
    });
  }
}
// ...existing code...
      // Initial render with most recent date
      if (uniqueDates.length > 0) {
        updateChartsByDate(uniqueDates[0])
        selectEl.value = uniqueDates[0]
      }

      // Add event listener to dropdown to update charts on change
      selectEl.addEventListener('change', (e) => {
        updateChartsByDate(e.target.value)
      })
    })
    .catch((error) => {
      console.error('Error fetching data:', error)
    })

  console.log(document.getElementById('barChart'))
  console.log(document.getElementById('pieChart'))
})
