import { useEffect } from "react";

export default function CameraPopUpEffect() {
  useEffect(() => {
    const handleGlobalClick = (e) => {
      try {
        const target = e.target;
        if (!target) return;

        const isInteractive = target.closest(
          'button, a, input, select, textarea, img, video, audio, iframe, form, .retro-window-card, .event-btn, .uiverse-submit-btn, .lightbox, .admin-panel, .nav-links, .social-icon, .filter-chip, [role="button"], [tabindex]:not([tabindex="-1"])'
        );

        if (isInteractive) return;

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

        const popupSize = 120;
        const container = document.createElement("div");
        container.className = "native-camera-popup";
        container.style.cssText = `
          position: fixed;
          left: ${clientX - popupSize / 2}px;
          top: ${clientY - popupSize / 2}px;
          width: ${popupSize}px;
          height: ${popupSize}px;
          pointer-events: none;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
          filter: drop-shadow(0 0 16px rgba(201, 169, 110, 0.6));
        `;

        container.innerHTML = `
          <div class="camera-pop-inner">
            <svg width="68" height="68" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="11" width="30" height="22" rx="5" fill="#18181C" stroke="#C9A96E" stroke-width="2.5"/>
              <path d="M14 11V8C14 6.89543 14.8954 6 16 6H24C25.1046 6 26 6.89543 26 8V11" fill="#1F1F24" stroke="#C9A96E" stroke-width="2.5"/>
              <circle cx="9" cy="15" r="1.8" fill="#E8C98A"/>
              <circle cx="20" cy="22" r="7.5" stroke="#E8C98A" stroke-width="2.5"/>
              <circle cx="20" cy="22" r="3.5" fill="#C9A96E"/>
              <circle cx="22" cy="20" r="1" fill="#FFFFFF"/>
            </svg>
            <div class="burst-rays">
              <span style="--r: 0deg"></span>
              <span style="--r: 45deg"></span>
              <span style="--r: 90deg"></span>
              <span style="--r: 135deg"></span>
              <span style="--r: 180deg"></span>
              <span style="--r: 225deg"></span>
              <span style="--r: 270deg"></span>
              <span style="--r: 315deg"></span>
            </div>
          </div>
        `;

        document.body.appendChild(container);

        setTimeout(() => {
          container.classList.add("fade-out");
          setTimeout(() => {
            if (container.parentNode) {
              container.parentNode.removeChild(container);
            }
          }, 350);
        }, 850);
      } catch (err) {
        console.warn("Camera pop-up effect note:", err);
      }
    };

    window.addEventListener("mousedown", handleGlobalClick);

    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
    };
  }, []);

  return null;
}
