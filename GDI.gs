// === User Settings ===
const USER_SETTINGS = {
    OUTPUT_METHOD: 'EMAIL',
    DATA_COLLECTION_TIMES: ['06:00', '12:00', '18:00', '23:00'],
    LANGUAGE: 'zh-TW',
    LOCATION: 'Taipei'
};

// === Global Constants ===
const CONFIG = {
    REPORT_TITLE_PREFIX: 'Daily Insights Report - ',
    LOG_SHEET_NAME: 'GDI_Error_Log',
    GOOGLE_NEWS_RSS_BASE: 'https://news.google.com/rss',
    NEWS_ITEM_LIMIT: 3
};

// === Environment and Logger Classes ===
class Environment {
    static initialize() {
        const userProps = PropertiesService.getUserProperties();
        if (!userProps.getProperty('initialized')) {
            this.createLogSheet();
            userProps.setProperty('initialized', 'true');
        }
    }

    static createLogSheet() {
        try {
            let ss = SpreadsheetApp.getActiveSpreadsheet();
            let logSheet = ss.getSheetByName(CONFIG.LOG_SHEET_NAME);
            if (!logSheet) {
                logSheet = ss.insertSheet(CONFIG.LOG_SHEET_NAME);
                logSheet.appendRow(['Timestamp', 'Module', 'Severity', 'Message']);
            }
            return logSheet;
        } catch (e) {
            console.error('Failed to create log sheet:', e);
        }
    }
}

class Logger {
    static log(module, severity, message) {
        console.log(`[${module}] ${severity}: ${message}`);
        const logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.LOG_SHEET_NAME);
        if (logSheet) {
            logSheet.appendRow([new Date(), module, severity, message]);
        }
    }
}

// === Data Collector Class ===
class DataCollector {
    constructor(settings) {
        this.settings = settings;
        this.data = {};
    }

    collectData() {
        this.data.timestamp = new Date();
        this.data.localNews = this.getLocalNewsData();
        this.data.gmail = this.collectGmailData();
        this.data.calendar = this.collectCalendarEvents();
        return this.data;
    }

    getLocalNewsData() {
        try {
            const url = `${CONFIG.GOOGLE_NEWS_RSS_BASE}?q=local news in ${this.settings.LOCATION}&hl=${this.settings.LANGUAGE}&gl=${this.settings.LOCATION.toUpperCase()}&ceid=${this.settings.LOCATION.toUpperCase()}:${this.settings.LANGUAGE}`;
            const response = UrlFetchApp.fetch(url);
            const xml = XmlService.parse(response.getContentText());
            const root = xml.getRootElement();
            const channel = root.getChild('channel');
            const items = channel.getChildren('item');

            const results = [];
            for (let i = 0; i < Math.min(items.length, CONFIG.NEWS_ITEM_LIMIT); i++) {
                const item = items[i];
                results.push({
                    title: item.getChild('title').getText(),
                    link: item.getChild('link').getText(),
                    pubDate: item.getChild('pubDate')?.getText() || ""
                });
            }
            return results;
        } catch (error) {
            Logger.log('LocalNewsData Collection', 'ERROR', error);
            return [];
        }
    }

    collectGmailData() {
        try {
            const threads = GmailApp.search('newer_than:1d', 0, CONFIG.NEWS_ITEM_LIMIT);
            return threads.map(thread => ({
                subject: thread.getFirstMessageSubject(),
                from: thread.getMessages()[0].getFrom(),
                isUnread: thread.isUnread()
            }));
        } catch (error) {
            Logger.log('Gmail Collection', 'ERROR', error);
            return [];
        }
    }

    collectCalendarEvents() {
        try {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const events = CalendarApp.getDefaultCalendar().getEvents(today, tomorrow);
            return events.map(event => ({
                title: event.getTitle(),
                startTime: event.getStartTime(),
                endTime: event.getEndTime()
            }));
        } catch (error) {
            Logger.log('Calendar Collection', 'ERROR', error);
            return [];
        }
    }
}

// === Report Generator Class ===
class ReportGenerator {
    constructor(data, settings) {
        this.data = data;
        this.settings = settings;
        this.report = [];
    }

    generateReport() {
        this.addHeader();
        this.addLocalNewsSection();
        this.addGmailSection();
        this.addCalendarSection();
        this.addFooter();
        return this.sendEmail();
    }

    addHeader() {
        this.report.push(this.formatDateTime(this.data.timestamp));
        this.report.push('---');
    }

    addLocalNewsSection() {
        const news = this.data.localNews;
        if (news && news.length > 0) {
            this.report.push(`Local News (${this.settings.LOCATION})`);
            news.forEach(item => {
                this.report.push(`${item.title}`);
                if(item.pubDate) this.report.push(`Updated: ${item.pubDate}`);
            });
            this.report.push('---');
        }
    }

    addGmailSection() {
        const mails = this.data.gmail;
        if (mails && mails.length > 0) {
            this.report.push('Gmail');
            mails.forEach(mail => {
                let entry = `${mail.subject} (From: ${mail.from})`;
                if (mail.isUnread) entry += " (Unread)";
                this.report.push(entry);
            });
            this.report.push('---');
        }
    }

    addCalendarSection() {
        const events = this.data.calendar;
        if (events && events.length > 0) {
            this.report.push('Calendar');
            events.forEach(event => {
                this.report.push(`${event.title} (${this.formatTime(event.startTime)} - ${this.formatTime(event.endTime)})`);
            });
            this.report.push('---');
        }
    }

    addFooter() {
        this.report.push('End of Report');
    }

    formatDateTime(date) {
        return date.toLocaleString(this.settings.LANGUAGE, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    formatTime(date) {
        return date.toLocaleTimeString(this.settings.LANGUAGE, {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    sendEmail() {
        const recipient = Session.getActiveUser().getEmail();
        const subject = `${CONFIG.REPORT_TITLE_PREFIX}${this.formatDateTime(this.data.timestamp)}`;
        const body = this.report.join('\n\n');
        GmailApp.sendEmail(recipient, subject, body);
        Logger.log('ReportGenerator', 'INFO', `Email sent to ${recipient}`);
    }
}

// === Main Function ===
function main() {
    try {
        Environment.initialize();
        const collector = new DataCollector(USER_SETTINGS);
        const data = collector.collectData();
        const generator = new ReportGenerator(data, USER_SETTINGS);
        generator.generateReport();
    } catch (error) {
        Logger.log('Main', 'ERROR', error);
    }
}

function setupTriggers() {
    ScriptApp.getProjectTriggers().forEach(trigger => ScriptApp.deleteTrigger(trigger));
    USER_SETTINGS.DATA_COLLECTION_TIMES.forEach(time => {
        const [hour, minute] = time.split(':').map(Number);
        ScriptApp.newTrigger('main')
            .timeBased()
            .atHour(hour)
            .nearMinute(minute)
            .everyDays(1)
            .create();
    });
    Logger.log('Triggers', 'INFO', `Triggers set for: ${USER_SETTINGS.DATA_COLLECTION_TIMES.join(', ')}`);
}
