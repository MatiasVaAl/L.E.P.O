document.addEventListener('DOMContentLoaded', () => {
    // --- Referencias de Elementos ---
    const semibotCuerpo = document.getElementById('semibot-cuerpo');
    const mensajeSemibot = document.getElementById('mensaje-semibot');
    const siguienteBtn = document.querySelector('.button'); 
    const brazoIzquierdo = document.getElementById('brazo-izquierdo');
    const brazoDerecho = document.getElementById('brazo-derecho');
    const btnTextSpan = siguienteBtn.querySelector('.button__text'); 
    const semibotCorazon = document.getElementById('semibot-corazon');

    // --- Configuraciones Base ---
    const rutasBoca = [
        'L.E.P.O/src/R.E.P.Omouth_closedR.png',  // 0: Cerrada (default)
        'L.E.P.O/src/R.E.P.Omouth_mid_openR.png', // 1: Entreabierta
        'L.E.P.O/src/R.E.P.Omouth_openR.png'    // 2: Abierta
        
    ];

    const RUTA_CUERPO_FINAL = 'L.E.P.O/src/R.E.P.Omouth_closedR2.png';
    const VELOCIDAD_ESCRITURA = 50; 
    const VELOCIDAD_CAMBIO_BOCA = 100; 

    let parteActual = 0;
    let estadoBocaActual = 0; 
    let escrituraIntervalo;
    let bocaIntervalo;
    
    // 🌟 1. BIBLIOTECA DE POSES ESTÁTICAS (Top, Left/Right, Transform) 🌟
    // Define la ubicación y rotación de inicio/fin de cada pose.
    const posesBrazos = {
        // POSICIÓN NEUTRAL: Ambos brazos en diagonal abajo (Descanso)
        'descanso': {
            izq: { top: '240px', right: '150px', rotacion: 'rotate(-85deg) translateY(0px)' }, 
            der: { top: '240px', left: '150px', rotacion: 'rotate(85deg) translateY(0px)' }
        },
        
        // POSICIÓN SALUDO: Brazo Izquierdo Levantado, Derecho en Descanso
        'pose_saludo_izquierdo': {
            izq: { top: '135px', right: '150px', rotacion: 'rotate(-85deg) translateY(0px)' }, // Levantado
            der: { top: '245px', left: '150px', rotacion: 'rotate(85deg) translateY(0px)' }  // Descanso
        },
        
        // POSICIÓN GESTICULAR (Ejemplo: Ambos brazos levantados a los lados)
        'pose_gesto': {
            izq: { top: '240px', right: '150px', rotacion: 'rotate(-85deg) translateY(0px)' }, // Izquierdo arriba
            der: { top: '240px', left: '150px', rotacion: 'rotate(85deg) translateY(0px)' }    // Derecho arriba
        },

        'pose_duda': {
            izq: { top: '240px', right: '165px', rotacion: 'rotate(-90deg) translateY(0px)' }, // Izquierdo arriba
            der: { top: '240px', left: '165px', rotacion: 'rotate(90deg) translateY(0px)' }    // Derecho arriba
        },

        'pose_cora': {
            izq: { top: '200px', right: '165px', rotacion: 'rotate(-180deg) translateY(0px)' }, // Izquierdo arriba
            der: { top: '200px', left: '165px', rotacion: 'rotate(-180deg) translateY(0px)' },    // Derecho arriba
        }

    };

    // --- ESTRUCTURA DE DIÁLOGO (DEFINE LA ESCENA Y EL MOVIMIENTO) ---
    const dialogoPartes = [
        {
            mensaje: "¡Hola, Andrea! Este mensaje te lo envia Maty el cual espera que leas.",
            poseInicial: "pose_saludo_izquierdo", // POSICIÓN: Izquierdo arriba
            animacionMovimiento: "saludo",      // MOVIMIENTO: Izquierdo hace el vaivén (saludo)
            terminar: "dejar_saludando"         // ESTADO FINAL: Sigue saludando
        },
        {
            mensaje: "Me programó para decirte esto porque, si lo intenta en persona posiblemente se enrrede y quede como bobo.",
            poseInicial: "pose_gesto", 
            animacionMovimiento: "habla_ambos", // MOVIMIENTO: Ambos brazos tiemblan
            terminar: "pose_gesto"
        },
        {
            mensaje: "Desde que te conocí y escuché tu voz por primera vez, algo en mí se sentia diferente. Fue un cambio inesperado y muy bonito.",
            poseInicial: "descanso", 
            animacionMovimiento: "habla_ambos", 
            terminar: "descanso"
        },

        {
            mensaje: "No sabia lo que podia ser, pero escuchar tu voz y tus risas me lleno de alegria el alma",
            poseInicial: "pose_duda", 
            animacionMovimiento: "duda", 
            terminar: "pose_duda"
        },

        {
            mensaje: "Mientras más conocia de ti. Tus gustos, tus chistes, tu gentileza, tu forma de ser, más te metiste en mi cabeza y en mi corazón.",
            poseInicial: "descanso", 
            animacionMovimiento: "habla_ambos", 
            terminar: "descanso"
        },

        {
            mensaje: "Y sí, tu sonrisa es de verdad hermosa, Andrea. Por favor, nunca dejes que nadie te diga lo contrario.",
            poseInicial: "descanso", 
            animacionMovimiento: "habla_ambos", 
            terminar: "descanso"
        },

        {
            mensaje: "Sé que el tiempo es corto y nisiquiera nos hemos visto en persona, pero me hiciste sentir algo muy fuerte por ti. Estoy siendo completamente honesto ahora.",
            poseInicial: "descanso", 
            animacionMovimiento: "habla_ambos", 
            terminar: "descanso"
        },

        {
            mensaje: "No sabria si tu sientes lo mismo, pero en verdad me gustas mucho.",
            poseInicial: "descanso", 
            animacionMovimiento: "habla_ambos", 
            terminar: "descanso"
        },

        {
            mensaje: "Y quisiera saber si. Gustarias de salir conmigo? ",
            poseInicial: "descanso", 
            animacionMovimiento: "habla_ambos", 
            terminar: "descanso"
        },
    ];

    // --- Funciones de Utilidad ---

    // Función para aplicar la ubicación (top, left, transform) a los elementos
    function aplicarPose(nombrePose) {
        const pose = posesBrazos[nombrePose] || posesBrazos['descanso'];
        
        // Brazo Izquierdo (Aplica la posición estática)
        brazoIzquierdo.style.top = pose.izq.top;
        brazoIzquierdo.style.right = pose.izq.right;
        brazoIzquierdo.style.transform = pose.izq.rotacion;
        brazoIzquierdo.style.left = ''; 

        // Brazo Derecho (Aplica la posición estática)
        brazoDerecho.style.top = pose.der.top;
        brazoDerecho.style.left = pose.der.left;
        brazoDerecho.style.transform = pose.der.rotacion;
        brazoDerecho.style.right = ''; 

        // 🌟 Lógica para posicionar y mostrar/ocultar el corazón 🌟
        semibotCorazon.style.top = pose.corazon ? pose.corazon.top : '';
        semibotCorazon.style.left = pose.corazon ? pose.corazon.left : '';
        semibotCorazon.style.transform = pose.corazon ? pose.corazon.transform : '';


        // 🌟 Lógica para posicionar y mostrar/ocultar el corazón 🌟
        if (pose.corazon) {
            semibotCorazon.style.top = pose.corazon.top;
            semibotCorazon.style.left = pose.corazon.left;
            semibotCorazon.style.transform = pose.corazon.transform;
            semibotCorazon.classList.add('semibot-corazon-visible'); // Muestra el corazón
        } else {
            semibotCorazon.classList.remove('semibot-corazon-visible'); // Oculta el corazón si no hay pose.corazon
        }

    }

    // Limpia todas las clases de movimiento CSS (saludo y habla)
    function limpiarClasesDeMovimiento() {
        brazoIzquierdo.classList.remove('brazo-saludando', 'habla-gesto-izq-mov', 'duda-mov-izq', 'cora-izq');
        brazoDerecho.classList.remove('habla-gesto-der-mov', 'duda-mov-der', 'cora-der');
    }

    function terminarAccionBrazo(terminarAccion) {
        limpiarClasesDeMovimiento(); 
    
        if (terminarAccion === "dejar_saludando") {
            // Mantiene la pose y reactiva el movimiento de saludo
            aplicarPose('pose_saludo_izquierdo'); 
            brazoIzquierdo.classList.add('brazo-saludando'); 
            
        } else if (terminarAccion === "pose_gesto") {
            // 🌟 NUEVA LÓGICA: Se queda quieto en la pose de gesto 🌟
            aplicarPose('pose_gesto'); 
        
        } else if (terminarAccion === "pose_cora_estatica") {
             // Se queda en la pose del corazón (quieta)
            aplicarPose('pose_cora');
        
        } else { // 'descanso'
            aplicarPose('descanso'); 
        }
    }
    
    // --- Funciones de Control de Animación ---

    function alternarBoca() {
        estadoBocaActual = (estadoBocaActual % 2) + 1;
        semibotCuerpo.src = rutasBoca[estadoBocaActual];
    }
    
    function detenerAnimacion(finalizarMensaje = false) { 
        clearInterval(escrituraIntervalo);
        clearInterval(bocaIntervalo);

        if (finalizarMensaje) {
            siguienteBtn.style.pointerEvents = 'none'; 
            if (btnTextSpan) btnTextSpan.textContent = 'FINALIZADO';
            semibotCuerpo.src = RUTA_CUERPO_FINAL;

            // 🌟 APLICAR LA POSE FINAL CON EL CORAZÓN 🌟
            aplicarPose('pose_cora'); // Pone los brazos en pose de corazón y lo muestra
        
        } else {
            // Si no es el final definitivo (ej: interrupción), va a la pose de descanso
            semibotCuerpo.src = rutasBoca[0];
            terminarAccionBrazo('descanso'); 
        }
    }

    function aplicarAnimacionBrazos(config) {
        limpiarClasesDeMovimiento();
        
        // 1. Aplica la pose estática (posición inicial)
        aplicarPose(config.poseInicial); 

        // 2. Aplica las clases de MOVIMIENTO por encima de la pose
        if (config.animacionMovimiento === "saludo") {
            brazoIzquierdo.classList.add('brazo-saludando');

        } else if (config.animacionMovimiento === "habla_ambos") {
            // 🌟 USO DE CLASES CORREGIDO
            brazoIzquierdo.classList.add('habla-gesto-izq-mov');
            brazoDerecho.classList.add('habla-gesto-der-mov');

        } else if (config.animacionMovimiento === "habla_izq") {
            brazoIzquierdo.classList.add('habla-gesto-izq-mov');

        } else if (config.animacionMovimiento === "habla_der") {
            brazoDerecho.classList.add('habla-gesto-der-mov');

        } else if (config.animacionMovimiento === "duda") {
            brazoIzquierdo.classList.add('duda-mov-izq');
            brazoDerecho.classList.add('duda-mov-der');
        
        } else if (config.animacionMovimiento === "cora_ambos") {
            brazoIzquierdo.classList.add('cora-izq');
            brazoDerecho.classList.add('cora-der');
        }
    }
    
    function escribirParte(config) {
        siguienteBtn.style.pointerEvents = 'none'; 
        
        const texto = config.mensaje;
        let indiceTexto = 0;
        
        aplicarAnimacionBrazos(config);

        bocaIntervalo = setInterval(alternarBoca, VELOCIDAD_CAMBIO_BOCA);
        
        escrituraIntervalo = setInterval(() => {
            if (indiceTexto < texto.length) {
                if (indiceTexto === 0) mensajeSemibot.textContent = ''; 
                mensajeSemibot.textContent += texto.charAt(indiceTexto);
                indiceTexto++;
            } else {
                clearInterval(escrituraIntervalo);
                clearInterval(bocaIntervalo);
                semibotCuerpo.src = rutasBoca[0]; 
                
                terminarAccionBrazo(config.terminar); 

                if (parteActual < dialogoPartes.length) { 
                    siguienteBtn.style.pointerEvents = 'auto'; 
                    if (btnTextSpan) btnTextSpan.textContent = 'SIGUIENTE';
                } else {
                    detenerAnimacion(true); 
                }
            }
        }, VELOCIDAD_ESCRITURA);
    }

    function mostrarSiguienteParte(event) {
        event.preventDefault(); 
        
        if (parteActual < dialogoPartes.length) {
            escribirParte(dialogoPartes[parteActual]);
            parteActual++;
        }
    }

    // --- Inicialización ---
    siguienteBtn.addEventListener('click', mostrarSiguienteParte);
    aplicarPose('descanso'); // Asegura la posición de descanso al cargar
    if (btnTextSpan) btnTextSpan.textContent = 'INICIAR';
});
