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
  document.querySelector('#body').style.display = "flex";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Selects by id in inbox.html and sets the innerHTML to display relevant info:
    document.querySelector('#sender').innerHTML = `${email.sender}`;
    document.querySelector('#subject').innerHTML = `${email.subject}`;
    document.querySelector('#body').innerHTML = `${email.body}`;

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

    // ANIMATION

    // Selects all the elements in the body
    const elements = document.querySelectorAll("#body > *");

    // Hide all elements initially
    for (const element of elements) {
      element.style.display = "none";
    }

    // sets an iteration count to loop through each element
    let i = 0;

    function showElement(i) {
      if (i < elements.length) {

        // converts the text content of that element to speech
        const speech = new SpeechSynthesisUtterance(elements[i].textContent);

        // Looks up whether the current element is H1, H2 or P
        const tag = elements[i].tagName

        // Sets the speech properties depending on the type of element
        switch (tag) {
          case 'H1':
            speech.volume = 1.0
            speech.pitch = 1.2
            speech.rate = 0.8
            break
          case 'H2':
            speech.volume = 0.5
            speech.pitch = 1.7
            speech.rate = 0.6
            break
          case 'H3':
            speech.volume = 0.3
            speech.pitch = 1.7
            speech.rate = 1
            break
          default:
            speech.volume = 0.2
            speech.pitch = 2
        }

        // Utters the content of the element and displays it
        speechSynthesis.speak(speech);
        elements[i].style.display = "block";

        // When the current element is finished being spoken:
        // hide it, update the count (i), and start on the next element
        speech.onend = () => {
          elements[i].style.display = "none";
          i++;
          showElement(i);
        };
      }
      else {
        // Animation ended: Make all the elements visible together
        for (const element of elements) {
          element.style.display = "block";
        }

        document.querySelector('#body').style.display = "block";
        // Now the email has been viewed, change the 'read' state to true

        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            ...email,
            read: true,
          }),
        })
      }
    }
  // Starts the process of displaying each element in turn
  showElement(i);

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