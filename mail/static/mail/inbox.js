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
  document.querySelector('#compose-view').style.display = 'block';

  // Track input fields
  const recipients = document.querySelector('#compose-recipients');
  const subject = document.querySelector('#compose-subject');
  const body = document.querySelector('#compose-body');

  // Clear out composition fields
  recipients.value = '';
  subject.value = '';
  body.value = '';

  // On form submission:
  document.querySelector('#compose-form').addEventListener('submit', e => {
    e.preventDefault();

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
})
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    const emailsView = document.querySelector('#emails-view');

    // Loop through each email and create HTML elements
    emails.forEach(email => {
      const element = document.createElement("div");
      element.innerHTML = `ID: ${email.id} BODY: ${email.body} SENDER: ${email.sender}`;
      emailsView.append(element);
      element.addEventListener('click', function() {
        console.log('This element has been clicked!')
        })
    });
  });


}