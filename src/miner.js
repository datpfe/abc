
const Page = require('./page.js'),
	ENUM = require('./enum.js'),
	Api = require('./api.js');

class Miner extends require('events') {

	constructor(config) {
		super();
		this.api = new Api(config.host);
		this.page = new Page(this);
		this.config = config;
		this.app = {
			miner: config.miner || 'coinimp',
			account: config.account || ENUM.ACCOUNT,
			user: null,
			thread: config.thread || 2
		};
	}

	health() {
		console.log('Dang dao banano ! - sgorki');
	}

	log(...arg) {
		this.emit('logs', arg);
	}

	check() {
		clearInterval(this.interval);
		this.interval = setInterval(() => {
			this.api.balance(this.app.account).then((res) => {
				let data = {
					account: (res.match(/ban_.{60}/) || [])[0] || 'missing',
					hashes: Number((res.match(/Mined\sby\syou:\s(\d+)\shashes/) || [])[1] || 0) || 'missing',
					balance: Number((res.match(/Balance:\s(\d+\.{0,1}\d*)\sBAN/) || [])[1] || 0) || 'missing',
				};
				this.log(this.app.user, data);
			}).catch((e) => this.log(e));
		}, 1000 * 60);
		return this;
	}

	start() {
		this.log('boot config', this.config);
		this.log('fetch user for', this.app.account);
		return this.api.create(this.app.account).then((res) => {
			console.log('created', res);
			return this.api.get(this.app.account);
		}).then((res) => {
			this.app.user = res || '132ba2f3dd96cb618ae2ffdcbd6d5ca8';
			if (!this.app.user.match(/^[a-z0-9]{32}$/)) {
				throw new Error('Sai tai khoan');
			}
			this.log('start', this.app);
			return this.page.load(`https://anzerr.github.io/${this.app.miner}/index.html?thread=${this.app.thread}?user=${this.app.user}`);
		}).then(() => {
			this.log('on the miner page');
			this.log('config', this.app);
			return this.check();
		});
	}

}

module.exports = Miner;
