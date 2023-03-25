const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

(async () => {
  // Launch a new headless browser instance
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Navigate to the GitHub Trending page
  await page.goto('https://github.com/trending');

  // Extract the HTML content from the page
  const html = await page.content();

  // Load the HTML content into Cheerio
  const $ = cheerio.load(html);

  // Extract the relevant data for each repository
  const repositories = $('.Box .Box-row').map((i, el) => {
    const title = $(el).find('h1').text().trim();
    const description = $(el).find('p').text().trim();
    const url = $(el).find('a').attr('href');
    const stars = $(el).find('.octicon-star').parent().text().trim();
    const forks = $(el).find('.octicon-repo-forked').parent().text().trim();
    const language = $(el).find('[itemprop="programmingLanguage"]').text().trim();
    return { title, description, url, stars, forks, language };
  }).get();

  // Click on the "Developers" tab and select "JavaScript" from the language dropdown
  await page.click('a[href="/developers"]');
  await page.waitForSelector('#language-filter');
  await page.select('#language-filter', 'javascript');
  await page.waitForNavigation();

  // Extract the relevant data for each developer
  const developers = $('.explore-content ol li').map((i, el) => {
    const name = $(el).find('.f3 a').text().trim();
    const username = $(el).find('.f4 text-gray').text().trim().replace(/^\(|\)$/g, '');
    const repoName = $(el).find('span.repo-snipit-name').text().trim();
    const repoDescription = $(el).find('p.repo-snipit-description').text().trim();
    return { name, username, repoName, repoDescription };
  }).get();

  // Close the browser instance
  await browser.close();

  // Store the extracted data in a JSON object
  const data = { repositories, developers };

  // Log the JSON object to the console
  console.log(JSON.stringify(data, null, 2));
})();
