# **App Name**: NovaChain Nexus

## Core Features:

- User Authentication and Roles: Secure user authentication with role-based access control (admin/user) managed via Firebase Auth and Firestore.
- Crypto Deposit Tracking: Track crypto deposits, confirmations, and status using Firestore. Cloud Functions verify transactions and update user levels.
- Level-Based Task Access: Dynamically display tasks based on user level, with task details fetched from Firestore. Enforce access rules via Cloud Functions.
- Task Submission and Approval Workflow: Allow users to submit tasks, with admin review/approval handled via Cloud Functions. Task statuses are stored in Firestore.
- Wallet and Rewards Management: Manage user wallet balances and track rewards earned. Wallet updates are performed server-side using Cloud Functions to ensure data integrity.
- Withdrawal Request Processing: Process user withdrawal requests with admin approval. Enforce withdrawal limits based on user level, using Cloud Functions.
- Admin Dashboard: Admin dashboard to manage users, tasks, deposits, submissions, and withdrawals.
- Landing Page Animation: Futuristic themed landing page with animated crypto coins.
- User Testimonials Carousel: Display real user testimonials with an auto-scrolling effect.

## Style Guidelines:

- Primary color: Deep Indigo (#4B0082) to convey trust and security in the financial aspects of the app. The choice of a dark and slightly mysterious hue contributes to a sophisticated user interface.
- Background color: Light Grayish-Blue (#E6E8FA), very desaturated and light, which makes the Indigo elements stand out.
- Accent color: Yellow-Orange (#D4A245) to highlight important interactive elements. As a brighter, contrasting color to the primary, this provides clarity and helps guide the user to task completions and available funds.
- Headline font: 'Space Grotesk', sans-serif; body font: 'Inter', sans-serif. Use Space Grotesk for headlines, and Inter for body text to create a balance of tech and modern.
- Use clean, modern icons from a consistent set (e.g., Material Design Icons or Font Awesome) to represent different task types, user levels, and wallet actions. Use different color shades for active, completed, and locked items to increase usability.
- Implement a clear, intuitive layout with a user dashboard and a separate admin dashboard. Use card-based layouts for tasks, deposits, and withdrawals. Responsive design to support mobile and desktop.
- Use subtle animations and transitions to provide feedback to user interactions (e.g., button clicks, form submissions). Avoid unnecessary animations that may distract or confuse users. Loading animations should clearly indicate activity while a function runs.
- Use futuristic themed animation on the landing page to showcase the crypto rewards system with animated coins.
- Implement an auto-scrolling effect for the user testimonials to showcase real user feedback.