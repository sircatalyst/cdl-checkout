const express = require('express');
const https = require('https');
const fs = require('fs');
const { promisify } = require('util');

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);

const app = express();

const downloadAndModify = async (url, filePath) => {
	try {
		const data = await new Promise((resolve, reject) => {
			https.get(url, (response) => {
				if (response.statusCode !== 200) {
					reject(new Error(`Failed to download file: ${response.statusCode}`));
				} else {
					let data = '';
					response.on('data', (chunk) => {
						data += chunk;
					});
					response.on('end', () => {
						resolve(data);
					});
				}
			}).on('error', (err) => {
				reject(err);
			});
		});

		const modifiedData = data.replace(/Connect/g, 'Connect2');
		await writeFileAsync(filePath, modifiedData);
		console.log('File has been saved with modifications.');
	} catch (error) {
		console.error('Error:', error.message);
	}
};

app.get('/', async (req, res) => {
	const url = 'https://checkout.creditdirect.ng/bnpl/checkout.min.js';
	const filePath = 'modified_connect.js';

	try {
		await downloadAndModify(url, filePath);
		const data = await readFileAsync('modified_connect.js');
		res.type('application/javascript').send(data);
	} catch (err) {
		res.status(500).send(`Error: ${err.message}`);
	}
});

app.listen(3100, () => {
	console.log('Server is running on port 3100');
});
