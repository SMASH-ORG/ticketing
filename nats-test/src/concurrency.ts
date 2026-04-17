import axios from 'axios';
import crypto from 'crypto';
import * as https from "https";
import pLimit from 'p-limit';

const signupUrl = 'https://ticketing.testing/api/users/signup';
const createTicketUrl = 'https://ticketing.testing/api/tickets';


const main = async () => {

    const agent = new https.Agent({
        rejectUnauthorized: false
    });

    const res = await axios.post(signupUrl, {
        email: `user-${crypto.randomBytes(8).toString('hex')}@gmail.com`,
        password: '123456'
    }, {httpsAgent: agent});

    let sessionCookie = '';
    if (res.headers['set-cookie']) {
        res.headers['set-cookie'].forEach((cookie: string) => {
            const cookieName = cookie.split('=')[0];
            const cookieValue = cookie.split('=')[1].split(';')[0];
            if (cookieName === 'session') {
                sessionCookie = cookieValue;
            }
        })
        if (sessionCookie === '') {
            console.log('session cookie not found');
            return;
        }
    } else {
        console.log('no cookie');
        return;
    }

    const makeRequest = async (title: string, price: number) => {
        const ticketRes = await axios.post(createTicketUrl, {
            title,
            price
        }, {
            headers: {
                Cookie: `session=${sessionCookie}`
            },
            httpsAgent: agent
        });

        await axios.put(`${createTicketUrl}/${ticketRes.data.id}`, {
            title: `${title}-updated-1`,
            price: price + 1
        }, {
            headers: {
                Cookie: `session=${sessionCookie}`
            },
            httpsAgent: agent
        })

        await axios.put(`${createTicketUrl}/${ticketRes.data.id}`, {
            title: `${title}-updated-2`,
            price: price + 2
        }, {
            headers: {
                Cookie: `session=${sessionCookie}`
            },
            httpsAgent: agent
        })
    }


    const limit = pLimit(100);
    const tasks = [];
    for (let i = 0; i < parseInt(process.argv[2] || '100'); i++) {
        tasks.push(limit(() => makeRequest(`title-${i}`, 10)))
    }
    await Promise.all(tasks);

}

main()
