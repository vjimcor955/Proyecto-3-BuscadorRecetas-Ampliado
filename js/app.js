// www.themealdb.com

// Inicia la aplicacion
function iniciarApp() {
    // Selectores y Listeners
    const selectCategories = document.querySelector("#categorias")
    if (selectCategories) {
        selectCategories.addEventListener("change", obtenerRecetas)
        obtenerCategorias()
    }
    const resultado = document.querySelector("#resultado")


    // Instanciar el modal bootstrap
    const modal = new bootstrap.Modal("#modal", {}) 


    // Funciones
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
    function obtenerRecetas(evento) {
        const categoria = evento.target.value
        url= `https:www.themealdb.com/api/json/v1/1/filter.php?c=${categoria}`
        fetch(url)
            .then((res) => res.json())
            .then((data) => mostrarRecetas(data.meals))
    }

    // Muestra las recetas en el HTML
    function mostrarRecetas(recetas = []) {
        limpiarHTML(resultado)

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
        }

        modal.show()
    }

    // Añade una receta a favoritos
    function agregarFavorito(receta) {
        const favorito = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        localStorage.setItem("recetasFavoritos", JSON.stringify([...favorito, receta]))
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
    }

    // Mostrar mensaje toast
    function mostrarToast(mensaje) {
        const toastDiv = document.querySelector(".toast")
        const toastDivBody = document.querySelector(".toast-body")
        const toast = new bootstrap.Toast(toastDiv)

        toastDivBody.textContent = mensaje

        toast.show()
    }


    // PAGINA FAVORITOS
    // Selectores y listeners
    const favoritosDiv = document.querySelector(".favoritos")
    if (favoritosDiv) {
        obtenerFavoritos()
    }

    // Funciones
    // Muestra los favoritos
    function obtenerFavoritos() {
        const favoritos = JSON.parse(localStorage.getItem("recetasFavoritos")) ?? []
        if (favoritos.length) {
            mostrarRecetas(favoritos)
            return
        }
        const noFavoritos = document.createElement("P")
        noFavoritos.textContent = "No hay favoritos"
        noFavoritos.classList.add("fs-4", "text-center", "font-bold", "mt-5")
        favoritosDiv.appendChild(noFavoritos)
    }
}

document.addEventListener("DOMContentLoaded", iniciarApp)
