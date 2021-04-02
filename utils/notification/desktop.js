import notifier from 'node-notifier';
import moment from "moment";
import { DESKTOP } from '../../main.js';

export default async function sendAlertToDesktop(product_url, title, image, store) {
	if (DESKTOP) {
		console.info(moment().format('LTS') + ": Sending desktop alert")

		notifier.notify({
			title: '***** In Stock at ' + store + ' *****',
			message: title,
			icon: image,
			sound: true,
			open: product_url,
			wait: true
		});
	}
}