// site-footer.js — pie de página de la tienda
const SiteFooter = {
    template: `
        <!-- Pie de página -->
        <footer class="footer">
            <!-- Onda decorativa superior -->
            <div class="footer-wave"></div>

            <!-- Contenido del pie: contacto, logo, nombre y redes -->
            <div class="footer-content">
                <!-- Teléfono -->
                <div class="footer-info">
                    <!-- Título -->
                    <h3>Llámanos</h3>

                    <!-- Adorno decorativo -->
                    <div class="ornament"></div>

                    <!-- Enlace para llamar -->
                    <p><a href="tel:+573215771432"><i class="fa-solid fa-phone"></i>(+57) 321 577 1432</a></p>
                </div>

                <!-- Correo electrónico -->
                <div class="footer-info">
                    <!-- Título -->
                    <h3>Escríbenos</h3>

                    <!-- Adorno decorativo -->
                    <div class="ornament"></div>

                    <!-- Enlace para escribir un correo -->
                    <p><a href="mailto:sweetlove.bymaryuri@gmail.com"><i class="fa-solid fa-envelope"></i>sweetlove.bymaryuri@gmail.com</a></p>
                </div>

                <!-- Logo del pie -->
                <div class="footer-logo">
                    <img src="assets/recursos/logo-footer.png">
                </div>

                <!-- Nombre de la marca y derechos -->
                <div class="footer-info">
                    <!-- Nombre de la marca -->
                    <h3 class="cursive">Sweet Love</h3>

                    <!-- Adorno decorativo -->
                    <div class="ornament"></div>

                    <!-- Aviso de derechos reservados -->
                    <p>Todos los derechos reservados.</p>
                </div>

                <!-- Redes sociales -->
                <div class="footer-social">
                    <!-- Enlace a Instagram -->
                    <a href="https://www.instagram.com/sweetlove" target="_blank" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>

                    <!-- Enlace a Facebook -->
                    <a href="https://www.facebook.com/sweetlove" target="_blank" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
                </div>
            </div>

            <!-- Franja inferior -->
            <div class="footer-bottom">
                <!-- Aviso sobre políticas de privacidad -->
                <p>Conoce nuestras políticas de privacidad y cumplimiento <strong><a href="#">aquí.</a></strong></p>
            </div>
        </footer>`
};
