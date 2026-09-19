# Week 4 Summary: Hackathons & Notifications

This week focused on introducing time-boxed "crunch mode" functionality and building out a robust notification infrastructure using BullMQ.

## Hackathon Mode & Crunch Mode

We implemented a "Hackathon mode" for projects, which enables a focused "crunch mode" view. This helps teams manage short, intense bursts of development.
- **Toggle**: Projects can be put into Hackathon mode.
- **Viewer Join Links**: We introduced viewer join links, allowing external stakeholders to easily view the project progress without requiring a full account setup.

## Notification Infrastructure

A major focus was adding real-time and asynchronous notifications.
- **Notification Centre**: Added a UI component to display read and unread notifications to the user.
- **BullMQ Notification Flow**: Instead of blocking requests to send notifications, events are published to a BullMQ queue. A dedicated background worker picks up these events, formats the notification, and saves it to the database for the user to retrieve.
- **Email Worker Dry Run**: We set up an email worker using BullMQ. For now, it runs in a "dry run" mode (logging out the email instead of sending it) to validate the event-driven architecture without incurring email service costs.
