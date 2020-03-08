/* 
Notes:
we're including Axios, as vanilla Fetch runs into some CORS issues when run locally.
*/
const profs = {
	'Mesmer': 'https://render.guildwars2.com/file/B2D21D2FFDB5C95CDC72B91BB02F60080F0F463D/716638.png',
	'Elementalist': 'https://render.guildwars2.com/file/0303027C1F73E97F5F011ECFCE9C9A40767BB747/716633.png',
	'Necromancer': 'https://render.guildwars2.com/file/08BD360F557115260FA4D71E6F76ACCCF59FF70F/716639.png',
	'Thief': 'https://render.guildwars2.com/file/5C092FE9351A2DF820B1B5719B5F5097D20633EE/716644.png',
	'Ranger': 'https://render.guildwars2.com/file/9BFA11F4D5114FBF11AFBEF00F249C3934AD62AD/716643.png',
	'Engineer': 'https://render.guildwars2.com/file/1E90D49793D5BAFDE2DFDC95089FDF9A997401F1/716634.png',
	'Guardian': 'https://render.guildwars2.com/file/28D46E95F70834CE45640375FCDB0DEAF198325B/716635.png',
	'Revenant': 'https://render.guildwars2.com/file/FF240FFCF7D86A0436450FB610AB21716D5B6AA7/965716.png',
	'Warrior': 'https://render.guildwars2.com/file/09903302A30373E52F49CBA948D4A268D30A5E39/716647.png'
},
	v = new Vue({
		data: {
			acceptedCookie: localStorage && !!localStorage.gw2OrgCookie,
			apiKey: (localStorage && localStorage.gw2OrgCookie && localStorage.gw2OrgCookie != 'true' && localStorage.gw2OrgCookie) || '',
			keyOkay: false,
			chars: [],
			sorter: {
				col: 'name',
				rev: false,
			},
			loaded: false,
		},
		methods: {
			acceptCookie() {
				localStorage.gw2OrgCookie = 'true';
				this.acceptedCookie = true;
			},
			explApi() {
				bulmabox.alert('API Key', `An API (Application Programming Interface) key allows you to access particular information about your account. It's perfectly safe (it's read-only!). <hr>Head on over to <a href='http://account.arena.net/'>the official ArenaNet site</a> to grab a key! You'll need the Characters and Inventories permissions.`)
			},
			checkKey() {
				console.log('KEY is',this.apiKey)
				if(!this.apiKey || !localStorage.gw2OrgCookie){
					return false;
				}
				return false
				axios.get('https://api.guildwars2.com/v2/tokeninfo?access_token=' + this.apiKey).then(r => {
					this.loaded = true;
					if (r.status == 401 || r.status == 404 || r.status == 403) {
						this.keyOkay = false;
						throw new Error('invalid key');
					} else {
						this.keyOkay = true;
						this.applyKey();
					}
				}).catch(e => {
					bulmabox.alert('Invalid API Key', `Sorry, but we can't seem to read your API key!`)
				})
			},
			changeSort(c) {
				if (this.sorter.col == c) {
					this.sorter.rev = !this.sorter.rev;
				} else {
					this.sorter.col = c;
					this.sorter.rev = false;
				}
			},
			replaceKey() {
				const testKey = this.apiKey
				axios.get('https://api.guildwars2.com/v2/tokeninfo?access_token=' + this.apiKey).then(r => {
					if (r.status == 401 || r.status == 404 || r.status == 403) {
						this.keyOkay = false;
						throw new Error('invalid key');
					} else {
						this.acceptedCookie = this.apiKey;
						localStorage.gw2OrgCookie = this.apiKey;
						this.applyKey();
					}
				}).catch(e => {
					bulmabox.alert('Invalid API Key', `Sorry, but we can't seem to read your API key!`)
				})
			},
			applyKey() {
				axios.get('https://api.guildwars2.com/v2/characters?ids=all&access_token=' + this.apiKey)
					.then(chs => {
						console.log('Chars are', chs)
						this.chars = chs.data.map(q => {
							q.bagStats = new Array(10).fill(1).map((b, i) => {
								const bg = {
									used: false,
									size: 0,
									filled: 0,
									hasSlot: false
								};
								if (!!q.bags[i] || q.bags[i] === null) {
									bg.hasSlot = true;
								}
								if (!!q.bags[i]) {
									bg.used = true,
										bg.size = q.bags[i].size,
										bg.filled = q.bags[i].inventory.filter(a => a !== null).length;
								}
								return bg;
							});
							console.log(q.bagStats, 'for', q.name)
							q.bagTotals = {
								max: q.bagStats.filter(a => a && a.hasSlot && a.size && a.size == 32).length,
								used: q.bagStats.filter(b => b && b.hasSlot && b.used).length,
								totalSlots: q.bagStats.filter(c => c && !!c.hasSlot).length,
								usedFilled: q.bagStats.filter(d => d && d.used && d.filled == d.size).length
							}
							return q;
						});
					})
			}
		},
		created: function () {
			this.checkKey();
		},
		computed: {
			charsSorted() {
				const revVal = this.sorter.rev ? -1 : 1;
				return this.chars.sort((a, b) => {
					const val = (a[this.sorter.col] > b[this.sorter.col]) ? 1 : (a[this.sorter.col] < b[this.sorter.col]) ? -1 : 0;
					return val * revVal;
				})
			}
		}
	}).$mount('#main')