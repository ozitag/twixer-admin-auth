// import "regenerator-runtime/runtime";
// import "core-js"; // or a more selective import such as "core-js/es/array"

const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const requiredMessage = 'The field is required';

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
        this.loader = document.querySelector('.loader');

        this.init();
    }

    addSubmitting() {
        this.loader.classList.add('show');
    }

    removeSubmitting() {
        this.loader.classList.remove('show');
    }

     submit() {
        const values = this.getFormValues();

         this.addSubmitting();
         fetch('https://httpbin.org/post', {
            method: 'POST',
            body: JSON.stringify(values)
        }).then((response) => {
            if (response.access_token) {
                localStorage.setItem('accessToken', response.access_token);
            }

             if (response.refresh_token) {
                 localStorage.setItem('accessToken', response.refresh_token);
             }
        }).catch((error) => {
             console.error(error);
         }).finally(() => {
             this.removeSubmitting();
         });
    }

    validate() {
        const values = this.getFormValues()
        const errors = {};

        if (validators.required(values.login)) {
            errors.login = requiredMessage;
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
