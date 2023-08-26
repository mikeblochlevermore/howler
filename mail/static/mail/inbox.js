document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Track input fields
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';
}


function send_mail() {
// Trigged using the onsubmit attribute of the form on inbox.html
// This avoided multiple calls, instead of the addEventListener method

  // Track input fields
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // post the details of the email
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: `${recipients.value}`,
        subject: `${subject.value}`,
        body: `${body.value}`
    })
  })
  .then(response => response.json())
  .then(result => {
      // Log result (success / failure to send)
      console.log(result);
      // Redirects to the sent mailbox
      load_mailbox('sent')
  });
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name and space for lisitng emails
  document.querySelector('#emails-view').innerHTML =
  `
  <h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>
  <div id="emails-list"></div>
  `;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Selects the emails-list div newly created above in the #emails-view div
    const emailsList = document.querySelector('#emails-list');

    // Loop through each email and create HTML elements
    emails.forEach(email => {

      console.log(email)

        // change the id of the div to #read if the read state is true (changes the styling)
        if (email.read == true) {
          var element = document.createElement("div");
          element.id = "read"
        }
        else {
          var element = document.createElement("div");
        }
        element.innerHTML = `<strong>${email.sender}</strong> / ${email.subject} // ${email.body}`;
        emailsList.append(element);

        // The div can be clicked on to view the email
        element.addEventListener('click', function() {
          view_email(email.id)
        })
    });
  });
}

function view_email(id) {
  // Hide other displays, switch to individual email view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Selects by id in inbox.html and sets the innerHTML to display relevant info:
    document.querySelector('#sender').innerHTML = `${email.sender}`;
    document.querySelector('#subject').innerHTML = `${email.subject}`;
    document.querySelector('#body').innerHTML = `${email.body}`;

    // Now the email has been viewed, change the 'read' state to true
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...email,
        read: true,
      }),
    })
    console.log(email)

// Animating the message
// script.js
const elements = document.querySelectorAll("#body > *");

let speech = new SpeechSynthesisUtterance();
speech.lang = "en";

let currentIndex = 0;

// Hide all elements initially
for (const element of elements) {
  element.style.display = "none";
}

function showElement(elementIndex) {
  if (elementIndex < elements.length) {
    elements[elementIndex].style.display = "block";
    const speech = new SpeechSynthesisUtterance(elements[elementIndex].textContent);
    speechSynthesis.speak(speech);
    const delay = elements[elementIndex].tagName === "H1" ? 1000 : 500; // Adjust delays as needed
    
    setTimeout(() => {
      elements[elementIndex].style.display = "none";
      currentIndex++;
      showElement(currentIndex);
    }, delay);
  }
}

showElement(currentIndex);





    // Listens for clicking on the archive button
    document.querySelector('#archive_button').addEventListener('click', e => {
      e.preventDefault();
      archive(email);
    })

     // Listens for clicking on the reply button
     document.querySelector('#reply_button').addEventListener('click', e => {
      e.preventDefault();
      reply(email);
    })

    });
  };


function archive(email) {
  console.log('archive button clicked');
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...email,
      archived: !email.archived, // Toggle the archived state
    }),
  })
  .then(() => load_mailbox('archive'))
}


function reply(email) {
  console.log('reply button clicked');

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Track input fields
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');
  body.autofocus = true;

  // Populate the form fields with the email that's being replied to
  recipients.value = email.sender;
  subject.value = `Re: ${email.subject}`;
  body.value = `

  On ${email.timestamp},
  ${email.sender} wrote:
  ${email.body}`;
}