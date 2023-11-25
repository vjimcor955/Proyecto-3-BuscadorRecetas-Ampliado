// www.themealdb.com

// Inicia la aplicacion
function iniciarApp() {
    // Selectores y Listeners
    const selectNombre = document.querySelector("#nombre")
    const btnNombre = document.querySelector('button[type="submit"]#nombre')

    const selectCategories = document.querySelector("#categorias")
    const btnCategoria = document.querySelector('button[type="submit"]#categoria')

    const selectIngrediente = document.querySelector("#ingrediente")
    const btnIngrediente = document.querySelector('button[type="submit"]#ingrediente')

    const selectOrigen = document.querySelector("#origen")
    const btnOrigen = document.querySelector('button[type="submit"]#origen')

    selectNombre.addEventListener("blur", validar)
    selectNombre.addEventListener("blur", () => {
        validar
        actualizarBoton(btnNombre, btnNombre.parentElement)
    })
    selectIngrediente.addEventListener("blur", validar)
    selectIngrediente.addEventListener("blur", () => {
        validar
        actualizarBoton(btnIngrediente, btnIngrediente.parentElement)
    })

    if (selectNombre) {
        actualizarBoton(btnNombre, btnNombre.parentElement)
        btnNombre.addEventListener("click", obtenerRecetaPorNombre)
    }
    if (selectCategories) {
        obtenerCategorias()
        btnCategoria.addEventListener("click", obtenerRecetasPorCategoria)
    }
    if (selectIngrediente) {
        actualizarBoton(btnIngrediente, btnIngrediente.parentElement)
        btnIngrediente.addEventListener("click", obtenerRecetasPorIngrediente)
    }
    if (selectOrigen) {
        obtenerOrigenes()
        btnOrigen.addEventListener("click", obtenerRecetasPorOrigen)
    }

    const resultado = document.querySelector("#resultado")


    // Instanciar el modal bootstrap
    const modal = new bootstrap.Modal("#modal", {}) 


    // Funciones
    actualizarFavoritos()
    // actualizarBoton(btnNombre, btnNombre.parentElement)
    // actualizarBoton(btnIngrediente, btnIngrediente.parentElement)
    
    // Obtiene las categorias para el select
    function obtenerCategorias() {
        url="https://www.themealdb.com/api/json/v1/1/categories.php"
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarCategorias(data.categories))
    }

    // Mostrar categorias en el select
    function mostrarCategorias(categorias) {
        categorias.forEach(categoria => {
            const option = document.createElement("OPTION")
            option.value = categoria.strCategory
            option.textContent = categoria.strCategory
            selectCategories.appendChild(option)
        })
    }

    // Obtiene las recetas de una categoria
    function obtenerRecetasPorCategoria(evento) {
        evento.preventDefault()
        const categoria = selectCategories.value
        url= `https:www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.meals !== null) {
                    limpiarHTML(resultado)
                    mostrarMensaje(`Recetas con la categoria '${categoria}':`, resultado)
                    mostrarRecetas(data.meals)
                } else {
                    mostrarMensaje(`Recetas con la categoria '${categoria}' no encontradas`, resultado)
                }
            })
    }

    // Muestra las recetas en el HTML
    function mostrarRecetas(recetas = []) {
        // limpiarHTML(resultado)

        recetas.forEach(receta => {
            const {idMeal, strMeal, strMealThumb} = receta
            const contenedorRecetas = document.createElement("DIV")
            contenedorRecetas.classList.add("col-md-4")

            // Card Recetas
            const recetaCard = document.createElement("DIV")
            recetaCard.classList.add("card", "mb-4")

            // Imagen
            const recetaImagen = document.createElement("IMG")
            recetaImagen.classList.add("card-img-top")
            recetaImagen.alt = `Imagen de la receta ${strMeal ?? receta.title}`
            recetaImagen.src = strMealThumb ?? receta.img

            // Body
            const recetaCardBody = document.createElement("DIV")
            recetaCardBody.classList.add("card-body")

            // Titulo
            const recetaHeader = document.createElement("H3")
            recetaHeader.classList.add("card-title", "mb-3")
            recetaHeader.textContent = strMeal ?? receta.title

            // Boton
            const recetaButton = document.createElement("button")
            recetaButton.classList.add("btn", "btn-danger", "w-100")
            recetaButton.textContent = "Ver receta"
            // Evento boton
            recetaButton.onclick = function()  {
                seleccionarReceta(idMeal ?? receta.id)
                // Guardar receta en el historial, si ya esta en el historial se mueve al principio de la lista
                const historial = JSON.parse(localStorage.getItem("historialRecetas")) ?? []
                if (existeHistorial(idMeal)) {
                    for (var i=0; i<historial.length; i++) {
                        if (historial[i].idMeal === idMeal) {
                            const recetaEliminada = historial.splice(i, 1);
                        }
                    }
                    localStorage.setItem("historialRecetas", JSON.stringify([receta, ...historial]))                  
                } else {
                    localStorage.setItem("historialRecetas", JSON.stringify([receta, ...historial]))                  
                }
            }

            // Montar la carta la carta
            recetaCardBody.appendChild(recetaHeader)
            recetaCardBody.appendChild(recetaButton)

            recetaCard.appendChild(recetaImagen)
            recetaCard.appendChild(recetaCardBody)

            contenedorRecetas.appendChild(recetaCard)

            resultado.appendChild(contenedorRecetas)
        })

    }   

    // Seleccionar receta
    function seleccionarReceta(id) {
        const url = `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`

        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetaModal(data.meals[0]))

    }

    // Limpia un contenedor
    function limpiarHTML(selector) {
        while(selector.firstChild) {
            selector.firstChild.remove()
        }
    }

    // Mostrar receta en el modal
    function mostrarRecetaModal(receta) {
        const {idMeal, strInstructions, strMeal, strMealThumb} = receta

        const modalTitle = document.querySelector(".modal .modal-title")
        const modalBody = document.querySelector(".modal .modal-body")
        
        modalTitle.textContent = strMeal
        modalBody.innerHTML = `
            <img class="img-fluid" src=${strMealThumb} alt="${strMeal}">
            <h3 class="my-3">Instrucciones</h3>
            <p>${strInstructions}</p>
            <h3 class="my-3">Ingredientes</h3>
        `
        
        const listGroup = document.createElement("UL")
        listGroup.classList.add("list-group")

        // Mostramos ingredientes
        for (let i=1; i<=20; i++) {
            if (receta[`strIngredient${i}`]) {
                const ingrediente = receta[`strIngredient${i}`]
                const cantidad = receta[`strMeasure${i}`]
                const ingredientLi = document.createElement("LI")
                ingredientLi .classList.add("list-group-item")
                ingredientLi.textContent = `${cantidad} - ${ingrediente}`
                
                listGroup.appendChild(ingredientLi)    
            } 
        }
        modalBody.appendChild(listGroup)

        // Mostramos los botones
        const modalFooter = document.querySelector(".modal-footer")

        limpiarHTML(modalFooter)

        // Boton favorito
        const btnFavorito = document.createElement("BUTTON")

        existeFavorito(idMeal)
            ?btnFavorito.classList.add("btn", "btn-warning", "col")
            :btnFavorito.classList.add("btn", "btn-danger", "col")

        btnFavorito.textContent = existeFavorito(idMeal)
            ? "Eliminar Favorito"
            : "Guardar Favorito"

        modalFooter.appendChild(btnFavorito)

        btnFavorito.onclick = function() {
            if (existeFavorito(idMeal)) {
                eliminarFavorito(idMeal)

                btnFavorito.textContent = "Guardar Favorito"
                btnFavorito.classList.add("btn-danger")
                btnFavorito.classList.remove("btn-warning")

                mostrarToast("Receta eliminada correctamente")
                return
            }

            agregarFavorito({id: idMeal, title: strMeal, img: strMealThumb})

            // Cambiar boton
            btnFavorito.textContent = "Borrar Favorito"
            btnFavorito.classList.add("btn-warning")
            btnFavorito.classList.remove("btn-danger")
            mostrarToast("Receta añdida correctamente")

        }

        // Boton cerrar
        const btnCerrar = document.createElement("BUTTON")
        btnCerrar.classList.add("btn", "btn-secondary", "col")
        btnCerrar.textContent = "Cerrar"
        modalFooter.appendChild(btnCerrar)

        // Funcionalidad boton cerrar    
        btnCerrar.onclick = function() {
            modal.hide()
            // location.reload()
        }

        modal.show()
    }

    // Mostrar mensaje toast
    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector(".toast")
        const toastDivBody = document.querySelector(".toast-body")
        const toast = new bootstrap.Toast(toastDiv)

        limpiarHTML(toastDivBody)

        const mensajeP = document.createElement("P")

        mensajeP.textContent = mensaje
        toastDivBody.appendChild(mensajeP)

        // AMPLIACION PROYECTO --------------------------------------
        // Ir a favoritos desde el toast
        const toastLink = document.createElement("a")
        toastLink.textContent = "Ver favoritos"
        toastLink.href = "./favoritos.html"
        toastLink.classList.add("btn", "btn-danger",  "col")
        toastDivBody.appendChild(toastLink)

        toast.show()
    }


    // PAGINA FAVORITOS
    const favoritosDiv = document.querySelector(".favoritos")
    if (favoritosDiv) {
        obtenerFavoritos()
    }

    // Muestra los favoritos
    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        if (favoritos.length) {
            mostrarRecetas(favoritos)
            return
        }
        mostrarMensaje("Ninguna receta ha sido marcada como favorita", favoritosDiv)
    }

    // Añade una receta a favoritos
    function agregarFavorito(receta) {
        const favorito = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        localStorage.setItem("recetasFavoritos", JSON.stringify([...favorito, receta]))
        actualizarFavoritos()
    }

    // Comprueba si una receta ya existe en favoritos
    function existeFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        return favoritos.some((favorito) => favorito.id === id) 
    }

    // Elimina una receta de favoritos
    function eliminarFavorito(id) {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        const nuevosFavoritos = favoritos.filter((favorito) => favorito.id !== id)
        localStorage.setItem("recetasFavoritos", JSON.stringify(nuevosFavoritos))
        actualizarFavoritos()
    }


    // AMPLIACIÓN ------------------------------------------------------------------
    // Funcion que muestra un mensaje en un conenedor especifico
    function mostrarMensaje(mensaje, contenedor) {
        limpiarHTML(resultado)
        const mensajeDiv = document.createElement("DIV")
        mensajeDiv.classList.add("fs-4", "text-center", "font-bold", "m-5")
        mensajeDiv.textContent = mensaje

        contenedor.appendChild(mensajeDiv)
    }


    // Validacion formulario
    // Valida que el input sea correcto
    function validarCampo(nombre) {
        const regex = /^[a-záéíóúüñ\s]+$/i
        const resultado = regex.test(nombre.toLowerCase())
        return resultado
    }
    // Valida que los campos se rellenen correctamente y muestra una alerta cuando se hace incorrectamente
    function validar(evento) {
        if (evento.target.value.trim() === "") {
            mostrarAlerta(`El campo ${evento.target.id} es obligatorio`, evento.target.parentElement)
            return
        }
        if (evento.target.id === "nombre" && !validarCampo(evento.target.value)) {
            mostrarAlerta("El campo nombre no es valido", evento.target.parentElement)
            return
        }
        if (evento.target.id === "ingrediente" && !validarCampo(evento.target.value)) {
            mostrarAlerta("El campo ingrediente no es valido", evento.target.parentElement)
            return
        }

        limpiarAlerta(evento.target.parentElement)
    }
    // Crea y muestra una alerta en el formulario
    function mostrarAlerta(mensaje, referencia) {
        limpiarAlerta(referencia) 
        const error = document.createElement("P")
        error.textContent = mensaje
        error.classList.add("bg-danger", "text-center", "text-white", "p-2")
        referencia.appendChild(error)
    }
    // Borra la alerta del formulario
    function limpiarAlerta(referencia) {
        const alerta = referencia.querySelector(".bg-danger")  
        if (alerta) {
            alerta.remove()
        }
    }
    // Activa y desactiva el boton si el formulario esta rellenado correctamente o no
    function actualizarBoton(boton, referencia) {
        const alerta = referencia.querySelector(".bg-danger")  
        if (alerta !== null) {
            boton.classList.add("opacity-50")
            boton.disabled = true
            return    
        }
        boton.classList.remove("opacity-50")
        boton.disabled = false
    }


    // Contador de recetas guardadas como favoritas
    function actualizarFavoritos() {
        const btnMisFavoritos = document.querySelector(".navbar-nav li:nth-child(3)")
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        let contador = 0
        favoritos.forEach(favorito => {
            contador++
        })
        btnMisFavoritos.innerHTML = `<a class="nav-link fs-4" href="favoritos.html">Mis favoritos (${contador})</a>`
    }


    // Buscador de recetas por su nombre
    function obtenerRecetaPorNombre(evento) {
        evento.preventDefault()
        const nombre = selectNombre.value.trim()
        url= `https://www.themealdb.com/api/json/v1/1/search.php?s=${nombre}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.meals !== null) {
                    limpiarHTML(resultado)
                    mostrarMensaje(`Recetas con '${nombre}' en el nombre:`, resultado)
                    mostrarRecetas(data.meals)
                } else {
                    mostrarMensaje(`Recetas con el nombre '${nombre}' no encontradas`, resultado)
                }
            })
    }


    // Buscar recetas por ingrediente principal
    function obtenerRecetasPorIngrediente(evento) {
        evento.preventDefault()
        const ingrediente = selectIngrediente.value.trim()
        url= `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingrediente}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.meals !== null) {
                    limpiarHTML(resultado)
                    mostrarMensaje(`Recetas cuyo el ingrediente principal es '${ingrediente}':`, resultado)
                    mostrarRecetas(data.meals)
                } else {
                    mostrarMensaje(`Recetas con el ingrediente '${ingrediente}' no encontradas`, resultado)
                }
            })
    }


    // Buscar recetas por origen
    // Obtiene los origenes de las recetas para el select
    function obtenerOrigenes() {
        url="https://www.themealdb.com/api/json/v1/1/list.php?a=list"
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarOrigenes(data.meals))
    }
    // Muestra los origenes en el select
    function mostrarOrigenes(origenes) {
        origenes.forEach(origen => {
            const option = document.createElement("OPTION")
            option.value = origen.strArea
            option.textContent = origen.strArea
            selectOrigen.appendChild(option)
        })
    }
    // Obtiene las recetas por el origen
    function obtenerRecetasPorOrigen(evento) {
        evento.preventDefault()
        const origen = selectOrigen.value
        url= `https://www.themealdb.com/api/json/v1/1/filter.php?a=${origen}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                if (data.meals !== null) {
                    limpiarHTML(resultado)
                    mostrarMensaje(`Recetas con origen '${origen}':`, resultado)
                    mostrarRecetas(data.meals)
                } else {
                    mostrarMensaje(`Recetas con origen '${origen}' no encontradas`, resultado)
                }
            })
    }


    // Historial que muestra las recetas vistas
    // PAGINA HISTORIAL
    const historialDiv = document.querySelector(".historial")
    if (historialDiv) {
        obtenerHistorial()
    }
    // Obtiene y muestra el historial de recetas vistas
    function obtenerHistorial() {
        const historial = JSON.parse(localStorage.getItem("historialRecetas")) ?? []
        if (historial.length) {
            // Boton borrar historial que aparece solo si hay historial que borrar
            const historialDiv = document.querySelector(".historial")
            const divBotonHistorial = document.createElement("DIV")
            divBotonHistorial.classList.add("text-center")
            const btnBorrarHistorial = document.createElement("BUTTON")
            btnBorrarHistorial.classList.add("btn", "btn-danger", "m-5")
            btnBorrarHistorial.textContent = "Borrar historial"

            btnBorrarHistorial.addEventListener("click", () => {
                limpiarHTML(historialDiv)
                localStorage.clear()
                location.reload()
            })

            divBotonHistorial.appendChild(btnBorrarHistorial)

            mostrarRecetas(historial)
            historialDiv.insertBefore(divBotonHistorial, historialDiv.firstChild)
            return
        }
        mostrarMensaje("No has visto ninguna receta", historialDiv)
    }
    // Comprueba que si una receta ya esta en el historial o no
    function existeHistorial(id) {
        const historial = JSON.parse(localStorage.getItem("historialRecetas")) ?? []
        return historial.some((historial) => historial.idMeal === id) 
    }    
}

document.addEventListener("DOMContentLoaded", iniciarApp)
