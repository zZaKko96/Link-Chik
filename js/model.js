export default class Model {
    constructor() {
        const savedLinks = JSON.parse(localStorage.getItem('links'));
        this.links = savedLinks || [];
        
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        
        let active = JSON.parse(sessionStorage.getItem('activeUser')) || JSON.parse(localStorage.getItem('activeUser')) || null;

        if (active && !active.id) {
            active.id = Date.now();
            this._saveActiveUser(active); 
			
            this.users = this.users.map(u => u.email === active.email ? active : u);
            this._commitUsers();
        }

        this.activeUser = active;
    }

    _saveActiveUser(userObj = this.activeUser) {
        if (sessionStorage.getItem('activeUser')) {
            sessionStorage.setItem('activeUser', JSON.stringify(userObj));
        } else if (localStorage.getItem('activeUser')) {
            localStorage.setItem('activeUser', JSON.stringify(userObj));
        }
    }

    _commit(links) {
        this.links = links;
        localStorage.setItem('links', JSON.stringify(this.links));
    }
	
	get userLinks() {
        if (!this.activeUser) return []; 
        return this.links.filter(link => link.userId === this.activeUser.id);
    }

    async addLink(originalUrl) {
        const shortUrl = await this._generateRealShortUrl(originalUrl);
        
        const newLink = {
            id: Date.now(),
            userId: this.activeUser ? this.activeUser.id : null, 
            originalUrl: originalUrl,
            shortUrl: shortUrl,
            clicks: 0
        };

        this._commit([...this.links, newLink]);
    }

    deleteLink(id) {
        this._commit(this.links.filter(link => link.id !== id));
    }

    async editLink(id, newOriginalUrl) {
        const newShortUrl = await this._generateRealShortUrl(newOriginalUrl);
        
        this.links = this.links.map(link => 
            link.id === id ? { ...link, originalUrl: newOriginalUrl, shortUrl: newShortUrl } : link
        );
        this._commit(this.links);
    }

    async _generateRealShortUrl(originalUrl) {
        try {
            const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(originalUrl)}`);
            const data = await response.json();
            
            if (data.shorturl) {
                return data.shorturl;
            } else {
                return 'Помилка API';
            }
        } catch (error) {
            console.error("Помилка мережі:", error);
            return 'Помилка мережі';
        }
    }
	
    incrementClick(id) {
        this.links = this.links.map(link => 
            link.id === id ? { ...link, clicks: link.clicks + 1 } : link
        );
        this._commit(this.links);
    }
	
    _commitUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    registerUser(name, email, password, gender, date) {
        const exists = this.users.find(u => u.email === email);
        if (exists) return { success: false, message: "Користувач з таким email вже існує!" };

        const regDate = new Date().toLocaleDateString('uk-UA');

        const newUser = { 
            id: Date.now(), 
            name, email, password, gender, date, regDate, 
            phone: '', photo: '' 
        };
        this.users.push(newUser);
        this._commitUsers();
        return { success: true };
    }

    loginUser(email, password, rememberMe) {
        const user = this.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.activeUser = user;
            
            if (rememberMe) {
                localStorage.setItem('activeUser', JSON.stringify(user));
            } else {
                sessionStorage.setItem('activeUser', JSON.stringify(user));
            }
            return { success: true };
        }
        return { success: false, message: "Невірний email або пароль!" };
    }

    logoutUser() {
        this.activeUser = null;
        localStorage.removeItem('activeUser');
        sessionStorage.removeItem('activeUser');
    }
	
    updateUser(newName, newEmail, newPhone, newGender, newDate) {
        if (this.activeUser) {
            const oldEmail = this.activeUser.email; 

            this.activeUser.name = newName || this.activeUser.name;
            this.activeUser.email = newEmail || this.activeUser.email;
            this.activeUser.phone = newPhone || this.activeUser.phone;
            this.activeUser.gender = newGender || this.activeUser.gender;
            this.activeUser.date = newDate || this.activeUser.date;
            
            this.users = this.users.map(u => u.email === oldEmail ? this.activeUser : u);
            this._commitUsers();
            this._saveActiveUser();
        }
    }

    updateUserPhoto(photoUrl) {
        if (this.activeUser) {
            this.activeUser.photo = photoUrl;
            this.users = this.users.map(u => u.email === this.activeUser.email ? this.activeUser : u);
            this._commitUsers();
            this._saveActiveUser(); 
        }
    }

    deleteActiveUser() {
        if (this.activeUser) {
            this.users = this.users.filter(u => u.email !== this.activeUser.email);
            this._commitUsers();
            this.logoutUser(); 
        }
    }
	
	getUserStats() {
        const myLinks = this.userLinks;
        const totalLinks = myLinks.length;
        const totalClicks = myLinks.reduce((sum, link) => sum + Number(link.clicks || 0), 0);
        
        return { totalLinks, totalClicks };
    }
}