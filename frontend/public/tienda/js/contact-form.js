// contact-form.js — validación del formulario de contacto: el nombre solo lleva letras y el celular solo números

// Caracteres que no se aceptan en cada campo
const CONTACT_INVALID_NAME_CHARS = /[^\p{L}\s'.-]/gu;
const CONTACT_INVALID_PHONE_CHARS = /\D/g;

// Quita al escribir los caracteres no permitidos de un campo, recibe input, invalidChars
const contactStripInvalid = (input, invalidChars) => {
    const clean = input.value.replace(invalidChars, "");
    if (clean !== input.value) input.value = clean;
};

const contactForm = document.querySelector(".contact__form");

if (contactForm) {
    const nameInput = contactForm.querySelector('input[name="nombre"]');
    const phoneInput = contactForm.querySelector('input[name="celular"]');

    nameInput.addEventListener("input", () => contactStripInvalid(nameInput, CONTACT_INVALID_NAME_CHARS));
    phoneInput.addEventListener("input", () => contactStripInvalid(phoneInput, CONTACT_INVALID_PHONE_CHARS));
}
