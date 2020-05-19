// import "regenerator-runtime/runtime";
// import "core-js"; // or a more selective import such as "core-js/es/array"

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

class LoginForm {
    constructor(el) {
        this.form = el;

        this.loginField = this.form.elements.login;
        this.passwordField = this.form.elements.password;
        this.submitButton = this.form.querySelector('.form__button');

        this.init();
    }

    addSubmitting() {
        this.form.classList.add('submitting');
        this.submitButton.disabled = true;
        this.loginField.disabled = true;
        this.passwordField.disabled = true;
    }

    removeSubmitting() {
        this.form.classList.remove('submitting');
        this.submitButton.disabled = false;
        this.loginField.disabled = false;
        this.passwordField.disabled = false;
    }

     submit() {
        const values = this.getFormValues();

         this.addSubmitting();
         fetch('https://httpbin.org/post', {
            method: 'POST',
            body: JSON.stringify(values)
        }).then((response) => {
            localStorage.setItem('accessToken', response.access_token);
            localStorage.setItem('refreshToken', response.refresh_token);
        }).catch(() => {
             console.log('123');
         }).finally(() => {
             this.removeSubmitting();
         });
    }

    validate() {
        const values = this.getFormValues()
        const errors = {};

        if (validators.required(values.login)) {
            errors.login = requiredMessage;
        } else if (validators.email(values.login)) {
            errors.login = 'Неверный формат email';
        }

        if (validators.required(values.password)) {
            errors.password = requiredMessage;
        }

        return errors;
    }

    getInputCollection() {
        return  this.form.querySelectorAll('input');
    }

    getFormValues() {
        const values = {};

        this.getInputCollection().forEach(input => {
            values[input.name] = input.value;
        })

        return values;
    }

    syncErrors(errors){
        this.getInputCollection().forEach(input => {
            input.nextElementSibling.textContent = errors[input.name] || '';
        })
    }

    init() {
        this.form.addEventListener('submit', e => {
            e.preventDefault();

            const errors = this.validate();

            this.syncErrors(errors);

            if (Object.keys(errors).length === 0) {
                this.submit();
            }
        })
    }
}

class LoginFormUI {
    static init() {
        document.querySelectorAll('.js-login-form').forEach(elem => {
            new LoginForm(elem);
        })
    }

    static initOnLoad() {
        document.addEventListener('DOMContentLoaded', this.init);
    }
}

LoginFormUI.initOnLoad();
window.LoginFormUI = LoginFormUI;
