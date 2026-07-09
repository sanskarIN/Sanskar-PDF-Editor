// =============================================================================
// (c) Copyright Sanskar Yadav. All rights reserved.
// Made by the Sanskar Yadav.
// 
// Follow Sanskar or Creater on:-
// GitHub:- https://www.github.com/Sanskar-in
// LinkedIn:- https://www.linkedin.com/in/sanskar-in
// X (Formally known as Twitter):- https://www.x.com/Sanskar_in
// Source will available at the GitHub:- https://www.github.com/Sanskar-in/Sanskar-PDF-Editor
// Need support:- supportramsandesh@gmail.com
// Want to make your own apps, websites, games, or anything else via Sanskar:- sanskaryadavfrom2012to2026@gmail.com
// =============================================================================

<!-- =============================================================================
(c) Copyright Sanskar Yadav. All rights reserved.
Made by the Sanskar Yadav.
Purpose: Documentation file explaining aspects of Sanskar's PDF Editor.
============================================================================= -->

# 11 - Security and Privacy Features

The architecture of this application was designed with extreme data protection and security in mind.

## Offline execution
By splitting the application into a local Node.js backend and a Vite frontend, we achieve total data isolation.
Traditional PDF tools require uploading a file to a remote server. If that server is breached, or if the connection is intercepted, sensitive corporate documents are exposed. 
Our application processes `100%` of files locally. You could literally disconnect your ethernet cable or turn off your Wi-Fi, and all 50+ tools would continue to function perfectly.

## Metadata Stripping Algorithm
When users choose the `meta-remove` tool, the system performs a deep forensic cleansing of the document.
PDF documents contain an XMP Metadata stream and an `/Info` dictionary. These objects track:
- The exact time the document was created.
- The exact software used to create it.
- The operating system and user profile of the creator.

The backend algorithm traverses the PDF tree, completely nullifying these objects and garbage-collecting them during the `pdfDoc.save()` re-serialization step, ensuring true anonymity before file distribution.

## Tauri API Sandboxing
When running as a desktop app, the Tauri runtime restricts the frontend from accessing the user's hard drive directly. The frontend must specifically request an IPC command to trigger a native save dialog, meaning the application cannot stealthily read or write files to the system without explicit user consent.

