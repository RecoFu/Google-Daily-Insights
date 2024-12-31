### GDI (Google Daily Insights) Professional Architecture Whitepaper (Public Edition)

1. **Overview**:
   GDI (Google Daily Insights) is a personalized information dashboard based on Google App Script (GAS), designed to help users understand their behavior patterns and information preferences. GDI adheres to principles of automation, privacy, and integration with Google services, automatically collecting, analyzing, and presenting personal data to provide users with objective insights without any user interaction.

2. **Objective**:
   The objective of GDI is to create a seamless personal data analysis tool that allows users to gain deep insights into their digital footprint effortlessly. By automatically collecting and analyzing data from Google services, GDI aims to reveal users' behavior patterns and information preferences and present these insights in an easy-to-understand dashboard format.

3. **Core Principles**:
   - **Automation First**: All data collection and analysis processes are completed automatically by the system, requiring no manual operation by the user.
   - **Google Services Integration**: Uses only Google App Script and related Google services, without relying on any third-party APIs or external tools.
   - **Privacy Focused**: All data processing is done within the Google App Script environment, without storing data on external servers, ensuring data security.

4. **Functional Modules**:
   GDI consists of the following functional modules, each responsible for specific data processing tasks:

   - **Data Collection Module**: Responsible for automatically collecting information from various Google services.
     - **Data Sources**:
       - Financial Data: Queries financial data such as the S&P 500 index from Google News.
       - Weather Information: Queries weather information for the user's location from Google News.
       - Local News: Queries local news for the user's location from Google News.
       - Gmail: Email content, sender, labels, importance markings, etc.
       - Google Calendar: Calendar events, times, locations, etc.
       - Google Chrome Browsing History: Web links, titles, times, etc.
       - YouTube Watch History: Video links, titles, times, etc.
       - Google Maps: User location, routes, etc.
       - Google Fit: Steps, sleep, heart rate, and other health data.
       - Google: Security usage status of the Google account (unsafe authorizations, links, resource usage/remaining capacity in GB, etc.).
       - Feedly RSS: Subscribed RSS content.
     - **Collection Methods**:
       - Uses APIs provided by Google App Script to automatically read data from various Google services.
       - For Google services that do not support APIs (such as Chrome browsing history and YouTube watch history), offers optional data import functions for users:
         - Users can export related data themselves and upload it to a designated Google Drive folder, which the system then automatically reads and processes.
       - Does not develop any Chrome extensions or store users' browsing history and YouTube watch history on Google Drive for system reading and analysis.
       - Does not use web crawlers to collect external information, such as querying S&P 500 index and weather information on weather.com.
     - **Data Storage**: All collected data is temporarily stored in the Google App Script environment without permanent storage.
     - **Automated Scheduling**: The system automatically executes data collection tasks at scheduled times set by the user (e.g., 6 AM, 12 PM, 6 PM, 12 AM daily).

   - **Data Processing Module**: Responsible for analyzing and processing collected data to extract meaningful insights.
     - **Functions**:
       - Analyzes Gmail email content, identifying important emails and frequent contacts and topics.
       - Analyzes Google Calendar events, identifying important meetings and schedules.
       - Analyzes Google Chrome browsing history, identifying frequently visited websites and topics.
       - Analyzes YouTube watch history, identifying frequently watched channels and topics.
       - Analyzes Google Maps data, identifying frequently visited locations and routes.
       - Analyzes Google Fit health data, identifying health trends.
       - Analyzes the security usage status of the Google account (unsafe authorizations, links, resource usage/remaining capacity in GB, etc.).
       - Analyzes Feedly RSS content, identifying important news and articles.

   - **Report Generation Module**: Responsible for generating a personalized information dashboard based on processed data.
     - **Functions**:
       - Presents analysis results in clear and understandable charts, tables, text, etc.
       - Provides personalized information summaries, highlighting important data and trends.
       - Offers personalized suggestions and reminders based on user data.
     - **Output Format**:
       - Generates content in UTF-8 markdown format, using the user's preferred language (e.g., Traditional Chinese).
       - Sends Google Email notifications.

   - **Review and Optimization**: Regularly reviews the overall architecture and simplifies and optimizes the efficiency of all modules.

5. **User Settings**:
   GDI provides the following user setting options to allow customization of system behavior:
   ```javascript
   /**
    * User Settings
    * Modify the following settings according to your needs.
    */
   const USER_SETTINGS = {
     // Gmail address using the current account address
     // Report output method: 'EMAIL'
     OUTPUT_METHOD: 'EMAIL',
     // Data collection times: specified by the user (4 slots) or set in the Google App Script project,
     DATA_COLLECTION_TIMES: ['06:00', '12:00', '18:00', '00:00'],
   };
   ```

6. **Notes**:
   - Fully leverage Google's free architecture and services, and simplify settings such as not requiring the user to input their Gmail address in the code, using the current account email directly.
