class NavigationManager {
  constructor() {
    this.currentPage = this.getCurrentPage()
    this.init()
  }

  getCurrentPage() {
    const path = window.location.pathname
    const filename = path.split("/").pop().replace(".html", "")
    return filename || "index"
  }

  init() {
    this.setupDropdownStates()
    this.setupEventListeners()
    this.setupMobileMenu()
    this.initImageZoom()
    this.setupHomeButton() 
  }

  setupDropdownStates() {
    const tahap1Pages = [
      "kartu-nama",
      "id-card-laser",
      "id-card-uv",
      "kartu-flazz-emoney-brizzi",
      "kiss-cutting",
      "die-cutting",
      "soft-cover",
      "hard-cover",
      "special-color-a3+",
      "outdoor",
      "indoor",
    ]

    const tahap2Pages = [
      "booklet",
      "cutting-stiker-meter",
      "stempel",
      "map-a4",
      "map-f4",
      "dtf",
      "mug",
      "custom-amplop",
      "ganci-pin-bulat",
    ]

    const awalPages = ["pengenalan", "ukuran-kertas", "super-detail-spk-invoice"]

    this.removeAllActiveStates()

    if (tahap1Pages.includes(this.currentPage)) {
      this.setActiveDropdown("tutorial-dropdown")
      this.setActiveLink(this.currentPage)
    } else if (tahap2Pages.includes(this.currentPage)) {
      this.setActiveDropdown("tutorial-tahap2-dropdown")
      this.setActiveLink(this.currentPage)
    } else if (awalPages.includes(this.currentPage)) {
      this.setActiveDropdown("home-dropdown")
      this.setActiveLink(this.currentPage)
    }

    this.updateArrows()
  }

  removeAllActiveStates() {
    const dropdowns = document.querySelectorAll(".dropdown-content")
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("active")
    })

    const links = document.querySelectorAll(".dropdown-content a")
    links.forEach((link) => {
      link.classList.remove("active-link")
    })
  }

  setActiveDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId)
    if (dropdown) {
      dropdown.classList.add("active")
    }
  }

  setActiveLink(pageName) {
    const links = document.querySelectorAll(".dropdown-content a")
    links.forEach((link) => {
      const href = link.getAttribute("href")
      if (href && href.includes(pageName)) {
        link.classList.add("active-link")
      }
    })
  }

  updateArrows() {
    const dropdowns = document.querySelectorAll(".dropdown")
    dropdowns.forEach((dropdown) => {
      const header = dropdown.querySelector(".nav-header")
      const content = dropdown.querySelector(".dropdown-content")
      const arrow = header.querySelector(".arrow")

      if (content && arrow) {
        if (content.classList.contains("active")) {
          arrow.style.transform = "rotate(180deg)"
        } else {
          arrow.style.transform = "rotate(0deg)"
        }
      }
    })
  }

  setupEventListeners() {
    document.querySelectorAll(".dropdown-content a").forEach((link) => {
      link.addEventListener("click", function (e) {
        this.style.opacity = "0.7"
        setTimeout(() => {
          this.style.opacity = "1"
        }, 200)

        if (window.innerWidth <= 768) {
          setTimeout(() => window.navManager.closeMobileMenu(), 300)
        }
      })
    })
  }

  setupMobileMenu() {
    if (!document.querySelector(".mobile-menu-btn")) {
      const mobileMenuBtn = document.createElement("button")
      mobileMenuBtn.className = "mobile-menu-btn"
      mobileMenuBtn.innerHTML = "☰"
      mobileMenuBtn.setAttribute("aria-label", "Toggle menu")
      mobileMenuBtn.onclick = () => this.toggleMobileMenu()
      document.body.appendChild(mobileMenuBtn)
    }

    if (!document.querySelector(".mobile-overlay")) {
      const mobileOverlay = document.createElement("div")
      mobileOverlay.className = "mobile-overlay"
      mobileOverlay.onclick = () => this.closeMobileMenu()
      document.body.appendChild(mobileOverlay)
    }

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        this.closeMobileMenu()
      }
    })

    window.addEventListener("orientationchange", () => {
      setTimeout(() => {
        if (window.innerWidth > 768) {
          this.closeMobileMenu()
        }
      }, 100)
    })
  }

  toggleMobileMenu() {
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

  closeMobileMenu() {
    const sidebar = document.querySelector(".sidebar")
    const overlay = document.querySelector(".mobile-overlay")

    sidebar.classList.remove("active")
    overlay.classList.remove("active")
    document.body.style.overflow = "auto"
  }

  toggleDropdown(dropdownId) {
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

  initImageZoom() {
    if (!document.getElementById("imageModal")) {
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
    }

    const modal = document.getElementById("imageModal")
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

  setActiveSection(section) {
    this.removeAllActiveStates()

    switch (section) {
      case "tahap1":
        this.setActiveDropdown("tutorial-dropdown")
        break
      case "tahap2":
        this.setActiveDropdown("tutorial-tahap2-dropdown")
        break
      case "awal":
        this.setActiveDropdown("home-dropdown")
        break
    }

    this.updateArrows()
  }

  setupHomeButton() {
    const homeButton = document.getElementById("homeButton")
    if (homeButton) {
      homeButton.addEventListener("click", function (e) {
        const ripple = document.createElement("span")
        const rect = this.getBoundingClientRect()
        const size = Math.max(rect.width, rect.height)
        const x = e.clientX - rect.left - size / 2
        const y = e.clientY - rect.top - size / 2

        ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        opacity: 0.7;
        pointer-events: none;
        z-index: 10;
      `

        this.style.position = "relative"
        this.style.overflow = "hidden"
        this.appendChild(ripple)

        setTimeout(() => {
          ripple.remove()
        }, 300)
      })

      homeButton.setAttribute("tabindex", "0")
      homeButton.setAttribute("role", "button")
    }
  }
}

function toggleDropdown(dropdownId) {
  if (window.navManager) {
    window.navManager.toggleDropdown(dropdownId)
  }
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

document.addEventListener("DOMContentLoaded", () => {
  window.navManager = new NavigationManager()
})

document.addEventListener("visibilitychange", () => {
  if (!document.hidden && window.navManager) {
    window.navManager.setupDropdownStates()
  }
})
