import { useEffect } from "react";
import cameraData from "../assets/camera-popup.json";

export default function CameraPopUpEffect() {
  useEffect(() => {
    let lottieModule = null;

    // Load lottie-web asynchronously so it never blocks page load or React rendering
    import("lottie-web")
      .then((m) => {
        lottieModule = m.default || m;
      })
      .catch((err) => {
        console.warn("Lottie failed to load:", err);
      });

    const handleGlobalClick = (e) => {
      try {
        const target = e.target;
        if (!target) return;

        const isInteractive = target.closest(
          'button, a, input, select, textarea, img, video, audio, iframe, form, .retro-window-card, .event-btn, .uiverse-submit-btn, .lightbox, .admin-panel, .nav-links, .social-icon, .filter-chip, [role="button"], [tabindex]:not([tabindex="-1"])'
        );

        if (isInteractive) return;

        if (e.type === 'contextmenu') {
          e.preventDefault();
        }

        const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : window.innerWidth / 2);
        const clientY = e.clientY || (e.touches && e.touches[0] ? e.touches[0].clientY : window.innerHeight / 2);

        const popupSize = 130;
        const container = document.createElement("div");
        container.className = "camera-popup-instance";
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
          filter: drop-shadow(0 0 12px rgba(201, 169, 110, 0.4));
          transition: opacity 0.3s ease, transform 0.3s ease;
        `;

        document.body.appendChild(container);

        if (lottieModule && typeof lottieModule.loadAnimation === "function") {
          const anim = lottieModule.loadAnimation({
            container: container,
            renderer: "svg",
            loop: false,
            autoplay: true,
            animationData: cameraData
          });

          const removeInstance = () => {
            container.style.opacity = "0";
            container.style.transform = "scale(0.8)";
            setTimeout(() => {
              try {
                if (anim && typeof anim.destroy === "function") {
                  anim.destroy();
                }
                if (container.parentNode) {
                  container.parentNode.removeChild(container);
                }
              } catch (err) {}
            }, 300);
          };

          anim.addEventListener("complete", removeInstance);
          setTimeout(removeInstance, 2200);
        } else {
          // Fallback camera SVG pop while Lottie is loading
          container.innerHTML = `
            <svg width="60" height="60" viewBox="0 0 34 34" fill="none" stroke="#C9A96E" stroke-width="2">
              <rect x="4" y="7" width="26" height="22" rx="3"/>
              <line x1="4" y1="13" x2="30" y2="13"/>
              <circle cx="17" cy="20" r="5"/>
            </svg>
          `;
          setTimeout(() => {
            container.style.opacity = "0";
            container.style.transform = "scale(0.8)";
            setTimeout(() => {
              if (container.parentNode) container.parentNode.removeChild(container);
            }, 300);
          }, 800);
        }
      } catch (err) {
        console.warn("Camera pop-up effect error:", err);
      }
    };

    window.addEventListener("mousedown", handleGlobalClick);
    window.addEventListener("contextmenu", handleGlobalClick);

    return () => {
      window.removeEventListener("mousedown", handleGlobalClick);
      window.removeEventListener("contextmenu", handleGlobalClick);
    };
  }, []);

  return null;
}
