import { useState, useEffect, useRef } from "react";

export default function EventTimelineTrack({ events, staticIcons, navigate, generateSlug, siteConfig }) {
  const sectionRef = useRef(null);
  const mobileWrapRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth <= 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Events list sorted by order (latest first)
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
      date: 'FULL ARCHIVE',
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

  // Mobile / Tablet active card detection on vertical scroll
  useEffect(() => {
    if (!isMobile) return;

    const handleMobileScroll = () => {
      if (!mobileWrapRef.current) return;
      const cards = mobileWrapRef.current.querySelectorAll('.mobile-card-wrapper');
      const viewportCenter = window.innerHeight * 0.45;
      let closestIdx = 0;
      let minDistance = Infinity;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setMobileActiveIndex(closestIdx);
    };

    window.addEventListener("scroll", handleMobileScroll, { passive: true });
    handleMobileScroll();
    return () => window.removeEventListener("scroll", handleMobileScroll);
  }, [isMobile, allTrackItems.length]);

  // Restore scroll position when returning from an event detail view
  useEffect(() => {
    const savedPos = sessionStorage.getItem("cc_events_timeline_scroll");
    if (savedPos) {
      const targetY = parseFloat(savedPos);
      
      const restoreScroll = () => {
        window.scrollTo({ top: targetY, behavior: 'instant' });
      };

      restoreScroll();
      const t1 = setTimeout(restoreScroll, 50);
      const t2 = setTimeout(() => {
        restoreScroll();
        sessionStorage.removeItem("cc_events_timeline_scroll");
      }, 180);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, []);

  const totalItems = allTrackItems.length;
  const activeIndex = Math.min(
    Math.floor(scrollProgress * totalItems),
    totalItems - 1
  );

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
          <p className="timeline-sub">Scroll down to move along the timeline track and discover our college events — click <strong>DIVE IN</strong> to get back to the event's memories.</p>
        </div>

        {isMobile ? (
          /* MOBILE & TABLET VERTICAL SCROLL TIMELINE TRACK */
          <div className="mobile-timeline-wrap" ref={mobileWrapRef}>
            <div className="mobile-track-line">
              <div 
                className="mobile-track-progress" 
                style={{ height: `${((mobileActiveIndex + 1) / totalItems) * 100}%` }}
              ></div>
            </div>

            <div className="mobile-cards-list">
              {allTrackItems.map((item, idx) => {
                const isActive = idx === mobileActiveIndex;
                const isPassed = idx <= mobileActiveIndex;
                const logoUrl = (item.iconUrl && item.iconUrl.trim().startsWith('http')) 
                  ? item.iconUrl.trim() 
                  : (staticIcons && staticIcons[item.id] && staticIcons[item.id].trim().startsWith('http') ? staticIcons[item.id].trim() : null);
                const itemColor = item.color || "var(--gold)";

                return (
                  <div 
                    key={item.id || idx}
                    className={`mobile-card-wrapper ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}
                    style={{ "--item-color": itemColor }}
                  >
                    <div className={`mobile-station-node ${isActive ? 'active' : ''} ${isPassed ? 'passed' : ''}`}>
                      <div className="station-ring"></div>
                    </div>
                    <div className="mobile-connector-line"></div>

                    <div className="retro-window-card mobile-card">
                      <div className="window-header" style={{ background: itemColor }}>
                        <div className="window-dots"><span></span><span></span><span></span></div>
                      </div>
                      
                      <div className="window-body">
                        {item.type !== 'archive' && item.date && (
                          <div className="window-date-badge">
                            <span className="date-text">🗓️ {item.date}</span>
                          </div>
                        )}

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
                            disabled={!isActive}
                            onClick={() => {
                              if (!isActive) return;
                              sessionStorage.setItem("cc_events_timeline_scroll", window.scrollY.toString());
                              if (item.type === 'archive') {
                                navigate('/events-gallery');
                              } else if (item.comingSoon) {
                                alert("Coming Soon!");
                              } else {
                                navigate(`/events/${item.slug || generateSlug(item.name)}`);
                              }
                            }}
                          >
                            {item.type === 'archive' ? 'Open Archive' : (item.comingSoon ? 'Coming Soon' : 'DIVE IN')}
                          </button>
                        </div>
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
                          <div className="window-dots"><span></span><span></span><span></span></div>
                        </div>
                        
                        <div className="window-body">
                          {item.type !== 'archive' && item.date && (
                            <div className="window-date-badge">
                              <span className="date-text">🗓️ {item.date}</span>
                            </div>
                          )}

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
                              disabled={!isActive}
                              onClick={() => {
                                if (!isActive) return;
                                sessionStorage.setItem("cc_events_timeline_scroll", window.scrollY.toString());
                                if (item.type === 'archive') {
                                  navigate('/events-gallery');
                                } else if (item.comingSoon) {
                                  alert("Coming Soon!");
                                } else {
                                  navigate(`/events/${item.slug || generateSlug(item.name)}`);
                                }
                              }}
                            >
                              {item.type === 'archive' ? 'Open Archive' : (item.comingSoon ? 'Coming Soon' : 'DIVE IN')}
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
