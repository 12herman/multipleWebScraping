const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const urlData = require('./urlData.js');
const urls = urlData.map(url => { return url.url });
const keyWords = urlData[0].keyword;
// Good Sheet Library:
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
//Node Mailer Library:
const creds = require('./web-scraping-nodejs-80830-06f68bdd5c46.json');
const nodemailer = require('nodemailer');
const ScrapingGoogleSheet = 'https://docs.google.com/spreadsheets/d/1sDP8hGTuT2DQxLVJOueZ9GCxoM6r8YEqACf_GLrjejE'
const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
  },
};
let idCounter = 1;
//Scraping Data
let ScrapeDatas = [];
const HEADERS = ["Id","Site Name", "Title", "Date", "Discription"];


async function scrapeData() {
  for (const url of urls) {
    try {
      const response = await axios.get(url, options);
      const html = response.data;
      const $ = cheerio.load(html);
      switch (url) {
        //website 1:
        case "https://www.dpr.com/media/all-news-media":
          $('.masonry-container .list-none').map((i, el) => {
            const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
            const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));
            if (keywordsCheck) {
              const title = $(el).children('article').children('div').children('div:eq(1)').children('a').children('h3').children('div').children('span:eq(0)').text();
              const date = $(el).children('article').children('div').children('div:eq(0)').children('span:eq(1)').text();
              const discription = $(el).children('article').children('div').children('div:eq(1)').children('div:eq(1)').children('p').text();
              let obj = {
                "Id":idCounter++,
                "Site Name": "DPR",
                "Title": title,
                "Date": date,
                "Discription": discription
              };             
                            ScrapeDatas.push(obj);
                          };
                        });
          break;

        //website 2:
        case "https://www.turnerconstruction.com/insights":
          $('.project-list-holder .inline_block').map((i, el) => {
            const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
            const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));
            if (keywordsCheck) {
              const title = $(el).children('h2').text();
              const discription = $(el).children('a:eq(1)').find('h2').text();
              const date = $(el).children('a:eq(1)').children('p').children('strong').text();
              let obj = {
                "Id":idCounter++,
                "Site Name": "Turner",
                "Title": title,
                "Date": date,
                "Discription": discription
              };
             ScrapeDatas.push(obj);
              // //Current Date to last 2 month date condition
              // const itemDate = new Date(date);
              // const currentDate = new Date();
              // const twoMonthsAgo = new Date();
              // twoMonthsAgo.setMonth(currentDate.getMonth() - 2);
              // if (itemDate >= twoMonthsAgo && itemDate <= currentDate){
              //   let obj = {
              //     "Id":idCounter++,
              //     "Site Name": "Turner",
              //     "Title": title,
              //     "Date": date,
              //     "Discription": discription
              //   };
              //  ScrapeDatas.push(obj);
              // }
            };
          });
          break;

        //website 3:
        case "https://www.usa.skanska.com/who-we-are/media/press-releases/":
          const browser = await puppeteer.launch({ headless: "new" });
          const page = await browser.newPage();
          await page.goto('https://www.usa.skanska.com/who-we-are/media/press-releases/');
         let cardContents = await page.$$('.search-hit');
            for (let card of cardContents){
                let cardText=await card.evaluate((el)=>el.innerText);
                let keywordsCheck = keyWords.some(keyWords=>cardText.includes(keyWords));
                if(keywordsCheck){
                    const title = await card.evaluate(el => el.querySelector('h3').innerText);
                    const date = await card.evaluate(el=>el.querySelector('.date').innerText);
                    const discription = await card.evaluate(el=>el.querySelector('.listing-text').innerText === '' ? 'No Discrption' : el.querySelector('.listing-text').innerText);
                    let obj = {
                                "Id":idCounter++,
                                "Site Name": "Turner",
                                "Title": title,
                                "Date": date,
                                "Discription": discription
                              };
                              ScrapeDatas.push(obj);
                };
            };
            await browser.close();
          break;

        // website 4:
        case "https://www.balfourbeatty.com/media/news-releases/":
          $('.equaliseholder .equalise').map((i, el) => {
            const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
            const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));
            if (keywordsCheck) {
              const title = $(el).children('h2').children('a').text();
              const discription = $(el).children('h2').children('a').attr('href'); //This is href link
              const date = $(el).find('p').text();
              let obj = {
                "Id":idCounter++,
                "Site Name": "Balfour Beatty ",
                "Title": title,
                "Date": date,
                "Discription": discription
              }
              ScrapeDatas.push(obj);
            }
          })
          break;

        // website 5:
        case "":
          //it have no url
          break;

        // website 6:
        case "https://www.whiting-turner.com/news/":
          //403 Forbidden website
          break;

        //Website 7:
        case "https://newsroom.kiewit.com":
          $('#articles .container .row .col-md-4 article').map((i, el) => {
            const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
            const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));
            if (keywordsCheck) {
              const title = $(el).children('h4').find('a').text();
              const discription = $(el).children('.article-excerpt').find('p').text();
              const date = "No date";
              let obj = {
                "Id":idCounter++,
                "Site Name": "Keiwit ",
                "Title": title,
                "Date": date,
                "Discription": discription
              }
              ScrapeDatas.push(obj);
            }
          });
          break;

        //Website 8:
        case "https://www.bartonmalow.com/news-events/newsfeed/":
          $('.blog-grid .format-standard a article').map((i, el) => {
            const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
            const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));

            if (keywordsCheck) {
              const title = $(el).find('.card-blog-post__category').text();
              const date = $(el).find('.card-blog-post__date').text();
              const discription = $(el).find('.card-blog-post__headline').text();
              let obj = {
                "Id":idCounter++,
                "Site Name": "Barton Mallow ",
                "Title": title,
                "Date": date,
                "Discription": discription
              }
              ScrapeDatas.push(obj);
            }
          });
          break;

        //Website 9:
        case "https://www.jedunn.com/news-insights":
          $('.jet-listing-grid--11395 .jet-listing-grid__item .jet-engine-listing-overlay-wrap .elementor section .elementor-container .elementor-column .elementor-widget-wrap')
            .map((i, el) => {
              const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
              const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));
              if (keywordsCheck) {
                const titleElement = $(el).children('.elementor-element-78beb7b').children('div').find('.elementor-heading-title');
                const titleNodata = titleElement.length > 0 ? titleElement.text() : 'No Data Found';
                //Remove the null value and looping extra html
                if (titleNodata !== 'No Data Found') {
                  const title = titleNodata;
                  const date = "No date";
                  const discription = "No discription found"
                  let obj = {
                    "Id":idCounter++,
                    "Site Name": "JE Dunn ",
                    "Title": title,
                    "Date": date,
                    "Discription": discription
                  };
                  ScrapeDatas.push(obj);
                };
              };
            });
          break;

        //Website 10:
        case "https://www.clarkconstruction.com/news":
          $('.featured-news-wrapper').map((i, el) => {
            const cardContent = $(el).text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
            const keywordsCheck = keyWords.some(keyWords => cardContent.includes(keyWords));
            if (keywordsCheck) {
              const title = $(el).find('.views-field-title a').text();
              const date = $(el).find('.views-field-created').text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
              const discription = $(el).find('.views-field-body').text().trim().replace(/(\r\n|\n|\r|\t)/gm, " ");
              let obj = {
                "Id":idCounter++,
                "Site Name": "Clark Construction ",
                "Title": title,
                "Date": date,
                "Discription": discription
              }
              ScrapeDatas.push(obj);
            };
          });
          break;
        default:
          break;
      }

    }
    catch (error) {
      console.log("Error:", error);
    }
  }
        console.log(ScrapeDatas);
        // Google Sheet Auth and Bind the data in Google Sheet
        async function googleSheet(req, res) {
        const serviceAccountAuth = new JWT({
          email: creds.client_email,
          key: creds.private_key,
          scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
          ],
        });
        const doc = new GoogleSpreadsheet('1sDP8hGTuT2DQxLVJOueZ9GCxoM6r8YEqACf_GLrjejE', serviceAccountAuth);
        await doc.loadInfo(); // loads document properties and worksheets
        await doc.updateProperties({ title: 'Web scraping google Sheet' });
        const sheet = doc.sheetsByIndex[0]; // or use `doc.sheetsById[id]` or `doc.sheetsByTitle[title]`
        
        //Clear GoogleSheet old Datas
        await sheet.clear();
        //Header Data
        await sheet.setHeaderRow(HEADERS);
        //Scraping Data
        await sheet.addRows(ScrapeDatas);
        console.log(`😎 GoogleSheet is Updated successfully.\n Check the link: ${ScrapingGoogleSheet}`);
        };
        googleSheet();

        // Node mailer
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "josephherman810@gmail.com",
                pass: "auzwcuglmrhcnwyy"
            }
        });
        const mailOptions = {
            from: "josephherman810@gmail.com",
            to: "yenoklesin@gmail.com",
            subject: "NodeMailer Test",
            text: `Take your Data 😊: ${ScrapingGoogleSheet}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            error ? console.log(error) : console.log("Email send:" + info.response);
            console.log('Check your Email Web scraping is completed 😊');
        });
}
scrapeData();


