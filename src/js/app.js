const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const requiredMessage = "The field is required";
const requiredMessageRu = "Вы не заполнили поле";

const validators = {
    required(value) {
        return !value.trim();
    },
    email(value) {
        return !EMAIL_REGEXP.test(value);
    },
};

function getRequiredMessage(lang) {
    if (lang === "ru") {
        return requiredMessageRu;
    }

    return requiredMessage;
}

function getPageLanguage() {
    const language = document.documentElement.lang;

    if (language === "ru") {
        return "ru";
    }

    return "en";
}

function updateViewportHeight() {
    document.documentElement.style.setProperty(
        "--vh",
        `${getViewportHeight()}px`
    );

    function getViewportHeight() {
        return window.innerHeight * 0.01;
    }
}

function getCommonErrorLabel(code, lang) {
    if (lang === "ru") {
        return getCommonErrorLabelRu(code);
    } else {
        return getCommonErrorLabelEn(code);
    }
}

function getCommonErrorLabelEn(code) {
    if (code === 404) {
        return "Server not found";
    } else if (code === 429) {
        return "Too Many Attempts";
    } else if (code >= 400 && code < 500) {
        return "Invalid Server Response";
    } else if (code >= 500) {
        return "Server Internal Error";
    } else {
        return "Unknown Error";
    }
}

function getCommonErrorLabelRu(code) {
    if (code === 404) {
        return "Сервер не найден";
    } else if (code === 429) {
        return "Слишком много попыток";
    } else if (code >= 400 && code < 500) {
        return "Неверный ответ сервера";
    } else if (code >= 500) {
        return "Внутренняя ошибка сервера";
    } else {
        return "Неизвестная ошибка";
    }
}

function isValidBody(body) {
    if (body.accessToken && body.refreshToken) {
        return body;
    }

    return false;
}

function resetCaptcha() {
    if (typeof RECAPTCHA_SITE_KEY !== 'undefined' && RECAPTCHA_SITE_KEY) {
        if (parseInt(RECAPTCHA_VERSION) === 2) {
            grecaptcha.reset();
            RECAPTCHA_TOKEN = null;
        }
    }
}

class LoginForm {
    constructor(el) {
        this.form = el;
        this.loader = document.querySelector(".loader");
        this.commonError = this.form.querySelector(".form__common-error");

        this.submitGoogleToken = this.submitGoogleToken.bind(this);
        this.addSubmitting = this.addSubmitting.bind(this);
        this.removeSubmitting = this.removeSubmitting.bind(this);

        this.init();
    }

    submitGoogleToken(idToken) {
        this.addSubmitting();

        fetch(API_BASE_URL + "/auth/admin/google", {
            method: "POST",
            body: JSON.stringify({idToken}),
            mode: "cors",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        })
            .then((response) => {
                if (response.ok) {
                    this.commonError.textContent = "";
                    return response.json();
                }

                if (response.status === 404) {

                    let error;
                    if (getPageLanguage() === "ru") {
                        error = "Сервер не поддерживает Google авторизацию";
                    } else {
                        error = "Server doesn't support Google Authentication";
                    }

                    this.commonError.textContent = error;

                } else {

                    this.commonError.textContent = getCommonErrorLabel(
                        response.status,
                        getPageLanguage()
                    );
                }

            })
            .then((result) => {
                if (isValidBody(result.data)) {
                    localStorage.setItem("admin_access_token", result.data.accessToken);
                    localStorage.setItem("admin_refresh_token", result.data.refreshToken);
                    setTimeout(() => {
                        let redirectUrl = WEB_BASE_URL.startsWith('https://') || WEB_BASE_URL.startsWith('http://') ? WEB_BASE_URL : window.location.origin + WEB_BASE_URL;
                        redirectUrl = redirectUrl.endsWith('/') ? redirectUrl : redirectUrl + '/';
                        window.location.href = redirectUrl;
                    }, 100);
                } else {
                    let error;
                    if (getPageLanguage() === "ru") {
                        error = "Неверный ответ аутентификации";
                    } else {
                        error = "Invalid authentication response";
                    }
                    this.commonError.textContent = error;
                    resetCaptcha();
                }
            })
            .catch((error) => {
                this.removeSubmitting();
                if (error instanceof Error) {
                    if (error.toString().includes("Failed to fetch")) {
                        let errorText;
                        if (getPageLanguage() === "ru") {
                            errorText = "Сервис недоступен";
                        } else {
                            errorText = "Service is not available";
                        }
                        this.commonError.textContent = errorText;
                    }
                }
            });
    }

    addSubmitting() {
        this.loader.classList.add("show");
    }

    removeSubmitting() {
        this.loader.classList.remove("show");
    }

    captchaPromise() {
        return new Promise(resolve => {
            if (typeof RECAPTCHA_SITE_KEY === 'undefined' || !RECAPTCHA_SITE_KEY) {
                resolve();
            } else {
                if (parseInt(RECAPTCHA_VERSION) === 2) {
                    if (RECAPTCHA_INVISIBLE) {
                        RECAPTCHA_TOKEN = null;
                        grecaptcha.execute().then(() => {
                            const timer = setInterval(() => {
                                if (RECAPTCHA_TOKEN) {
                                    resolve(RECAPTCHA_TOKEN);
                                    clearInterval(timer);
                                    grecaptcha.reset();
                                }
                            }, 50);
                        }).catch(error => {
                            console.log(error);
                        });
                    } else {
                        resolve(RECAPTCHA_TOKEN);
                    }
                } else {
                    grecaptcha.ready(() => {
                        try {
                            grecaptcha.execute(RECAPTCHA_SITE_KEY, {action: 'login'}).then(token => {
                                resolve(token);
                            }).catch(e => {
                                this.removeSubmitting();

                                let error;
                                if (getPageLanguage() === "ru") {
                                    error = "Ошибка установки reCAPTCHA v3";
                                } else {
                                    error = "Failure install reCAPTCHA v3";
                                }

                                this.commonError.textContent = error;
                            });
                        } catch (e) {
                            this.removeSubmitting();

                            let error;
                            if (e.toString().includes('Invalid site key or not loaded')) {
                                if (getPageLanguage() === "ru") {
                                    error = "Неверный ключ reCAPTCHA v3";
                                } else {
                                    error = "Invalid site key reCAPTCHA v3";
                                }
                            } else {
                                if (getPageLanguage() === "ru") {
                                    error = "Ошибка установки reCAPTCHA v3";
                                } else {
                                    error = "Failure install reCAPTCHA v3";
                                }
                            }

                            this.commonError.textContent = error;
                        }
                    });
                }
            }
        })
    }

    submit() {
        this.addSubmitting();

        this.captchaPromise().then(token => {

            const values = this.getFormValues();

            const data = {
                email: values.login,
                password: values.password,
            };

            if (typeof RECAPTCHA_SITE_KEY !== 'undefined' && RECAPTCHA_SITE_KEY) {
                data.recaptchaToken = token;
            }

            fetch(API_BASE_URL + "/auth/admin", {
                method: "POST",
                body: JSON.stringify(data),
                mode: "cors",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            })
                .then((response) => {
                    if (response.ok) {
                        this.commonError.textContent = "";
                        return response.json();
                    }

                    response.json().then(result => {

                        if (response.status === 422 && result.errors && result.errors.recaptchaToken) {

                            let error;
                            if (getPageLanguage() === "ru") {
                                error = "Вы робот?";
                            } else {
                                error = "Are you robot?";
                            }

                            this.commonError.textContent = error;

                        } else if (response.status === 400 || response.status === 422) {
                            this.commonError.textContent = "";

                            let error;
                            if (getPageLanguage() === "ru") {
                                error = "Неверный пароль";
                            } else {
                                error = "Invalid credentials";
                            }
                            this.form.elements.password.nextElementSibling.textContent = error;

                            resetCaptcha();
                        } else {
                            this.commonError.textContent = getCommonErrorLabel(
                                response.status,
                                getPageLanguage()
                            );

                            resetCaptcha();
                        }
                    });
                })
                .then((result) => {
                    if (isValidBody(result.data)) {
                        localStorage.setItem("admin_access_token", result.data.accessToken);
                        localStorage.setItem("admin_refresh_token", result.data.refreshToken);
                        setTimeout(() => {
                            let redirectUrl = WEB_BASE_URL.startsWith('https://') || WEB_BASE_URL.startsWith('http://') ? WEB_BASE_URL : window.location.origin + WEB_BASE_URL;
                            redirectUrl = redirectUrl.endsWith('/') ? redirectUrl : redirectUrl + '/';
                            window.location.href = redirectUrl;
                        }, 100);
                    } else {
                        let error;
                        if (getPageLanguage() === "ru") {
                            error = "Неверный ответ аутентификации";
                        } else {
                            error = "Invalid authentication response";
                        }
                        this.commonError.textContent = error;
                        resetCaptcha();
                    }
                })
                .catch((error) => {
                    this.removeSubmitting();
                    if (error instanceof Error) {
                        if (error.toString().includes("Failed to fetch")) {
                            let errorText;
                            if (getPageLanguage() === "ru") {
                                errorText = "Сервис недоступен";
                            } else {
                                errorText = "Service is not available";
                            }
                            this.commonError.textContent = errorText;
                        }
                    }
                });
        })
    }

    validate() {
        const values = this.getFormValues();
        const errors = {};

        if (validators.required(values.login)) {
            errors.login = getRequiredMessage(getPageLanguage());
        }

        if (validators.required(values.password)) {
            errors.password = getRequiredMessage(getPageLanguage());
        }

        return errors;
    }

    getInputCollection() {
        return this.form.querySelectorAll("input");
    }

    getFormValues() {
        const values = {};

        this.getInputCollection().forEach((input) => {
            values[input.name] = input.value;
        });

        return values;
    }

    syncErrors(errors) {
        this.getInputCollection().forEach((input) => {
            input.nextElementSibling.textContent = errors[input.name] || "";
        });

        this.commonError.textContent = "";
    }

    init() {
        this.form.addEventListener("submit", (e) => {

            e.preventDefault();

            const errors = this.validate();

            this.syncErrors(errors);

            if (Object.keys(errors).length === 0) {
                this.submit();
            }
        });
    }
}

class LoginFormUI {
    static init() {
        LoginForm.form = new LoginForm(document.querySelector(".js-login-form"));
    }

    static initOnLoad() {
        document.addEventListener("DOMContentLoaded", this.init);
    }

    static submitGoogleToken(token) {
        LoginForm.form.submitGoogleToken(token);
    }
    static startLoader() {
        LoginForm.form.addSubmitting();
    }
    static stopLoader() {
        LoginForm.form.removeSubmitting();
    }
}

updateViewportHeight();
window.addEventListener("resize", () => {
    updateViewportHeight();
});

LoginFormUI.initOnLoad();
window.LoginFormUI = LoginFormUI;
