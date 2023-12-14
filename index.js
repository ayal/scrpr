const puppeteer = require('puppeteer');
const fs = require('fs');


const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const fakeUserAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';

const PAGE_START = 1;
const PAGE_END = 3; // use env var as well
const SLEEP_TIME = process.env.SLEEP_TIME || 30000;

(async () => {
    // Launch a headless browser instance
    const browser = await puppeteer.launch({
        executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google Chrome', // Replace with your actual path
        headless: false, // change to true
        args: ['--no-sandbox', '--disable-setuid-sandbox', `--user-agent=${fakeUserAgent}`]

    });
    // Open a new page in the browser
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    try {
        // loop through 10 pages:
        for (let i = PAGE_START; i <= PAGE_END; i++) {
            // Navigate to the URL you want to scrape
            await page.goto(`https://www.dnb.com/business-directory/company-information.automobile_dealers.us.html?page=${i}`, { waitUntil: 'networkidle2' });

            console.log('opened page', i, `waiting for ${SLEEP_TIME / 1000} seconds`);
            await sleep(SLEEP_TIME); // maybe it's not even needed

            // Wait for a specific element to appear on the page (adjust the selector as needed)
            await page.waitForSelector('#companyResults', { timeout: 10000 });


            // Use page.$$eval to select and extract the text content from matching elements
            const elements = await page.$$eval('.col-md-12.data .col-md-6 a', (nodes) => {
                return nodes.map((node) => node.textContent.trim()); // maybe you need to remove newlines
            });

            // results to a file:
            fs.appendFileSync('results.txt', elements.join('\n'));

            console.log('written resutls to file')
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        // Close the browser
        //await browser.close(); // remember to close the page / pages
    }
})();