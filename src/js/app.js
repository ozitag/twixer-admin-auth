const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const requiredMessage = 'Вы не заполнили поле';

const validators = {
    required(value) {
        return !value.trim();
    },
    email(value) {
        return !EMAIL_REGEXP.test(value);
    },
};

function deleteElement(el) {
    el.parentNode.removeChild(el);
}

class LoginForm {
    constructor(nodeElement) {
        this.nodeElement = nodeElement;

        this.loginField = this.nodeElement.elements.login;
        if (!this.loginField) {
            throw new Error('Поле ввода логина не найдено');
        }

        this.passwordField = this.nodeElement.elements.password;
        if (!this.passwordField) {
            throw new Error('Поле ввода пароля не найдено');
        }

        this.submitButton = this.nodeElement.querySelector('.form__button');
        if (!this.submitButton) {
            throw new Error('Кнопка субмита не найдена');
        }

        this.init();
    }

    addSubmitting() {
        this.submitButton.classList.add('submitting');
        this.submitButton.disabled = true;
    }

    removeSubmitting() {
        this.submitButton.classList.remove('submitting');
        this.submitButton.disabled = false;
    }

    submit() {
        const login = this.loginField.value;
        const password = this.passwordField.value;

        const data = {
            login: login,
            password: password,
        };

        fetch('https://httpbin.org/post', {
            method: 'POST',
            body: JSON.stringify(data)
        }).then(response => {
            this.addSubmitting();
            return response.json();
        }).then(() => {
            setTimeout(() => {
                this.removeSubmitting();
            }, 2000)
        }).catch((errors) => {
            this.removeSubmitting();
            throw new Error(errors);
        });
    }

    validate(loginValue, passwordValue) {
        const errors = {};

        if (validators.required(loginValue)) {
            errors.login = requiredMessage;
        } else if (validators.email(loginValue)) {
            errors.login = 'Неверный формат email';
        }

        if (validators.required(passwordValue)) {
            errors.password = requiredMessage;
        }

        return errors;
    }

    buildErrorHtml(parent, error) {
        const container = document.createElement('span');
        container.classList.add('form__error');
        container.innerText = error;
        parent.appendChild(container);
    }

    removeErrorsHtml() {
        const errors = document.querySelectorAll('.form__error');
        if (!errors) return;
        errors.forEach(error => {
            deleteElement(error);
        })
    }

    init() {
        this.nodeElement.addEventListener('submit', e => {
            e.preventDefault();

            const errors = this.validate(this.loginField.value, this.passwordField.value);
            console.log('errors', errors);
            const loginContainer = this.loginField.parentNode;
            const passwordContainer = this.passwordField.parentNode;

            if (errors.login) {
                const loginError = loginContainer.querySelector('.form__error');
                if(!loginError) {
                    this.buildErrorHtml(loginContainer, errors.login)
                } else if (loginError.innerText !== errors.login) {
                    loginError.innerText = errors.login;
                }
                return new Error(errors.login);
            }

            if (errors.password) {
                const passwordError = passwordContainer.querySelector('.form__error');
                if(!passwordError) {
                    this.buildErrorHtml(passwordContainer, errors.password)
                }
                return new Error(errors.password);
            }

            this.removeErrorsHtml();
            this.submit();
        })
    }
}

class LoginFormUI {
    static init() {
        document.querySelectorAll('.js-login-form').forEach(elem => {
            if (elem.dataset.initialized) {
                return;
            }

            elem.dataset.initialized = true;
            new LoginForm(elem);
        })
    }

    static initOnLoad() {
        document.addEventListener('DOMContentLoaded', this.init);
    }
}

LoginFormUI.initOnLoad();
window.LoginFormUI = LoginFormUI;
