export default class View {
    constructor() {
        this.input = document.querySelector('input[type="url"]');
        this.addBtn = document.querySelector('.btn-primary.px-4');
        this.linkList = document.querySelector('#links-body');
    }

    get _urlText() {
        return this.input.value;
    }

    _resetInput() {
        this.input.value = '';
    }

    displayLinks(links) {
		if (!this.linkList) return;
		
		if (!links || links.length === 0) {
            this.linkList.innerHTML = `<tr><td colspan="4" class="text-center text-muted">Увійдіть, щоб побачити свої посилання</td></tr>`;
            return;
        }
		
        this.linkList.innerHTML = '';

        if (links.length === 0) {
            this.linkList.innerHTML = `
                <tr><td colspan="4" class="text-center text-muted">Немає збережених посилань. Скоротіть своє перше посилання!</td></tr>`;
            return;
        }

        links.forEach(link => {
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td class="text-truncate" style="max-width: 300px;">${link.originalUrl}</td>
				<td><a href="${link.shortUrl}" target="_blank" class="short-link" data-id="${link.id}">${link.shortUrl}</a></td>
                <td>${link.clicks}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-secondary copy-btn" data-url="${link.shortUrl}" title="Копіювати"><i class="bi bi-clipboard"></i></button>
                    <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${link.id}" data-original="${link.originalUrl}" title="Редагувати"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${link.id}" title="Видалити"><i class="bi bi-trash"></i></button>
                </td>
            `;
            this.linkList.append(tr);
        });
    }

    bindAddLink(handler) {
		if (!this.addBtn) return;
        this.addBtn.addEventListener('click', () => {
            if (this._urlText) {
                handler(this._urlText);
                this._resetInput();
            }
        });
    }

    bindDeleteLink(handler) {
		if (!this.linkList) return;
        this.linkList.addEventListener('click', event => {
            const deleteBtn = event.target.closest('.delete-btn');
            if (deleteBtn) {
                handler(Number(deleteBtn.dataset.id));
            }
        });
    }

    bindEditLink(handler) {
		if (!this.linkList) return;
        this.linkList.addEventListener('click', event => {
            const editBtn = event.target.closest('.edit-btn');
            if (editBtn) {
                const id = Number(editBtn.dataset.id);
                const oldUrl = editBtn.dataset.original;
                
                const newUrl = prompt('Введіть нове довге посилання:', oldUrl);
                
                if (newUrl && newUrl !== oldUrl) {
                    handler(id, newUrl);
                }
            }
        });
    }

    bindCopyLink() {
		if (!this.linkList) return;
        this.linkList.addEventListener('click', event => {
            const copyBtn = event.target.closest('.copy-btn');
            if (copyBtn) {
                const shortUrl = copyBtn.dataset.url;
                
                navigator.clipboard.writeText(shortUrl).then(() => {
                    alert('Скопійовано: ' + shortUrl);
                });
            }
        });
    }
	
    bindClickShortLink(handler) {
		if (!this.linkList) return;
        this.linkList.addEventListener('click', event => {
            if (event.target.classList.contains('short-link')) {
                const id = Number(event.target.dataset.id);
                handler(id);
            }
        });
    }
	
    bindRegister(handler) {
        const regBtn = document.querySelector('#reg-btn');
        if (!regBtn) return;

        regBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            const name = document.querySelector('#reg-name').value;
            const email = document.querySelector('#reg-email').value;
            const pass = document.querySelector('#reg-pass').value;
            const confirmPass = document.querySelector('#reg-pass-confirm').value; 
            
            const genderSelect = document.querySelector('#floatingSelect');
            const genderText = genderSelect.options[genderSelect.selectedIndex].text;
            
            const rawDate = document.querySelector('#floatingDate').value;
            let formattedDate = '';
            if (rawDate) {
                const parts = rawDate.split('-');
                formattedDate = `${parts[2]}.${parts[1]}.${parts[0]}`;
            }

            const terms = document.querySelector('#reg-terms')?.checked;

            if (name && email && pass && confirmPass && genderText !== "Оберіть..." && formattedDate && terms) {
                
                if (pass !== confirmPass) {
                    alert("Помилка! Паролі не збігаються. Спробуйте ще раз.");
                    document.querySelector('#reg-pass-confirm').value = '';
                    return; 
                }

                handler(name, email, pass, genderText, formattedDate);
                
            } else {
                alert("Помилка! Заповніть усі поля, оберіть стать, дату і поставте галочку!");
            }
        });
    }

    bindLogin(handler) {
        const loginBtn = document.querySelector('#login-btn');
        if (!loginBtn) return;

        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = document.querySelector('#login-email').value;
            const pass = document.querySelector('#login-pass').value;
            
            // Шукаємо чекбокс за його value, бо в нього немає id
            const rememberCheckbox = document.querySelector('input[value="remember-me"]');
            const isRemembered = rememberCheckbox ? rememberCheckbox.checked : false;

            // Передаємо статус галочки у Controller
            if (email && pass) handler(email, pass, isRemembered);
            else alert("Введіть email та пароль!");
        });
    }

    updateHeader(activeUser) {
        const profileLink = document.querySelector('a[href="profile.html"]');
        const loginLink = document.querySelector('a[href="login.html"]');

        if (activeUser && profileLink && loginLink) {
            profileLink.innerHTML = `<i class="bi bi-person-circle"></i> ${activeUser.name}`;
            loginLink.textContent = "Вихід";
            loginLink.id = "logout-btn"; 
            loginLink.href = "#"; 
        }
    }

    bindLogout(handler) {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'logout-btn') {
                e.preventDefault();
                handler();
            }
        });
    }
	
    displayProfile(user) {
        const container = document.querySelector('#profile-container');
        const profTitle = document.querySelector('#prof-title');
        const profName = document.querySelector('#prof-name');
        const profEmail = document.querySelector('#prof-email');
        const profPhone = document.querySelector('#prof-phone'); 
        const profGender = document.querySelector('#prof-gender');
        const profDate = document.querySelector('#prof-date');
        const profRegDate = document.querySelector('#prof-reg-date');
        const profAvatar = document.querySelector('#prof-avatar'); 
		
        const statsLinks = document.querySelector('#stats-links-count');
        const statsClicks = document.querySelector('#stats-clicks-count');

        if (container) {
            if (user) {
                container.style.display = 'block';

                if (profTitle) profTitle.textContent = user.name;
                if (profName) profName.textContent = user.name;
                if (profEmail) profEmail.textContent = user.email;
                if (profPhone) profPhone.textContent = user.phone || 'Не вказано';
                if (profGender) profGender.textContent = user.gender || 'Не вказано';
                if (profDate) profDate.textContent = user.date || 'Не вказано';
                if (profRegDate) profRegDate.textContent = user.regDate || '';
				
                if (statsLinks) statsLinks.textContent = user.totalLinks || 0;
                if (statsClicks) statsClicks.textContent = user.totalClicks || 0;
                
                if (profAvatar && user.photo) {
                    profAvatar.src = user.photo;
                }
            } else {
                window.location.href = 'login.html';
                alert("Спочатку увійдіть у свій акаунт!");
            }
        }
    }
	
	bindEditProfile(handler) {
        const btn = document.querySelector('#btn-edit-profile');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const currentName = document.querySelector('#prof-name').textContent;
            const currentEmail = document.querySelector('#prof-email').textContent;
            const currentPhone = document.querySelector('#prof-phone').textContent;
            const currentGender = document.querySelector('#prof-gender').textContent;
            const currentDate = document.querySelector('#prof-date').textContent;

            const newName = prompt("Введіть нове ім'я:", currentName);
            if (newName === null) return;

            const newEmail = prompt("Введіть новий Email:", currentEmail);
            if (newEmail === null) return;

            const newPhone = prompt("Введіть новий номер телефону:", currentPhone !== 'Не вказано' ? currentPhone : "+380");
            if (newPhone === null) return;

            let newGender = prompt("Введіть стать (Чоловіча / Жіноча / Не вказувати):", currentGender);
            if (newGender === null) return;
            while (newGender !== "Чоловіча" && newGender !== "Жіноча" && newGender !== "Не вказувати") {
                newGender = prompt("Помилка! Дозволено ТІЛЬКИ: Чоловіча, Жіноча або Не вказувати", currentGender);
                if (newGender === null) return;
            }

            let newDate = prompt("Введіть дату народження (формат ДД.ММ.РРРР):", currentDate);
            if (newDate === null) return;
            const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/; 
            while (!dateRegex.test(newDate)) {
                newDate = prompt("Помилка! Формат має бути строго ДД.ММ.РРРР (наприклад, 04.03.2006):", currentDate);
                if (newDate === null) return;
            }
            
            handler(newName, newEmail, newPhone, newGender, newDate); 
        });
    }

    bindChangePhoto(handler) {
        const btn = document.querySelector('#btn-change-photo');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const photoUrl = prompt("Вставте пряме посилання (URL) на будь-яке фото з інтернету:");
            if (photoUrl) handler(photoUrl);
        });
    }

    bindDeleteAccount(handler) {
        const btn = document.querySelector('#btn-delete-account');
        if (!btn) return;
        btn.addEventListener('click', () => {
            const isSure = confirm("Ви впевнені, що хочете назавжди видалити свій акаунт?");
            if (isSure) handler();
        });
    }
}