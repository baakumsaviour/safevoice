Project Concept: SafeVoice – A Secure Reporting & Care Portal for
Vulnerable Groups
Overview We are developing a secure digital platform to help victims of Gender-Based
Violence (GBV) and child abuse report incidents safely. Unlike simple reporting forms, this is
a complete Case Management System. It connects victims to help immediately and gives
social workers the tools they need to track cases from the first report all the way to justice. A
project that UNICEF recently published and is keenly interested in.

1. The Problem: Why We Need This
Currently, many victims do not report abuse because:
● Fear: They are afraid of being seen walking into a police station.
● Shame: They fear being judged or identified by their community.
● Lost Information: When reports are made on paper, files often get lost, and cases
are forgotten.
● Lack of Data: Organizations (like UNICEF or Social Welfare) struggle to see the "big
picture" of where abuse is happening because there is no central data system.
2. Our Solution
We are building a system with three connected parts to solve these problems.
Part A: The Victim’s Portal (For the Public)
This is a mobile-friendly website where anyone can report abuse safely.
● 100% Anonymous: Victims can report without giving their name if they are scared.
● "Quick Escape" Button: A floating safety button. If an abuser walks into the room,
the user clicks this, and the site instantly closes and opens Google.
● Evidence Collection: Users can securely upload photos or audio recordings as
proof.
● Emergency Location: A button to "Send my location" if the victim is in immediate
danger.
● Resource Hub: A list of phone numbers for nearby shelters, police, and counselors
that works even if the user goes offline.
Part B: The Caseworker Dashboard (For NGOs, Police & Social Welfare)
This is the back-office tool for the professionals handling the cases.
● Case Triage: New reports arrive here instantly. Admins can tag them as "Urgent,"
"Pending," or "Resolved."
● Secure Chat: A safe way for a social worker to message a victim (if the victim
creates an account) without using WhatsApp or SMS, which can be easily tracked by
abusers.
● Role-Based Access (Security):
○ Super Admin: Sees all data.
○ Social Worker: Only sees the cases assigned to them.
Part C: The Analytics Dashboard (For Decision Makers)
This helps organizations plan better by showing real data.
● Heatmaps: A map that highlights which towns or regions have the most reports.
● Trend Graphs: Charts that show if abuse is increasing or decreasing over time.
● Demographics: General data on the age and gender of victims (without revealing
names) to help target aid where it is needed most.
3. Privacy & Safety First
Safety is our top priority. We use advanced features to protect users:
● Data Encryption: All data is scrambled. Even if a hacker steals the database, they
cannot read the names or stories of the victims.
● Automatic Data Protection: We include a "Data Expiry" feature. Once a case is
closed, sensitive evidence is automatically locked away or encrypted so it does not
sit on the live server forever.
4. Technology Stack
We are using modern, fast, and reliable technology to build this:
● Frontend (User Interface): Next.js or React (Ensures the site is very fast and works
perfectly on all mobile phones).
● Database: PostgreSQL (A robust system to handle complex data).
● Security: Industry-standard encryption for all files and text.
EXISTING SOLUTIONS AND THE GAP
5. SWIMS (Social Welfare Information Management System)
● Owner: Ministry of Gender, Children and Social Protection (MoGCSP) / UNICEF.
● What it is: This is the big "back-end" system used by the government. It is a
web-based Case Management System (built on the open-source software Primero).
+1
● How it works: Social workers and police use it to log cases, track interventions, and
generate national data on child protection and GBV.
● Limitation for Public: It is designed for officials, not for victims. A victim cannot just
download SWIMS and report a case; they have to go to a social worker who then
enters the data.
6. The "Boame" App & Orange Support Centre
● Owner: MoGCSP / UNFPA (United Nations Population Fund).
● What it is: A mobile app launched in 2021 specifically for Sexual and Gender-Based
Violence (SGBV).
● How it works: It allows users to report cases and is linked to the Orange Support
Centre, a call center where trained personnel handle the reports.
● Features: It allows users to send voice notes and videos and has a directory of
support services.
● Current State: Adoption has been mixed; many rural victims still rely on phone calls
rather than the app.
7. DOVVSU Helpline & Digital Platforms
● Owner: Ghana Police Service (Domestic Violence and Victim Support Unit).
● What it is: The primary police unit for abuse cases.
● System: They operate a dedicated hotline (055-100-0900) and use the Ghana Police
crime reporting database.
● Cyber Unit: The Police Cyber Crime Unit also has a "Cyber Tip Line" for reporting
online child sexual abuse (supported by the Cybersecurity Authority).
8. NGO-Led Initiatives
● The Ark Foundation: They run shelters and a crisis response center. While they
don't have a massive software platform, they are a key part of the manual referral
network.
● Beacon Ghana App: A smaller, NGO-led app that connects survivors with shelters
and legal aid.
The "Gap Analysis"
9. The "Integration" Gap:
● Current Situation: SWIMS is for government, Boame is for UNFPA/Gender Ministry,
and the Police have their own logs. They don't always talk to each other instantly.
● Our Solution: This project proposes a unified portal where a report goes to both the
police (for crime) and social welfare (for care) simultaneously  
10. The "Anonymous" Gap:
● Current Situation: Most current methods (like walking into DOVVSU) require you to
identify yourself immediately.
● Our Solution: This project focuses heavily on anonymity and the "Quick Escape"
feature, which is critical for victims living in the same house as their abuser.
11. The "Offline" Gap:
● Current Situation: Many apps require a strong data connection.
● Our Solution: This project includes an SMS/USSD integration plan (or offline-first
PWA) so it works in rural Ghana where data is expensive or unstable.
12. The Voice Recording Gap
Our Solution will allow people who cannot type use voice notes.
