// import "regenerator-runtime/runtime";
// import "core-js"; // or a more selective import such as "core-js/es/array"

const EMAIL_REGEXP = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

const requiredMessage = "The field is required";

const validators = {
  required(value) {
    return !value.trim();
  },
  email(value) {
    return !EMAIL_REGEXP.test(value);
  },
};

function updateViewportHeight() {
  document.documentElement.style.setProperty(
    "--vh",
    `${getViewportHeight()}px`
  );

  function getViewportHeight() {
    return window.innerHeight * 0.01;
  }
}

function getCommonErrorLabel(code) {
  if (code === 404) {
    return "Server not found";
  } else if (code >= 400 && code < 500) {
    return "Invalid Server Response";
  } else if (code >= 500) {
    return "Server Internal Error";
  } else {
    return "Unknown Error";
  }
}

function isValidBody(body) {
  if (body.access_token && body.access_token) {
    return body;
  }

  return false;
}

class LoginForm {
  constructor(el) {
    this.form = el;
    this.loader = document.querySelector(".loader");
    this.commonError = this.form.querySelector(".form__common-error");

    this.init();
  }

  addSubmitting() {
    this.loader.classList.add("show");
  }

  removeSubmitting() {
    this.loader.classList.remove("show");
  }

  submit() {
    const values = this.getFormValues();
    const data = {
      grant_type: "password",
      client_id: "1",
      password: values.password,
      username: values.login,
      provider: "administrators",
    };

    this.addSubmitting();
    fetch("/api/oauth/token", {
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

        if (response.status === 400) {
          this.commonError.textContent = "";
          this.form.elements.password.nextElementSibling.textContent =
            "Invalid credentials";
          throw new Error("Invalid credentials");
        }

        this.commonError.textContent = getCommonErrorLabel(response.status);
        throw new Error(getCommonErrorLabel(response.status));
      })
      .then((result) => {
        if (isValidBody(result)) {
          localStorage.setItem("accessToken", result.access_token);
          localStorage.setItem("refreshToken", result.refresh_token);
          window.location.href = "/admin";
        } else {
          const error = "Invalid authentication response";
          this.commonError.textContent = error;
          throw new Error(error);
        }
      })
      .catch((error) => {
        this.removeSubmitting();
        if (error instanceof Error) {
          if (error.toString().includes("Failed to fetch")) {
            this.commonError.textContent = "Service is not available";
          }
        }
      });
  }

  validate() {
    const values = this.getFormValues();
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
    document.querySelectorAll(".js-login-form").forEach((elem) => {
      new LoginForm(elem);
    });
  }

  static initOnLoad() {
    document.addEventListener("DOMContentLoaded", this.init);
  }
}

updateViewportHeight();
window.addEventListener("resize", () => {
  updateViewportHeight();
});

LoginFormUI.initOnLoad();
window.LoginFormUI = LoginFormUI;
