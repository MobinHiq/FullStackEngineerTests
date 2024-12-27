import React, { useEffect, useState } from 'react';
import anime from 'animejs';
import './StarBackground.css';

const StarBackground = () => {
  const [dimensions, setDimensions] = useState({
    num: 60,
    vw: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    vh: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
  });

  const getRandomX = () => Math.floor(Math.random() * Math.floor(dimensions.vw)).toString();
  const getRandomY = () => Math.floor(Math.random() * Math.floor(dimensions.vh)).toString();
  const randomRadius = () => Math.random() * 0.7 + 0.6;

  const starryNight = () => {
    anime({
      targets: '#sky .star',
      opacity: 1,
      duration: 0,
      complete: () => {
        const stars = document.querySelectorAll('#sky .star');
        stars.forEach(star => {
          if (Math.random() > 0.7) {
            anime({
              targets: star,
              opacity: [
                { value: 1, duration: 0 },
                { value: 0, duration: 50 },
                { value: 1, duration: 50 }
              ],
              easing: 'linear',
              delay: anime.random(0, 5000),
              loop: true
            });
          }
        });
      }
    });
  };

  const shootingStars = () => {
    anime({
      targets: '#shootingstars .wish',
      easing: 'easeOutExpo',
      loop: true,
      delay: (el, i) => 1000 * i,
      duration: 1000,
      opacity: [
        { value: 0, duration: 0 },
        { value: 1, duration: 100 },
        { value: 0.5, duration: 100 },
        { value: 0, duration: 100 }
      ],
      translateX: {
        value: 350,
        duration: 1000
      },
      translateY: {
        value: 100,
        duration: 1000
      },
      scale: [
        { value: 1, duration: 0 },
        { value: 0.1, duration: 1000 }
      ]
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setDimensions(prevDimensions => ({
        ...prevDimensions,
        vw: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        vh: Math.max(document.documentElement.clientHeight, window.innerHeight || 0)
      }));
    };

    window.addEventListener('resize', handleResize);
    starryNight();
    shootingStars();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="App">
      <svg 
        id="sky"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: `
            radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%),
            linear-gradient(
              to bottom,
              rgba(255, 0, 255, 0.2) 0%,
              rgba(37, 37, 179, 0.2) 50%,
              rgba(0, 0, 0, 0.5) 100%
            )
          `
        }}
      >
        {[...Array(dimensions.num)].map((_, index) => (
          <circle
            key={index}
            cx={getRandomX()}
            cy={getRandomY()}
            r={randomRadius()}
            stroke="none"
            strokeWidth="0"
            fill="white"
            className="star"
          />
        ))}
      </svg>
      <div id="shootingstars">
        {[...Array(60)].map((_, index) => (
          <div
            key={index}
            className="wish"
            style={{
              left: `${getRandomY()}px`,
              top: `${getRandomX()}px`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default StarBackground; 