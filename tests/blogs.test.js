const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:5001');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const labelText = await page.getContentsOf('form label:first-child');
        expect(labelText).toBe('Blog Title');
    });

    describe('And using valid inputs', () => {
        beforeEach(async () => {
            await page.waitFor('form');
            await page.type('form .title input', 'My Title');
            await page.type('form .content input', 'My Content');
            await page.click('form button');
        });

        test('submitting takes user to review screen', async () => {
            const text = await page.getContentsOf('h5');
            expect(text).toBe('Please confirm your entries');
        });

        test('submitting then saving adds blog to index page', async () => {
            await page.click('button.green');
            await page.waitFor('.card');
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');
            expect(title).toBe('My Title');
            expect(content).toBe('My Content');
        });
        
        test('the form doeson`t show an error message', async () => {
            const titleError = await page.$('.title .red-text');
            const contentError = await page.$('.content .red-text');
            expect(titleError).toBeFalsy();
            expect(contentError).toBeFalsy();
        });
    });

    describe('And using invalid inputs', () => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('the forms shows an error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toBe('You must provide a value');
            expect(contentError).toBe('You must provide a value');
        });

        test('user stays on the same page', async () => {
            const labelText = await page.getContentsOf('form label:first-child');
            expect(labelText).toBe('Blog Title');
        });
    });
});

describe('When logged out', () => {
    test('User cannot create blog posts', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('http://localhost:5001/api/blogs', {
                    method: 'post',
                    credentials: 'same-origin',
                    body: JSON.stringify({ content: 'content', title: 'title'}),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => response.status);
            }
        );
        expect(result).toBe(401);
    });

    test('User cannot get blog posts', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('http://localhost:5001/api/blogs', {
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(response => response.status);
            }
        );
        expect(result).toBe(401);
    });
});