function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId)
  const arrow = dropdown.previousElementSibling.querySelector(".arrow")

  if (dropdown.classList.contains("active")) {
    dropdown.classList.remove("active")
    arrow.style.transform = "rotate(0deg)"
  } else {
    const allDropdowns = document.querySelectorAll(".dropdown-content")
    const allArrows = document.querySelectorAll(".arrow")

    allDropdowns.forEach((dd) => dd.classList.remove("active"))
    allArrows.forEach((arrow) => (arrow.style.transform = "rotate(0deg)"))

    dropdown.classList.add("active")
    arrow.style.transform = "rotate(180deg)"
  }
}

function toggleMobileMenu() {
  const sidebar = document.querySelector(".sidebar")
  const overlay = document.querySelector(".mobile-overlay")

  sidebar.classList.toggle("active")
  overlay.classList.toggle("active")

  if (sidebar.classList.contains("active")) {
    document.body.style.overflow = "hidden"
  } else {
    document.body.style.overflow = "auto"
  }
}

function closeMobileMenu() {
  const sidebar = document.querySelector(".sidebar")
  const overlay = document.querySelector(".mobile-overlay")

  sidebar.classList.remove("active")
  overlay.classList.remove("active")
  document.body.style.overflow = "auto"
}

document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.createElement("button")
  mobileMenuBtn.className = "mobile-menu-btn"
  mobileMenuBtn.innerHTML = "☰"
  mobileMenuBtn.setAttribute("aria-label", "Toggle menu")
  mobileMenuBtn.onclick = toggleMobileMenu
  document.body.appendChild(mobileMenuBtn)

  const mobileOverlay = document.createElement("div")
  mobileOverlay.className = "mobile-overlay"
  mobileOverlay.onclick = closeMobileMenu
  document.body.appendChild(mobileOverlay)

  const tutorialDropdown = document.getElementById("tutorial-dropdown")
  const tutorialArrow = document.querySelector("#tutorial-dropdown").previousElementSibling.querySelector(".arrow")

  if (tutorialDropdown) {
    tutorialDropdown.classList.add("active")
    tutorialArrow.style.transform = "rotate(180deg)"
  }

  initImageZoom()

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMobileMenu()
    }
  })

  window.addEventListener("orientationchange", () => {
    setTimeout(() => {
      if (window.innerWidth > 768) {
        closeMobileMenu()
      }
    }, 100)
  })
})

document.querySelectorAll(".dropdown-content a").forEach((link) => {
  link.addEventListener("click", function (e) {
    this.style.opacity = "0.7"
    setTimeout(() => {
      this.style.opacity = "1"
    }, 200)

    if (window.innerWidth <= 768) {
      setTimeout(closeMobileMenu, 300)
    }
  })
})

function initImageZoom() {
  const modal = document.createElement("div")
  modal.id = "imageModal"
  modal.className = "image-modal"
  modal.innerHTML = `
    <div class="image-modal-content">
      <span class="image-modal-close">&times;</span>
      <img class="image-modal-img" id="modalImage">
      <div class="image-modal-caption" id="modalCaption"></div>
    </div>
  `
  document.body.appendChild(modal)

  const imageLinks = document.querySelectorAll('.tutorial-content a[href*="blogger.googleusercontent.com"]')

  imageLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()

      const img = this.querySelector("img")
      if (img) {
        openImageModal(this.href, img.alt || "")
      }
    })

    link.style.cursor = "zoom-in"
    const img = link.querySelector("img")
    if (img) {
      img.style.cursor = "zoom-in"
    }
  })

  const closeBtn = modal.querySelector(".image-modal-close")
  closeBtn.addEventListener("click", closeImageModal)

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeImageModal()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeImageModal()
    }
  })
}

function openImageModal(imageSrc, caption) {
  const modal = document.getElementById("imageModal")
  const modalImg = document.getElementById("modalImage")
  const modalCaption = document.getElementById("modalCaption")

  modal.style.display = "block"
  modalImg.src = imageSrc
  modalCaption.textContent = caption

  document.body.style.overflow = "hidden"
  modal.style.opacity = "0"
  setTimeout(() => {
    modal.style.opacity = "1"
  }, 10)
}

function closeImageModal() {
  const modal = document.getElementById("imageModal")

  modal.style.opacity = "0"
  setTimeout(() => {
    modal.style.display = "none"
    document.body.style.overflow = "auto"
  }, 300)
}

const style = document.createElement("style")
style.textContent = `
    .image-modal {
        display: none;
        position: fixed;
        z-index: 9999;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.9);
        transition: opacity 0.3s ease;
    }

    .image-modal-content {
        position: relative;
        margin: auto;
        padding: 0;
        width: 90%;
        max-width: 1200px;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }

    .image-modal-img {
        max-width: 100%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        animation: zoomIn 0.3s ease;
    }

    @keyframes zoomIn {
        from {
            transform: scale(0.8);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .image-modal-close {
        position: absolute;
        top: 20px;
        right: 30px;
        color: white;
        font-size: 40px;
        font-weight: bold;
        cursor: pointer;
        z-index: 10000;
        transition: color 0.3s ease;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        line-height: 1;
    }

    .image-modal-close:hover {
        color: #3498db;
        background: rgba(0, 0, 0, 0.7);
    }

    @media (max-width: 768px) {
        .image-modal-content {
            width: 95%;
            padding: 10px;
        }

        .image-modal-img {
            max-height: 80%;
        }

        .image-modal-close {
            top: 10px;
            right: 15px;
            font-size: 30px;
            width: 40px;
            height: 40px;
        }

        .image-modal-caption {
            font-size: 14px;
            padding: 15px;
            margin-top: 15px;
            max-width: 90%;
        }
    }

    @media (max-width: 480px) {
        .image-modal-close {
            top: 5px;
            right: 10px;
            font-size: 25px;
            width: 35px;
            height: 35px;
        }

        .image-modal-caption {
            font-size: 12px;
            padding: 10px;
            margin-top: 10px;
            max-width: 95%;
        }
    }
`
document.head.appendChild(style)
