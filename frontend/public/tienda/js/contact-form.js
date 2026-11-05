// contact-form.js — formulario de contacto: valida (nombre solo letras, celular solo números) y envía el mensaje a la API

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
    const statusLine = contactForm.querySelector(".form__status");
    const submitButton = contactForm.querySelector(".btn__form");

    nameInput.addEventListener("input", () => contactStripInvalid(nameInput, CONTACT_INVALID_NAME_CHARS));
    phoneInput.addEventListener("input", () => contactStripInvalid(phoneInput, CONTACT_INVALID_PHONE_CHARS));

    // Muestra el resultado del envío bajo el formulario, recibe message, isError
    const showStatus = (message, isError) => {
        statusLine.textContent = message;
        statusLine.classList.toggle("form__status--error", isError);
        statusLine.hidden = false;
    };

    // Envía el mensaje a la API; si sale bien, vacía el formulario y agradece, si no, muestra el motivo
    contactForm.addEventListener("submit", async (submitEvent) => {
        submitEvent.preventDefault();
        if (submitButton.disabled) return;

        statusLine.hidden = true;
        submitButton.disabled = true;

        const fields = new FormData(contactForm);
        const { ok, data } = await postJson("/api/contact", {
            name: String(fields.get("nombre")).trim(),
            phone: String(fields.get("celular")).trim(),
            subject: String(fields.get("asunto")).trim(),
            message: String(fields.get("mensaje")).trim()
        });

        submitButton.disabled = false;

        if (ok) {
            contactForm.reset();
            showStatus("¡Gracias! Recibimos tu mensaje y te responderemos muy pronto.", false);
        } else {
            showStatus(data.statusMessage || "No pudimos enviar tu mensaje. Intenta de nuevo.", true);
        }
    });
}
