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

        // change the id of the div to #read if the read state is true (changes the styling)
        if (email.read == true) {
          var element = document.createElement("div");
          element.id = "read"
        }
        else {
          var element = document.createElement("div");
          element.id = "unread"
        }
        element.innerHTML =
          `<div class="listed-email">
              <div><strong>${email.sender}</strong>
              ${email.subject}</div>
              <div>${email.timestamp}</div>
          </div>`;
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

    document.querySelector('#email').innerHTML =
    `
    <div id="email_details">
      <h6> <strong>From: ${email.sender}</stong></h6>
      <h6>Subject: ${email.subject}</h6>
      <h6>${email.timestamp}</h6>
    </div>

    <div id="howl_view">
    <div>From ${email.sender}</div>
    ${email.body}
    </div>

    <div id="read_view">
      <div id="read-body">${email.body}</div>
      <div>
        <button onclick="toggle_read(${email.id}, ${email.read}), load_mailbox('inbox')" type="submit" class="alt_button"/>mark unread</button>
        <button onclick="toggle_archive(${email.id}, ${email.archived})" type="submit" class="alt_button"/>archive</button>
        <button onclick="reply(${email.id})" type="submit" class="alt_button"/>reply</button>
      </div>
    </div>
    `;

    if (email.read == false) {
      document.querySelector('#howl_view').style.display = 'flex';
      document.querySelector('#read_view').style.display = 'none';

      toggle_read(email.id, email.read) // Marks the mail as read
      howl() // Speaks and animates the email
    }
    else {
      document.querySelector('#howl_view').style.display = 'none';
      document.querySelector('#read_view').style.display = 'block';
    }
  })
}


// ANIMATION AND SPEECH
function howl () {

    // Selects all the elements in the body
    const elements = document.querySelectorAll("#howl_view > *");

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

        // Sets the speech properties depending on the type of element (note H1 etc is capitalised by Markdown)
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
            speech.rate = 1.1
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
        // Animation ended: hide the howl_view, display the read_view
        document.querySelector('#read_view').style.display = "block";
        document.querySelector('#howl_view').style.display = "none";
      }
    }
  // Starts the process of displaying each element in turn
  showElement(i);
}


function toggle_archive(id, archived_status) {
    console.log('archive button clicked');
    fetch(`/emails/${id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...email,
        archived: !archived_status, // Toggle the archived state
      }),
    })
    load_mailbox('archive')
}


function toggle_read(id, read_status) {
  console.log('toggle_read button clicked');
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...email,
      read: !read_status, // Toggle the read state
    }),
  })
}


function reply(id) {
  console.log('reply button clicked');

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

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
  })
}