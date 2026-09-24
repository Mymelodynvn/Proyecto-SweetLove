/**
 * Archivo del proyecto Sweet Love.
 * Función: contiene la lógica específica del módulo donde se encuentra.
 * Los comentarios de los bloques principales están escritos en español.
 */
// password js

class PasswordToggler {
  constructor(passwordClassName, togglerClassName) {
    this.passwordElements = document.getElementsByClassName(passwordClassName);
    this.togglerElements = document.getElementsByClassName(togglerClassName);
    this.attachEventListeners();
  }

  attachEventListeners() {
    for (let i = 0; i < this.togglerElements.length; i++) {
      this.togglerElements[i].addEventListener('click', () => {
        this.showHidePassword(i);
      });
    }
  }

  showHidePassword(index) {
    const password = this.passwordElements[index];
    const toggler = this.togglerElements[index];

    if (password.type === 'password') {
      password.setAttribute('type', 'text');
      toggler.classList.add('ti-eye');
      toggler.classList.remove('ti-eye-off');
    } else {
      toggler.classList.remove('ti-eye');
      toggler.classList.add('ti-eye-off');
      password.setAttribute('type', 'password');
    }
  }
}

// Create an instance of PasswordToggler for the desired class names
const passwordToggler = new PasswordToggler('fakePassword', 'passwordToggler');
