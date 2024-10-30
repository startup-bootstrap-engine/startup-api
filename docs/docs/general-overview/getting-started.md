# Getting Started

Welcome to the Startup Engine project! This is the initial entry point for anyone who wants to contribute. This section covers some initial instructions, guidelines and etc. Note that you'll also need to do a [OS setup](../os/os-setup.md) and service specific setups (check the end of this file for links.)

## Pre-requisites

- It’s recommended that you create a [separate Google Chrome profile](https://www.youtube.com/watch?v=pEMhTumFtPo&ab_channel=MaxDalton) for our project. It’s way more efficient and organized.

- Please [download the Slack app](https://slack.com/downloads/windows) on your phone and activate notifications (its important staying active!).

## Important Notices

### Team Rules

The project has voluntary enrollment. We do it here as a hobby. It's not freelancing or related to any type of paid work (except if you’re a freelancer). Most here are in the learning phase and we created this environment to create something interesting and develop professionally at the same time.

- **Usage of Engine Source Code:**

  - You can use the engine source code for whatever you want (except selling it or for commercial usage), as long as you collaborate with it.
  - It can also serve as a portfolio, but make it clear the parts you worked on.

- **Coordination:**

  - I (Joao Paulo) just coordinate the flow of tasks. I'm not anyone's boss or manager.
  - It works better that way because I created the entire codebase from scratch and I have a lot of experience on what needs to be done.

- **Task Autonomy:**

  - You have full autonomy to choose the tasks associated with you and perform them as and when you want.
  - However, know that as we work as a team, if it takes too long, your task may be reassigned to someone else.

- **Freelancer Rules:**

  - You grant full ownership of the IP (intellectual property) of your work to Joao Paulo Furtado Silva, with an irrevocable license for non-restricted use, for non-commercial **OR** commercial usage.
  - You cannot use the codebase for anything else, including commercial usage or reselling.

- If you don't agree, please don't proceed and leave.

### Methodology

- **Scrum Methodology**
  - We use Scrum methodology for managing our project. If you don’t know what it means, please check:
    - [Introduction to Scrum](https://www.youtube.com/watch?v=InbOnXMAA7k&ab_channel=Moxie)
    - [Organize Agile](https://www.youtube.com/watch?v=2Vt7Ik8Ublw&ab_channel=OrganizeAgile)

## Onboarding

### Ask for Invitation to These Platforms

- **Jira**

  - We recommend downloading the Jira mobile app as well.

- **Slack**

  - Download the app.
  - Make sure the notifications are toggled on and you’re active.

- **GitHub**

  - Ask Joao Paulo for the invites. You'll need to provide your e-mail address.

- **Google Cloud**
  - Ask Joao Paulo for the invite, especially the proper permissions for our secret manager.

### OS Setup

Please follow the instructions from [this section](../os/os-setup.md) to setup your OS.

### Setup Your Local Folder Structure and Your Project

Before beginning your local environment setup, note that you **MUST** use Yarn and not npm. Npm will cause a lot of issues along the way, which are hard to debug.

Clone the repositories from this [link](https://github.com/orgs/startup-bootstrap-engine/repositories).

```bash
./startup-engine
   ./startup-api
   ./startup-mobile
   ./startup-shared
   ./startup-docs
```

### Project Codebase Overview

This is one of the most important steps! [Watch our videos](./project-structure-overview.mdx) so you can have a clear understanding of our codebase before starting our tasks.

Take your time to review these videos. It's important to become familiar with our codebase before jumping into solving any tasks. Focus especially on the videos related to your area (front-end or back-end), if that's the case.

### Read Our Git Guidelines

Check our [Git guidelines](./git.md) here.

### Next Steps

After finishing the general overview guide, please follow though the setup of each individual service.

- [API](../api/getting-started.md)
- [Client](../client/getting-started.md)
