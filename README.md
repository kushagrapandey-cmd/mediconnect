MediConnect
===========

A UHI (Unified Health Interface)-based platform connecting patients, providers,and health records under India's Unified Health Interface framework — built asa full-stack MERN application.

Problem it solves
-----------------

MediConnect addresses fragmented healthcare information and the lack of a unified way to identify patients and access their medical history across healthcare providers. It provides patients with a centralized platform for medical records while enabling healthcare providers to retrieve a patient's uploaded records using a unique patient code.

Tech Stack
----------

*   Frontend: React 18.2, React Router DOM 6.22, Axios, React Icons, React Slick, Tailwind CSS 3.4
    
*   Backend: Node.js/Express 4.18, CORS, dotenv, Mongoose, Multer, Google APIs, GridFS-related storage packages
    
*   Database: MongoDB with Mongoose schemas for users and their uploaded medical files, including user details, role, gender, unique patient code, and uploaded-file metadata
    
*   Auth: Custom email/password authentication through Express routes with a unique user code generated during registration
    

Architecture
------------

Client (React frontend) → REST API (Node.js + Express) → MongoDB (Mongoose) for user and medical-record metadata → Google Drive for uploaded medical-file storage. Authentication and file-management operations are exposed through backend API routes; the current repository does not directly call an external UHI API.

Setup
-----

\`\`\`bashgit clone [https://github.com/kushagrapandey-cmd/mediconnect.git](https://github.com/kushagrapandey-cmd/mediconnect.git)cd mediconnect/back-end && npm installcd ../front-end && npm install

add .env — see .env.example
===========================

npm run dev # both back-end and front-end\`\`\`

Environment Variables
---------------------

VariableDescriptionMONGO\_URIMongoDB connection string used to connect the MediConnect databaseJWT\_SECRETSecret key reserved for JWT-based authentication configuration; the current repository's authentication route does not currently implement JWT tokens

Screenshots
-----------

Core flow: user registration/login → unique patient code generation → medical document upload → patient file retrieval and doctor-side patient-code lookup.

Live Demo
---------

Not currently deployed. The repository is available on GitHub, but a publicly accessible live deployment is not currently provided.

What I'd improve next
---------------------

Replace the current custom authentication with properly hashed passwords, JWT or secure session-based authentication, and role-based authorization, then add stronger access controls around patient records and file endpoints. I would also add automated tests, production environment configuration, and a deployed demo before treating the project as production-ready.
