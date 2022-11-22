const puppeteer = require('puppeteer')


async function autoScroll(page){
    await page.evaluate(async () => {
        await new Promise((resolve) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if(totalHeight >= scrollHeight - window.innerHeight){
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

const fetchData = async () => {
  const browser = await puppeteer.launch({ 
    headless: true,
    defaultViewport: null,
    args: [
        "--no-sandbox",
        '--disable-setuid-sandbox',
    ],
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log(msg.text()));

  await page.goto('https://rushcard.io/card-database/?&sort=Database%20Date&sortdirection=DESC', {"waitUntil" : "networkidle0"});
  await page.setViewport({
    width: 1200,
    height: 800
  });

  await autoScroll(page);
  await page.setDefaultNavigationTimeout(0);

  const final = await page.waitForSelector('.item-img').then(async () => {
    return await page.evaluate(() => {
      const { children } = document.querySelector('#api-area')
      return Array.from(children).map(child => {
        const name = child.querySelector('h1').innerHTML
        const type = child.querySelector('.item-misc').innerHTML
        const desc = child.querySelector('.item-desc').textContent.replace('\n', ' ')
        const img = child.querySelector('img').src
        return {
            name, type, desc, img
        }
      })
    })
  })
  browser.close();
  return final
};

module.exports.fetchData = fetchData