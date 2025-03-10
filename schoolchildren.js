
document.addEventListener('DOMContentLoaded', () => {
let dropDown = document.querySelector(".hidingButton");
let tickBoxes = document.getElementsByClassName("tickBox");
let alertMessages = document.getElementsByClassName("alertMessage");
const searchStudent = document.querySelector(".searchStudent")
const searchTeacher = document.querySelector(".searchTeacher")
let displaySearchedName = document.querySelector(".displaySearchedName");
let pickUpTheChild = document.querySelector(".pickUpTheChild")
 
dropDown.textContent = `Submit New Students details`

//Pop up alert
Array.from(tickBoxes).forEach((tickBox, index) => {
  tickBox.addEventListener("click", (event) => {
    event.preventDefault() //Preven Default behaviour of a TickBox
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
  })

})
//sending a text message to the parent
function textMessage() {
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
      timestamp: new Date().toISOString() // Built in Date Objective
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
searchStudent.addEventListener('click', () => {
  const studentInputButton = document.getElementById("studentInputButton").value.toLowerCase()
  studentButton(studentInputButton)
})
searchTeacher.addEventListener('click', () => {
  const teacherInputButton = document.getElementById("teacherInputButton").value.toLowerCase()
  teacherButton(teacherInputButton)
})

function studentButton(query){
const students = document.querySelectorAll('.nameDisplay .tickBox')
let results = []
students.forEach(student => {
  if(student.textContent.toLowerCase().includes(query)) {
    student.parentElement.style.display = 'block'
    results.push(student.textContent)
  } else {
    student.parentElement.style.display = 'none'
  }
})
displaySearchedName.textContent = results.length ? `${results.join(' , ')}` : 'No student matched your search'
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






/*function textMessage(){

  const client = twilio(accountSid, authTokenId)
  
  return client.messages
  .create({
          body:'Your child has been drop at home', 
          from: +15075563406 , 
          to:+256775820129
         .then(message => console.log(message.sid))
         .catch(err => console.log(err, 'Message not sent to the parent'))
  })
  }


//Drop down for the form
if (dropDown) {
  dropDown.addEventListener('click', () => {
    let dropDown = document.getElementsByClassName("hidingButton");
    if (dropDown.clicked == true) {
      dropDown.forEach(dropDown => dropDown.style.display = 'block');
    }
  });
}

dropDown.addEventListener('click', () => {
  if(form.style.display === "none"){
    form.style.display = "block"
  } else {
    form.style.display = "none"
  }
})
*/
//Text Message to the Parent
/*document.addEventListener('DOMContentLoaded', () => {
 let alertMessages = document.getElementsByClassName(".alertMessage");
 let tickBoxes = document.getElementsByClassName(".tickBox");

  Array.from(tickBoxes).forEach((tickBox, index) => {
    tickBox.addEventListener("click", () => {
      const alertMessage = alertMessages[index]
      if(alertMessage) {
        if(tickBox.checked){
          alertMessage.textContent = `You have sent a message to the Parent`
           alertMessage.style.display = "block"
            setTimeout(() => {
              alertMessage.style.display = "none"
            }, 3000)
            textMessage()
        } else{
          alertMessage.style.display = "none"
        }
      }
    })
  })
})*/