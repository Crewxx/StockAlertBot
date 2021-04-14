import fs from 'fs';
import tmp from "tmp"
import open from "open"
import moment from "moment";
import axios from 'axios';
import notifier from 'node-notifier';
import { DESKTOP } from '../../main.js';
import writeErrorToFile from '../writeToFile.js'

export default async function sendAlertToDesktop(product_url, title, image, store) {
	if (DESKTOP) {
		console.info(moment().format('LTS') + ": Sending desktop alert")

		tmp.file({prefix: store + '-', postfix: '.jpg'}, async function (err, path) {
			if (err) throw err;

			console.log(path)

			const downloadImage = async () => {
				const photoWriter = fs.createWriteStream(path)
				const response = await axios.get(image, {responseType: 'stream'})
					.catch(function (error) {
						writeErrorToFile(store, error);
					});

				if (response && response.status == 200 && response.data) {
					response.data.pipe(photoWriter)
					return new Promise((resolve, reject) => {
						photoWriter.on('finish', resolve)
						photoWriter.on('error', reject)
					})
				}
			}
		
			await downloadImage();
			
			notifier.notify({
				title: '***** In Stock at ' + store + ' *****',
				message: title,
				subtitle: 'Stock Alert Bot',
				icon: path,
				contentImage: image,
				open: product_url,
				sound: true,	// Only Notification Center or Windows Toasters
				wait: true		// Wait with callback
			},
			function (error, response, metadata) {
			  console.log('cb', response, metadata);
			});
	
			// Triggers if `wait: true` and user clicks notification
			notifier.on('click', function (notifierObject, options, event) {
				console.log('opening')
				open(product_url)
			});
	
			// Triggers if `wait: true` and notification closes
			notifier.on('timeout', function (notifierObject, options) {
				console.log('timeout')
			});
		});
	}
}