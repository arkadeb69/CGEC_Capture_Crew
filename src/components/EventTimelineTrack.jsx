import { useState, useEffect, useRef } from "react";

function parseEventDate(dateStr) {
  if (!dateStr) return { day: '10', month: 'AUG', year: '2026' };
  const str = dateStr.toString().trim();
  const parts = str.split(/\s+/);
  
  if (parts.length >= 3) {
    const day = parts[0].replace(/[^0-9]/g, '') || '10';
    const month = parts[1].substring(0, 3).toUpperCase();
    const year = parts[2] || '2026';
    return { day: day.padStart(2, '0'), month, year };
  } else if (parts.length === 2) {
    const month = parts[0].substring(0, 3).toUpperCase();
    const year = parts[1] || '2026';
    return { day: '15', month, year };
  }
  return { day: '01', month: str.substring(0, 3).toUpperCase(), year: '2026' };
}

export default function EventTimelineTrack({ events, staticIcons, navigate, generateSlug, siteConfig }) {
  const sectionRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 768 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Events list sorted latest first
  const displayEvents = [...events].sort((a, b) => (a.order || 99) - (b.order || 99));

  // Add Universal Archive as final destination on the track
  const allTrackItems = [
    ...displayEvents.map(e => ({ type: 'event', ...e })),
    {
      id: 'archive-global',
      type: 'archive',
      name: 'Event Archive',
      subtitle: 'Universal Gallery',
      desc: 'Explore every capture from every event we\'ve ever hosted, all in one immersive timeline.',
      date: 'FULL ARCHIVE 2026',
      color: '#C9A96E',
      emoji: '📂',
      highlight: '✨ IMMERSIVE VIEW'
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const totalScrollableHeight = rect.height - windowHeight;
      if (totalScrollableHeight <= 0) return;

      const currentScroll = -rect.top;
      let progress = currentScroll / totalScrollableHeight;
      progress = Math.max(0, Math.min(1, progress));
      
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalItems = allTrackItems.length;
  const activeIndex = Math.min(
    Math.floor(scrollProgress * totalItems),
    totalItems - 1
  );
  const currentActiveItem = allTrackItems[Math.max(0, activeIndex)];

  // Card spacing & translation for desktop sticky horizontal track
  const cardSpacing = 360;
  const totalTrackWidth = (totalItems - 1) * cardSpacing;
  const translateX = scrollProgress * totalTrackWidth;

  return (
    <div 
      className="timeline-section-sticky-wrapper" 
      ref={sectionRef} 
      style={{ height: isMobile ? 'auto' : `${Math.max(500, totalItems * 85)}vh` }}
    >
      <div className="timeline-sticky-container">
        <div className="timeline-header-wrap fade-in">
          <div className="section-label">✧ Interactive Journey</div>
          <h3 className="timeline-title">Event <em>Timeline Track</em></h3>
          <p className="timeline-sub">Scroll down to move along the timeline track and discover our college events.</p>
        </div>

        {isMobile ? (
          /* MOBILE VERTICAL TRACK */
          <div className="mobile-timeline-wrap">
            <div className="mobile-track-line">
              <div 
                className="mobile-track-progress" 
                style={{ height: `${scrollProgress * 100}%` }}
              ></div>
              <div 
                className="mobile-car-marker" 
                style={{ top: `${scrollProgress * 100}%` }}
              >
                <div className="car-vehicle">🚘</div>
                <div className="car-date-badge">{currentActiveItem?.date || "2026"}</div>
              </div>
            </div>

            <div className="mobile-cards-list">
              {allTrackItems.map((item, idx) => {
                const isActive = idx === activeIndex;
                const isPassed = idx <= activeIndex;
                const dateParsed = parseEventDate(item.date);
                const logoUrl = (item.iconUrl && item.iconUrl.trim().startsWith('http')) 
                  ? item.iconUrl.trim() 
                  : (staticIcons && staticIcons[item.id] && staticIcons[item.id].trim().startsWith('http') ? staticIcons[item.id].trim() : null);
                const itemColor = item.color || "var(--gold)";

                return (
                  <div 
                    key={item.id || idx}
                    className={`retro-window-card mobile-card ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    style={{ "--item-color": itemColor }}
                  >
                    <div className="window-header" style={{ background: itemColor }}>
                      <span className="window-platform-label">PLATFORM 0{idx + 1}</span>
                      <div className="window-dots"><span></span><span></span><span></span></div>
                    </div>
                    
                    <div className="window-body">
                      <div className="window-date-badge">
                        <div className="date-day">{dateParsed.day}</div>
                        <div className="date-month-wrap">
                          <div className="date-month">{dateParsed.month}</div>
                          <div className="date-year">{dateParsed.year}</div>
                        </div>
                      </div>

                      <div className="window-title-row">
                        {logoUrl ? (
                          <img src={logoUrl} alt={item.name} className="window-logo" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="window-emoji">{item.emoji || '📸'}</span>
                        )}
                        <h4 className="window-title">{item.name}</h4>
                      </div>

                      <div className="window-subtitle" style={{ color: itemColor }}>{item.subtitle}</div>
                      <p className="window-desc">{item.desc}</p>
                      {item.highlight && <div className="window-highlight">{item.highlight}</div>}

                      <div className="window-footer">
                        <button 
                          className="window-dive-btn"
                          style={{ background: itemColor }}
                          onClick={() => {
                            if (item.type === 'archive') {
                              navigate('/events-gallery');
                            } else if (item.comingSoon) {
                              alert("Coming Soon!");
                            } else {
                              navigate(`/events/${item.slug || generateSlug(item.name)}`);
                            }
                          }}
                        >
                          {item.type === 'archive' ? 'Open Archive 📂' : (item.comingSoon ? 'Coming Soon ⏳' : 'DIVE IN 🚀')}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* DESKTOP HORIZONTAL STAGGERED SCROLL TRACK */
          <div className="desktop-timeline-viewport">
            <div className="timeline-track-stage">
              
              {/* CENTRAL HORIZONTAL TRACK LINE */}
              <div className="central-track-line">
                <div className="track-line-bg"></div>
                <div 
                  className="track-line-fill" 
                  style={{ width: `${translateX + 180}px` }}
                ></div>

                {/* MOVING VEHICLE */}
                <div 
                  className="moving-vehicle-box"
                  style={{ left: `${translateX + 120}px` }}
                >
                  <div className="vehicle-sprite">🚂</div>
                  <div className="vehicle-date-tag">{currentActiveItem?.date || "2026"}</div>
                </div>

                {/* STATION NODES ON THE LINE */}
                {allTrackItems.map((item, idx) => {
                  const nodeLeft = idx * cardSpacing + 120;
                  const isPassed = idx <= activeIndex;
                  const isActive = idx === activeIndex;

                  return (
                    <div 
                      key={`node-${item.id || idx}`}
                      className={`track-station-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                      style={{ left: `${nodeLeft}px`, "--item-color": item.color || "var(--gold)" }}
                    >
                      <div className="station-ring"></div>
                    </div>
                  );
                })}
              </div>

              {/* HORIZONTALLY SCROLLING CARDS SLIDER */}
              <div 
                className="horizontal-cards-slider"
                style={{ transform: `translateX(${-translateX + 180}px)` }}
              >
                {allTrackItems.map((item, idx) => {
                  const isTop = idx % 2 === 0;
                  const isActive = idx === activeIndex;
                  const isPassed = idx <= activeIndex;
                  const isNear = Math.abs(idx - activeIndex) <= 3;
                  const dateParsed = parseEventDate(item.date);
                  const logoUrl = (item.iconUrl && item.iconUrl.trim().startsWith('http')) 
                    ? item.iconUrl.trim() 
                    : (staticIcons && staticIcons[item.id] && staticIcons[item.id].trim().startsWith('http') ? staticIcons[item.id].trim() : null);
                  const itemColor = item.color || "var(--gold)";

                  return (
                    <div 
                      key={item.id || idx}
                      className={`timeline-node-card-wrap ${isTop ? 'pos-top' : 'pos-bottom'} ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''} ${isNear ? 'near' : 'far'}`}
                      style={{ 
                        left: `${idx * cardSpacing + 120}px`,
                        "--item-color": itemColor
                      }}
                    >
                      {/* CONNECTING LINE TO TRACK NODE */}
                      <div className="connector-line"></div>

                      {/* RETRO WINDOW CARD */}
                      <div className="retro-window-card">
                        <div className="window-header" style={{ background: itemColor }}>
                          <span className="window-platform-label">PLATFORM 0{idx + 1}</span>
                          <div className="window-dots"><span></span><span></span><span></span></div>
                        </div>
                        
                        <div className="window-body">
                          <div className="window-date-badge">
                            <div className="date-day">{dateParsed.day}</div>
                            <div className="date-month-wrap">
                              <div className="date-month">{dateParsed.month}</div>
                              <div className="date-year">{dateParsed.year}</div>
                            </div>
                          </div>

                          <div className="window-title-row">
                            {logoUrl ? (
                              <img src={logoUrl} alt={item.name} className="window-logo" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="window-emoji">{item.emoji || '📸'}</span>
                            )}
                            <h4 className="window-title">{item.name}</h4>
                          </div>

                          <div className="window-subtitle" style={{ color: itemColor }}>{item.subtitle}</div>
                          <p className="window-desc">{item.desc}</p>
                          {item.highlight && <div className="window-highlight">{item.highlight}</div>}

                          <div className="window-footer">
                            <button 
                              className="window-dive-btn"
                              style={{ background: itemColor }}
                              onClick={() => {
                                if (item.type === 'archive') {
                                  navigate('/events-gallery');
                                } else if (item.comingSoon) {
                                  alert("Coming Soon!");
                                } else {
                                  navigate(`/events/${item.slug || generateSlug(item.name)}`);
                                }
                              }}
                            >
                              {item.type === 'archive' ? 'Open Archive 📂' : (item.comingSoon ? 'Coming Soon ⏳' : 'DIVE IN 🚀')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
