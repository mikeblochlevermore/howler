# CS50W Project 3: Mail (Howler)

## An emailing system that gets mails read, by yelling them at the recipients

[See the Video](https://youtu.be/seKbkqJvGgA)<br>

💌 Inspired by 'Howlers' from Harry Potter

📣 Uses text to speech to 'howl' the email at the recipient

📝 Markdown format used to select sections of the email that need highlighting in the speech.

📬 Complete emailing system with inbox, sent, archive and composing capabilities.

## Single Page Application

Uses JavaScript to show and hide sections of the page depending on the requests.

```
document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
```

## Backend API

The majority of the API was set up by CS50, the assignment was to build a front end using JavaScript. The front end can get, put and post requests to the API to receive or alter information about emails.

### The majority of inbox.js is my work

```
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
  ```

## Using Markdown to highlight important parts of the mail

Taking inspiration from the Wiki project, I used the python library Markdown2 to compose and store an email in Markdown format. Hashtags are used to designate parts of the email that need extra emphasis:

#LOUD <br>
Best used one word at a time!

##Snaaarrky <br>
For really hammering in the point, slooowly

###Trite <br>
Just the facts, period.

As such, when the mail is spoken and animated, these parts of the mail will get extra attention in the form of larger text, or a change in voice.

This was implemented fairly simply by inserting these lines into the compose email function of views.py:

```
 body = data.get("body", "")

    # NEW: allows markdown format to highlight parts of the mail
    body = markdown2.markdown(body)

```

## Spoken and Animated Emails

I can't be the only one that gets irritated by people not reading their emails! So when I thought about mails that can't be ignored, the howler from Harry Potter came to mind...

I wanted the mail broken into sections, spoken and displayed in turn, and the markdown sections to be given extra emphasis.

```
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
```

## Archive and Mark as Unread

I discovered that adding event listeners to buttons would not work, since upon each refresh of the page, a new listener would be added, leading to multiple triggerings of the function when the button is eventually clicked.

As such, I changed the approach to adding an 'onlick' attribute to each button, which ran the appropriate function and transferred the necessary props. This could also run two functions on click, such as toggling the read status and then redirecting to the inbox view.

```
document.querySelector('#email').innerHTML =
    `
      <div>
        <button onclick="toggle_read(${email.id}, ${email.read}), load_mailbox('inbox')"
        type="submit"
        class="alt_button"/>mark unread</button>

        <button onclick="toggle_archive(${email.id}, ${email.archived})"
        type="submit"
        class="alt_button"/>archive</button>

        <button onclick="reply(${email.id})"
        type="submit"
        class="alt_button"/>reply</button>
      </div>
    `;
```

## Pre-Filled Replies

Clicking reply will pre-fill the compose form with the previous email, as well as its details. Note these details will appear in HTML format - an improvement could be to convert them back to markdown format.

```
// Populate the form fields with the email that's being replied to
    recipients.value = email.sender;
    subject.value = `Re: ${email.subject}`;
    body.value = `

    On ${email.timestamp},
    ${email.sender} wrote:
    ${email.body}`;
```

## Desired Improvements

- Ideally the mails could be sent to standard email addresses (Gmail etc), however, I believe most inboxes wont run custom JavaScript that's been recieved, so I would need to rethink the way the animation and speech runs, or simply have mails direct recipients to the howler website for displaying the mails.

- I'd like to implement a countdown timer to read the mail - just like the Howlers from Harry Potter, if not read in a certain time, they explode! Perhaps they could increase in anger level if not read in a certain time frame, or the recipient is sent extra increasingly demanding emails to read the original...

- I'd like to implement an option to select which voice the email is to be presented in. There are several in the SpeechSynthesisUtterance plugin, or personally, I think an AI version of Molly Weasley would be hilarious.

### Please note the backend was provided by CS50 for this project, the assignment was to build the front end. As such, the majority of inbox.js, styles.css and inbox.html is my work.



