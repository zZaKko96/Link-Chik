export default class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        this.view.displayLinks(this.model.userLinks);

        this.view.bindAddLink(this.handleAddLink);
        this.view.bindDeleteLink(this.handleDeleteLink);
        this.view.bindEditLink(this.handleEditLink); 
        this.view.bindCopyLink();        
        
        this.view.bindClickShortLink(this.handleShortLinkClick);
        
        this.view.updateHeader(this.model.activeUser);
        this.view.bindRegister(this.handleRegister);
        this.view.bindLogin(this.handleLogin);
        this.view.bindLogout(this.handleLogout);
        
        this.updateProfileWithStats();
        
        this.view.bindEditProfile(this.handleEditProfile);
        this.view.bindChangePhoto(this.handleChangePhoto);
        this.view.bindDeleteAccount(this.handleDeleteAccount);
    }

    updateProfileWithStats() {
        if (this.model.activeUser) {
            const links = this.model.userLinks || [];
            this.model.activeUser.totalLinks = links.length;
            this.model.activeUser.totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0);
        }
        
        this.view.displayProfile(this.model.activeUser);
    }

    handleAddLink = async (originalUrl) => {
        if (!this.model.activeUser) {
            alert("Тільки зареєстровані користувачі можуть скорочувати посилання!");
            return;
        }
        await this.model.addLink(originalUrl);
        this.view.displayLinks(this.model.userLinks);
        this.updateProfileWithStats(); 
    }

    handleDeleteLink = (id) => {
        this.model.deleteLink(id);
        this.view.displayLinks(this.model.userLinks);
        this.updateProfileWithStats();
    }

    handleEditLink = async (id, newUrl) => {
        await this.model.editLink(id, newUrl);
        this.view.displayLinks(this.model.userLinks); 
    }
    
    handleShortLinkClick = (id) => {
        this.model.incrementClick(id);
        this.view.displayLinks(this.model.userLinks);
        this.updateProfileWithStats(); 
    }
    
    handleRegister = (name, email, pass, gender, date) => {
        const result = this.model.registerUser(name, email, pass, gender, date);
        if (result.success) {
            alert("Реєстрація успішна! Увійдіть у систему.");
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    }

    handleLogin = (email, pass, remember) => {
        const result = this.model.loginUser(email, pass, remember);
        if (result.success) {
            window.location.href = 'index.html'; 
        } else {
            alert(result.message); 
        }
    }

    handleLogout = () => {
        this.model.logoutUser();
        window.location.href = 'login.html';
    }
    
    handleEditProfile = (newName, newEmail, newPhone, newGender, newDate) => {
        this.model.updateUser(newName, newEmail, newPhone, newGender, newDate);
        this.updateProfileWithStats(); 
        this.view.updateHeader(this.model.activeUser); 
    }

    handleChangePhoto = (photoUrl) => {
        this.model.updateUserPhoto(photoUrl);
        this.updateProfileWithStats(); 
    }

    handleDeleteAccount = () => {
        this.model.deleteActiveUser();
        alert("Акаунт успішно видалено!");
        window.location.href = 'register.html';
    }
}