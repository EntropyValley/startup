# CS260 Startup Project
A CS 260 Web Development Project

## Git Notes
- Git is a powerful tool for version management
- Ensure that local repository is up to date before continuing working

## Startup Proposal
Have you ever wanted a place to voice your mind? Have you ever needed a place to share your thoughts that you can't share anyone else?  Have you ever wanted a simple place to talk to your friends?  If so, then this message board is the place for you!  With a simple interface and support for both indentifiable and private conversing, this message board is the perfect place to voice your mind without the complexities or worries of traditional chat platforms. Simply make an account and send a message!

<p align="center">
    <img src="proposal.png" width="300">
</p>

Key Features:
+ Secure Login and Account Creation
+ Ability to send and view messages in real time
+ Ability to go into "Private mode" for sending messages without your username attached
+ Ability for messages to be deleted by users
+ Ability for Admin to delete messages or ban accounts in cases of misuse or harassment

## Simon Experience
Thus far, the experience of recreating Simon has not taught me all that much that I didn't already know.  However, it was nice getting more practice with some of HTML5's structural tags that I wasn't super familiar with and haven't used very much in the past.  I look forward to learning more as the semester progresses and I continue to implement more of Simon.

When implementing the Simon stylesheets, I took an alternative approach that tested my knowledge more.  Instead of reviewing the code, I took a basic look at the official version of this stage of Simon and implemented the CSS based on what it needed to look like.  Because I was already good enough with CSS, this challenged me to figure out how to best implement the desired styling without being able to simply look and retype what was already there.  I think this really helped me increase and renew my familiarity with the source material so that I will be better prepared when it comes to working on my startup project.

The service implementation for this application is fairly simple.  On the backend, it mostly consists of basic express setup, two endpoints for syncing scores, and a little bit of javascript that actually handles storing, updating, and pruning those scores.  On the frontend, there were a few basic changes to utilize these API endpoints as well as the random quote and picture requests on the about page.  Overall, it is pretty basic and I feel like I understand what it is doing fairly well.

The database implemetation for Simon is also fairly simple.  I really like how the database module stores all scores and then only requests the top ten scores back from the database instead of manually pruning them like the service implementation did. Ovarall though, this deliverable felt even more simple than the service deliverable.

The login implementation was where Simon appeared to get a lot more complex.  On the UI side, this meant significantly more logic for the login page to differentiate between being logged in and out and to allow users to change between these states.  However, the change was much more drastic on the backend.  The database module was expanded with functions to get users by email or token and create users when they do not exist.  This was then used in the main module to implement the auth/create and auth/login endpoints which create an acccount or verify an account by hashed password respectively before returning a cookie with a static session token.  While I would have learned more by implementing this functionality myself on my own Simon Implementation, reading through this code has certainly given me a decent idea of what I will need to implement for my startup app.

Luckily, WebSockets appear to be significantly simpler than implementing User Accounts.  The entirety of the websocket implementation lives within a single file - play.js - and the majority of it takes up approximately 35 lines of code near the bottom of the file. Honestly, I have always viewed WebSockets as this seemingly complex enigma that I never felt the need to touch with a 39 and a half foot pole.  However, this implementation has shown me that WebSockets can actually be very simple and easy to implement.  The actual initiation of a Websocket is as easy as declaring it with a path and event handlers are simple functions to which JSON messages are passed. From there, the sky is the limit!

## HTML, CSS, and JS Experience

I came into this class already knowing a lot about HTML, CSS, and Javascript, and so there wasn't a whole lot that I learned from these units. However, building this application alongside the practice activities certainly helped me to flush out my skills and remind me of the intricacies of certain aspects of web programming that I haven't had to use in months or years. I think that the most vital lesson I have learned from these last several units is that one really needs to keep practicing and programming frequently in order to not get rusty and start to lose the experience they've gained.

When implementing the Javascript for this application, I was simultaneously surprised with how much and little of the application's true functionality will rely on the backend when it is developed throughout the last milestones.  On one hand, a lot of features will depend on it (ex: actually storing messages for all users, password/account authentication, etc.), but I was actually able to make a lot more of it work locally than I expected.  LocalStorage was a huge help here and I'm greatful that the simon project used this method to store data across sessions as well since otherwise I certainly would have forgotten about the feature otherwise.