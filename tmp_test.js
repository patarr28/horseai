
const { getExpertPicksByHorse } = require('./lib/tipsters');
require('dotenv').config({ path: '.env.local' });

async function test() {
    try {
        console.log("Testing getExpertPicksByHorse...");
        const result = await getExpertPicksByHorse('today');
        console.log("Result success:", !!result);
    } catch (e) {
        console.error("Caught error:", e);
    }
}

test();
